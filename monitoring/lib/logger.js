const fs = require('fs');
const path = require('path');

class MonitoringLogger {
  constructor() {
    this.baseDir = path.join(__dirname, '../logs');
    this.ensureDirectories();
  }

  ensureDirectories() {
    const dirs = ['security', 'quality', 'creative', 'health'];
    dirs.forEach(dir => {
      const fullPath = path.join(this.baseDir, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    });
  }

  log(agent, severity, category, issue, description, context = {}, autoFixed = false) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      agent,
      severity, // 'high', 'medium', 'low'
      category, // 'security', 'quality', 'creative', 'health'
      issue,
      description,
      auto_fixed: autoFixed,
      escalation_required: severity === 'high' && !autoFixed,
      context,
      session_id: this.generateSessionId()
    };

    // Write to category-specific log
    const logFile = path.join(this.baseDir, category, `${new Date().toISOString().split('T')[0]}.jsonl`);
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');

    // Also write to combined log
    const combinedFile = path.join(this.baseDir, `combined-${new Date().toISOString().split('T')[0]}.jsonl`);
    fs.appendFileSync(combinedFile, JSON.stringify(logEntry) + '\n');

    return logEntry;
  }

  success(agent, category, description, metrics = {}) {
    return this.log(agent, 'low', category, 'success', description, metrics, false);
  }

  warning(agent, category, issue, description, context = {}) {
    return this.log(agent, 'medium', category, issue, description, context, false);
  }

  error(agent, category, issue, description, context = {}) {
    return this.log(agent, 'high', category, issue, description, context, false);
  }

  autoFixed(agent, category, issue, description, fixDescription, context = {}) {
    const extendedContext = { ...context, fix_applied: fixDescription };
    return this.log(agent, 'medium', category, issue, description, extendedContext, true);
  }

  getRecentLogs(category = null, hours = 24) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    const logs = [];
    
    const searchDirs = category ? [category] : ['security', 'quality', 'creative', 'health'];
    
    searchDirs.forEach(dir => {
      const dirPath = path.join(this.baseDir, dir);
      if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath)
          .filter(f => f.endsWith('.jsonl'))
          .sort()
          .slice(-2); // Last 2 days
        
        files.forEach(file => {
          const filePath = path.join(dirPath, file);
          const content = fs.readFileSync(filePath, 'utf8');
          content.split('\n').filter(line => line.trim()).forEach(line => {
            try {
              const entry = JSON.parse(line);
              if (new Date(entry.timestamp) > since) {
                logs.push(entry);
              }
            } catch (e) {
              // Skip malformed lines
            }
          });
        });
      }
    });

    return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  getHealthStatus() {
    const recentLogs = this.getRecentLogs(null, 24);
    const now = new Date();
    
    const stats = {
      total_issues: recentLogs.length,
      critical_issues: recentLogs.filter(l => l.severity === 'high' && !l.auto_fixed).length,
      auto_fixed_issues: recentLogs.filter(l => l.auto_fixed).length,
      by_category: {},
      last_success_by_agent: {},
      escalation_required: recentLogs.filter(l => l.escalation_required).length
    };

    // Categorize issues
    ['security', 'quality', 'creative', 'health'].forEach(cat => {
      const categoryLogs = recentLogs.filter(l => l.category === cat);
      stats.by_category[cat] = {
        total: categoryLogs.length,
        critical: categoryLogs.filter(l => l.severity === 'high' && !l.auto_fixed).length,
        success: categoryLogs.filter(l => l.issue === 'success').length
      };
    });

    // Last successful run per agent
    ['security-monitor', 'quality-assurance', 'creative-innovation', 'code-health'].forEach(agent => {
      const successLogs = recentLogs.filter(l => l.agent === agent && l.issue === 'success');
      stats.last_success_by_agent[agent] = successLogs.length > 0 
        ? successLogs[0].timestamp 
        : null;
    });

    return stats;
  }

  generateSessionId() {
    return Math.random().toString(36).substr(2, 9);
  }

  // Clean up old logs (keep 30 days)
  cleanup() {
    const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const dirs = ['security', 'quality', 'creative', 'health'];
    
    dirs.forEach(dir => {
      const dirPath = path.join(this.baseDir, dir);
      if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath);
        files.forEach(file => {
          const filePath = path.join(dirPath, file);
          const stats = fs.statSync(filePath);
          if (stats.mtime < cutoffDate) {
            fs.unlinkSync(filePath);
          }
        });
      }
    });

    // Also clean combined logs
    const combinedFiles = fs.readdirSync(this.baseDir)
      .filter(f => f.startsWith('combined-') && f.endsWith('.jsonl'));
    
    combinedFiles.forEach(file => {
      const filePath = path.join(this.baseDir, file);
      const stats = fs.statSync(filePath);
      if (stats.mtime < cutoffDate) {
        fs.unlinkSync(filePath);
      }
    });
  }
}

module.exports = new MonitoringLogger();