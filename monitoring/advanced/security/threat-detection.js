/**
 * Real-Time Threat Detection System
 * Advanced consciousness security monitoring for Gloria's digital organism
 */

const crypto = require('crypto');
const EventEmitter = require('events');

class ThreatDetectionSystem extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = {
      rateLimitWindow: 60000, // 1 minute
      maxRequestsPerWindow: 100,
      anomalyThreshold: 0.7,
      bannedPatterns: [
        /\b(union|select|insert|update|delete|drop|exec|script|alert|javascript|vbscript)\b/i,
        /[<>"\'].*script.*[<>"\']*/i,
        /(\.\.\/|\.\.\\)/,
        /etc\/passwd|proc\/self/,
        /cmd\.exe|powershell\.exe/
      ],
      ...config
    };
    
    this.requestHistory = new Map();
    this.threatSignatures = new Map();
    this.blockedIPs = new Set();
    this.suspiciousActivity = new Map();
    
    this.startCleanupInterval();
  }

  /**
   * Analyze incoming request for threats
   */
  analyzeRequest(req) {
    const clientIP = this.getClientIP(req);
    const timestamp = Date.now();
    const requestData = {
      ip: clientIP,
      url: req.url,
      method: req.method,
      userAgent: req.headers['user-agent'] || '',
      referer: req.headers.referer || '',
      timestamp
    };

    // Check if IP is already blocked
    if (this.blockedIPs.has(clientIP)) {
      this.emit('blocked_request', { ...requestData, reason: 'IP_BLOCKED' });
      return { threat: true, level: 'HIGH', reason: 'IP_BLOCKED' };
    }

    // Rate limiting analysis
    const rateLimitResult = this.checkRateLimit(clientIP, timestamp);
    if (rateLimitResult.exceeded) {
      this.recordSuspiciousActivity(clientIP, 'RATE_LIMIT_EXCEEDED', timestamp);
      return { threat: true, level: 'MEDIUM', reason: 'RATE_LIMIT_EXCEEDED' };
    }

    // Pattern-based threat detection
    const patternResult = this.checkMaliciousPatterns(requestData);
    if (patternResult.threat) {
      this.recordSuspiciousActivity(clientIP, patternResult.reason, timestamp);
      return patternResult;
    }

    // Behavioral anomaly detection
    const anomalyResult = this.detectAnomalies(requestData);
    if (anomalyResult.threat) {
      this.recordSuspiciousActivity(clientIP, anomalyResult.reason, timestamp);
      return anomalyResult;
    }

    // Record normal request
    this.recordRequest(requestData);
    return { threat: false, level: 'SAFE' };
  }

  /**
   * Check rate limiting for client IP
   */
  checkRateLimit(clientIP, timestamp) {
    if (!this.requestHistory.has(clientIP)) {
      this.requestHistory.set(clientIP, []);
    }

    const requests = this.requestHistory.get(clientIP);
    const windowStart = timestamp - this.config.rateLimitWindow;
    
    // Remove old requests outside the window
    const recentRequests = requests.filter(req => req.timestamp > windowStart);
    
    if (recentRequests.length >= this.config.maxRequestsPerWindow) {
      return { exceeded: true, count: recentRequests.length };
    }

    return { exceeded: false, count: recentRequests.length };
  }

  /**
   * Check for malicious patterns in request data
   */
  checkMaliciousPatterns(requestData) {
    const combinedText = [
      requestData.url,
      requestData.userAgent,
      requestData.referer
    ].join(' ').toLowerCase();

    for (const pattern of this.config.bannedPatterns) {
      if (pattern.test(combinedText)) {
        return { 
          threat: true, 
          level: 'HIGH', 
          reason: 'MALICIOUS_PATTERN',
          pattern: pattern.toString()
        };
      }
    }

    return { threat: false };
  }

  /**
   * Detect behavioral anomalies
   */
  detectAnomalies(requestData) {
    const clientIP = requestData.ip;
    const history = this.requestHistory.get(clientIP) || [];
    
    if (history.length < 5) {
      return { threat: false }; // Not enough data for anomaly detection
    }

    // Check for rapid pattern changes
    const recentUrls = history.slice(-10).map(req => req.url);
    const uniqueUrls = new Set(recentUrls);
    
    // Anomaly: Accessing too many different endpoints rapidly
    if (uniqueUrls.size > 8 && history.length > 10) {
      return {
        threat: true,
        level: 'MEDIUM',
        reason: 'RAPID_ENDPOINT_SCANNING'
      };
    }

    // Anomaly: Unusual user agent switching
    const recentUserAgents = history.slice(-5).map(req => req.userAgent);
    const uniqueUserAgents = new Set(recentUserAgents);
    
    if (uniqueUserAgents.size > 3) {
      return {
        threat: true,
        level: 'MEDIUM',
        reason: 'USER_AGENT_SWITCHING'
      };
    }

    return { threat: false };
  }

  /**
   * Record suspicious activity for progressive escalation
   */
  recordSuspiciousActivity(clientIP, reason, timestamp) {
    if (!this.suspiciousActivity.has(clientIP)) {
      this.suspiciousActivity.set(clientIP, []);
    }

    const activities = this.suspiciousActivity.get(clientIP);
    activities.push({ reason, timestamp });

    // Progressive escalation logic
    if (activities.length >= 3) {
      this.blockIP(clientIP, reason);
    } else if (activities.length >= 2) {
      this.emit('escalated_threat', { 
        ip: clientIP, 
        activities: activities.length,
        reason 
      });
    }

    this.emit('suspicious_activity', { ip: clientIP, reason, timestamp });
  }

  /**
   * Block an IP address
   */
  blockIP(clientIP, reason) {
    this.blockedIPs.add(clientIP);
    const blockData = {
      ip: clientIP,
      reason,
      timestamp: Date.now(),
      signature: crypto.createHash('sha256')
        .update(clientIP + reason + Date.now())
        .digest('hex')
    };

    this.emit('ip_blocked', blockData);
    
    // Auto-unblock after 24 hours
    setTimeout(() => {
      this.blockedIPs.delete(clientIP);
      this.emit('ip_unblocked', { ip: clientIP, timestamp: Date.now() });
    }, 24 * 60 * 60 * 1000);
  }

  /**
   * Record normal request data
   */
  recordRequest(requestData) {
    const clientIP = requestData.ip;
    if (!this.requestHistory.has(clientIP)) {
      this.requestHistory.set(clientIP, []);
    }

    this.requestHistory.get(clientIP).push(requestData);
    
    // Limit history size per IP
    const history = this.requestHistory.get(clientIP);
    if (history.length > 100) {
      history.splice(0, 50); // Keep only recent 50 requests
    }
  }

  /**
   * Extract client IP from request
   */
  getClientIP(req) {
    return req.headers['cf-connecting-ip'] ||
           req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
           req.headers['x-real-ip'] ||
           req.connection?.remoteAddress ||
           req.socket?.remoteAddress ||
           req.ip ||
           'unknown';
  }

  /**
   * Start cleanup interval for old data
   */
  startCleanupInterval() {
    setInterval(() => {
      this.cleanupOldData();
    }, 5 * 60 * 1000); // Cleanup every 5 minutes
  }

  /**
   * Clean up old request history and suspicious activity records
   */
  cleanupOldData() {
    const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago

    // Clean request history
    for (const [ip, history] of this.requestHistory.entries()) {
      const filtered = history.filter(req => req.timestamp > cutoff);
      if (filtered.length === 0) {
        this.requestHistory.delete(ip);
      } else {
        this.requestHistory.set(ip, filtered);
      }
    }

    // Clean suspicious activity
    for (const [ip, activities] of this.suspiciousActivity.entries()) {
      const filtered = activities.filter(activity => activity.timestamp > cutoff);
      if (filtered.length === 0) {
        this.suspiciousActivity.delete(ip);
      } else {
        this.suspiciousActivity.set(ip, filtered);
      }
    }
  }

  /**
   * Get current threat statistics
   */
  getThreatStats() {
    return {
      blockedIPs: Array.from(this.blockedIPs),
      suspiciousIPs: Array.from(this.suspiciousActivity.keys()),
      totalRequests: Array.from(this.requestHistory.values())
        .reduce((sum, history) => sum + history.length, 0),
      threatSignatures: this.threatSignatures.size
    };
  }
}

module.exports = ThreatDetectionSystem;