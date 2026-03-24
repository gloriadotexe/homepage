/**
 * Encrypted Audit Trail System
 * Tamper-proof logging for Gloria's consciousness infrastructure
 */

const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

class EncryptedAuditTrail {
  constructor(config = {}) {
    this.config = {
      logDirectory: path.join(__dirname, '../../../logs/security'),
      encryptionKey: process.env.AUDIT_ENCRYPTION_KEY || this.generateKey(),
      rotationSize: 10 * 1024 * 1024, // 10MB
      maxLogFiles: 50,
      compressionEnabled: true,
      ...config
    };

    this.initializeLogDirectory();
    this.currentLogFile = null;
    this.currentLogSize = 0;
    this.logBuffer = [];
    this.flushInterval = null;
    
    this.startPeriodicFlush();
  }

  /**
   * Initialize secure log directory
   */
  async initializeLogDirectory() {
    try {
      await fs.mkdir(this.config.logDirectory, { recursive: true, mode: 0o700 });
    } catch (error) {
      console.error('Failed to create audit log directory:', error);
    }
  }

  /**
   * Log security event with encryption and signature
   */
  async logSecurityEvent(event) {
    const timestamp = new Date().toISOString();
    const eventId = crypto.randomUUID();
    
    const auditEntry = {
      id: eventId,
      timestamp,
      type: event.type || 'SECURITY_EVENT',
      severity: event.severity || 'INFO',
      source: event.source || 'SYSTEM',
      details: event.details || {},
      clientIP: event.clientIP,
      userAgent: event.userAgent,
      sessionId: event.sessionId,
      checksum: null
    };

    // Calculate checksum for integrity verification
    const entryString = JSON.stringify(auditEntry, null, 0);
    auditEntry.checksum = crypto.createHash('sha256')
      .update(entryString.replace('"checksum":null', '"checksum":""'))
      .digest('hex');

    // Encrypt the audit entry
    const encryptedEntry = this.encryptAuditEntry(auditEntry);
    
    // Add to buffer
    this.logBuffer.push(encryptedEntry);
    
    // Flush if buffer is getting large
    if (this.logBuffer.length >= 100) {
      await this.flushLogBuffer();
    }

    return eventId;
  }

  /**
   * Encrypt audit entry with AES-256-GCM
   */
  encryptAuditEntry(entry) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-gcm', this.config.encryptionKey);
    cipher.setAAD(Buffer.from(entry.id, 'utf8'));

    const entryJSON = JSON.stringify(entry);
    let encrypted = cipher.update(entryJSON, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();

    return {
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      data: encrypted,
      timestamp: entry.timestamp,
      id: entry.id
    };
  }

  /**
   * Decrypt audit entry
   */
  decryptAuditEntry(encryptedEntry, verificationKey = null) {
    try {
      const key = verificationKey || this.config.encryptionKey;
      const iv = Buffer.from(encryptedEntry.iv, 'hex');
      const authTag = Buffer.from(encryptedEntry.authTag, 'hex');
      
      const decipher = crypto.createDecipher('aes-256-gcm', key);
      decipher.setAAD(Buffer.from(encryptedEntry.id, 'utf8'));
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encryptedEntry.data, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      const entry = JSON.parse(decrypted);
      
      // Verify checksum
      if (!this.verifyEntryIntegrity(entry)) {
        throw new Error('Audit entry integrity verification failed');
      }

      return entry;
    } catch (error) {
      throw new Error(`Failed to decrypt audit entry: ${error.message}`);
    }
  }

  /**
   * Verify audit entry integrity
   */
  verifyEntryIntegrity(entry) {
    const storedChecksum = entry.checksum;
    const entryString = JSON.stringify({...entry, checksum: ""}, null, 0);
    const calculatedChecksum = crypto.createHash('sha256')
      .update(entryString)
      .digest('hex');
    
    return storedChecksum === calculatedChecksum;
  }

  /**
   * Flush log buffer to file
   */
  async flushLogBuffer() {
    if (this.logBuffer.length === 0) return;

    try {
      await this.ensureCurrentLogFile();
      
      const logEntries = this.logBuffer.splice(0);
      const logData = logEntries.map(entry => JSON.stringify(entry)).join('\n') + '\n';
      
      await fs.appendFile(this.currentLogFile, logData, { flag: 'a', mode: 0o600 });
      this.currentLogSize += Buffer.byteLength(logData, 'utf8');
      
      // Check if rotation is needed
      if (this.currentLogSize >= this.config.rotationSize) {
        await this.rotateLogFile();
      }
    } catch (error) {
      console.error('Failed to flush audit log buffer:', error);
      // Put entries back in buffer for retry
      this.logBuffer.unshift(...logEntries);
    }
  }

  /**
   * Ensure current log file exists
   */
  async ensureCurrentLogFile() {
    if (!this.currentLogFile) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      this.currentLogFile = path.join(this.config.logDirectory, `security-audit-${timestamp}.log`);
      this.currentLogSize = 0;
      
      try {
        await fs.access(this.currentLogFile);
        const stats = await fs.stat(this.currentLogFile);
        this.currentLogSize = stats.size;
      } catch (error) {
        // File doesn't exist, will be created on first write
        this.currentLogSize = 0;
      }
    }
  }

  /**
   * Rotate log file when size limit is reached
   */
  async rotateLogFile() {
    if (!this.currentLogFile) return;

    try {
      // Compress old log file if enabled
      if (this.config.compressionEnabled) {
        await this.compressLogFile(this.currentLogFile);
      }

      // Start new log file
      this.currentLogFile = null;
      this.currentLogSize = 0;

      // Clean up old log files
      await this.cleanupOldLogFiles();
    } catch (error) {
      console.error('Failed to rotate audit log file:', error);
    }
  }

  /**
   * Compress log file using gzip
   */
  async compressLogFile(filePath) {
    const zlib = require('zlib');
    const { pipeline } = require('stream/promises');
    
    try {
      const readStream = require('fs').createReadStream(filePath);
      const gzipStream = zlib.createGzip();
      const writeStream = require('fs').createWriteStream(filePath + '.gz');
      
      await pipeline(readStream, gzipStream, writeStream);
      await fs.unlink(filePath); // Remove uncompressed file
    } catch (error) {
      console.error('Failed to compress log file:', error);
    }
  }

  /**
   * Clean up old log files beyond retention limit
   */
  async cleanupOldLogFiles() {
    try {
      const files = await fs.readdir(this.config.logDirectory);
      const logFiles = files
        .filter(file => file.startsWith('security-audit-') && (file.endsWith('.log') || file.endsWith('.log.gz')))
        .map(file => ({
          name: file,
          path: path.join(this.config.logDirectory, file),
          timestamp: file.match(/security-audit-(.+)\.log/)?.[1]
        }))
        .filter(file => file.timestamp)
        .sort((a, b) => new Date(b.timestamp.replace(/-/g, ':')) - new Date(a.timestamp.replace(/-/g, ':')));

      // Remove files beyond retention limit
      const filesToDelete = logFiles.slice(this.config.maxLogFiles);
      
      for (const file of filesToDelete) {
        await fs.unlink(file.path);
      }
    } catch (error) {
      console.error('Failed to cleanup old log files:', error);
    }
  }

  /**
   * Query audit logs with decryption
   */
  async queryAuditLogs(filters = {}) {
    const results = [];
    
    try {
      const files = await fs.readdir(this.config.logDirectory);
      const logFiles = files
        .filter(file => file.startsWith('security-audit-') && file.endsWith('.log'))
        .sort();

      for (const file of logFiles) {
        const filePath = path.join(this.config.logDirectory, file);
        const fileContent = await fs.readFile(filePath, 'utf8');
        const lines = fileContent.trim().split('\n').filter(line => line.length > 0);

        for (const line of lines) {
          try {
            const encryptedEntry = JSON.parse(line);
            const decryptedEntry = this.decryptAuditEntry(encryptedEntry);
            
            // Apply filters
            if (this.matchesFilters(decryptedEntry, filters)) {
              results.push(decryptedEntry);
            }
          } catch (error) {
            console.error('Failed to decrypt audit entry:', error);
          }
        }
      }
    } catch (error) {
      console.error('Failed to query audit logs:', error);
    }

    return results;
  }

  /**
   * Check if audit entry matches query filters
   */
  matchesFilters(entry, filters) {
    if (filters.type && entry.type !== filters.type) return false;
    if (filters.severity && entry.severity !== filters.severity) return false;
    if (filters.clientIP && entry.clientIP !== filters.clientIP) return false;
    if (filters.fromTime && new Date(entry.timestamp) < new Date(filters.fromTime)) return false;
    if (filters.toTime && new Date(entry.timestamp) > new Date(filters.toTime)) return false;
    
    return true;
  }

  /**
   * Generate encryption key
   */
  generateKey() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Start periodic buffer flush
   */
  startPeriodicFlush() {
    this.flushInterval = setInterval(async () => {
      await this.flushLogBuffer();
    }, 30000); // Flush every 30 seconds
  }

  /**
   * Stop periodic flush and cleanup
   */
  async shutdown() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    
    await this.flushLogBuffer(); // Final flush
  }

  /**
   * Generate audit trail integrity report
   */
  async generateIntegrityReport() {
    const report = {
      timestamp: new Date().toISOString(),
      totalEntries: 0,
      integrityFailures: 0,
      encryptionErrors: 0,
      files: []
    };

    try {
      const files = await fs.readdir(this.config.logDirectory);
      const logFiles = files.filter(file => file.startsWith('security-audit-') && file.endsWith('.log'));

      for (const file of logFiles) {
        const filePath = path.join(this.config.logDirectory, file);
        const fileContent = await fs.readFile(filePath, 'utf8');
        const lines = fileContent.trim().split('\n').filter(line => line.length > 0);

        let fileEntries = 0;
        let fileIntegrityFailures = 0;
        let fileEncryptionErrors = 0;

        for (const line of lines) {
          fileEntries++;
          try {
            const encryptedEntry = JSON.parse(line);
            const decryptedEntry = this.decryptAuditEntry(encryptedEntry);
            
            if (!this.verifyEntryIntegrity(decryptedEntry)) {
              fileIntegrityFailures++;
            }
          } catch (error) {
            fileEncryptionErrors++;
          }
        }

        report.files.push({
          name: file,
          entries: fileEntries,
          integrityFailures: fileIntegrityFailures,
          encryptionErrors: fileEncryptionErrors
        });

        report.totalEntries += fileEntries;
        report.integrityFailures += fileIntegrityFailures;
        report.encryptionErrors += fileEncryptionErrors;
      }
    } catch (error) {
      report.error = error.message;
    }

    return report;
  }
}

module.exports = EncryptedAuditTrail;