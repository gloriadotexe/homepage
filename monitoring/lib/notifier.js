const logger = require('./logger');

class NotificationSystem {
  constructor() {
    this.escalationThreshold = {
      security: 'high', // Any high-severity security issue escalates immediately
      quality: 'pattern', // Multiple medium issues or any high issue
      creative: 'never', // Creative failures are learning opportunities
      health: 'pattern', // Declining trends or critical failures
    };

    this.patternTracking = new Map(); // Track issue patterns for escalation
  }

  async handleLogEntry(logEntry) {
    const { agent, severity, category, issue, escalation_required } = logEntry;

    // Immediate escalation for critical security issues
    if (escalation_required && category === 'security') {
      await this.escalateToMainSession(logEntry, 'CRITICAL_SECURITY_ALERT');
      return;
    }

    // Pattern-based escalation for quality and health
    if (category === 'quality' || category === 'health') {
      this.trackPattern(category, severity, issue);

      const shouldEscalate = this.checkEscalationPattern(category);
      if (shouldEscalate) {
        await this.escalateToMainSession(
          logEntry,
          'PATTERN_ESCALATION',
          this.getPatternSummary(category),
        );
      }
    }

    // Log all notifications for audit trail
    logger.log(
      'notifier',
      'low',
      'system',
      'notification-processed',
      `Processed notification for ${agent}:${issue}`,
      {
        escalated: escalation_required,
        category,
        severity,
      },
    );
  }

  trackPattern(category, severity, issue) {
    const key = `${category}:${severity}:${issue}`;
    const now = new Date();

    if (!this.patternTracking.has(category)) {
      this.patternTracking.set(category, []);
    }

    const categoryPattern = this.patternTracking.get(category);
    categoryPattern.push({ timestamp: now, severity, issue });

    // Keep only last 24 hours
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    this.patternTracking.set(
      category,
      categoryPattern.filter((entry) => entry.timestamp > dayAgo),
    );
  }

  checkEscalationPattern(category) {
    const pattern = this.patternTracking.get(category) || [];
    const recentHours = 6;
    const recentCutoff = new Date(Date.now() - recentHours * 60 * 60 * 1000);
    const recentIssues = pattern.filter((entry) => entry.timestamp > recentCutoff);

    // Quality escalation rules
    if (category === 'quality') {
      const highSeverityCount = recentIssues.filter((i) => i.severity === 'high').length;
      const mediumSeverityCount = recentIssues.filter((i) => i.severity === 'medium').length;

      return highSeverityCount >= 1 || mediumSeverityCount >= 5;
    }

    // Health escalation rules
    if (category === 'health') {
      const criticalIssues = recentIssues.filter(
        (i) =>
          i.issue.includes('dependency') ||
          i.issue.includes('performance') ||
          i.severity === 'high',
      ).length;

      return criticalIssues >= 3;
    }

    return false;
  }

  getPatternSummary(category) {
    const pattern = this.patternTracking.get(category) || [];
    const last6Hours = pattern.filter(
      (entry) => entry.timestamp > new Date(Date.now() - 6 * 60 * 60 * 1000),
    );

    const issueCounts = {};
    last6Hours.forEach((entry) => {
      issueCounts[entry.issue] = (issueCounts[entry.issue] || 0) + 1;
    });

    return {
      category,
      total_issues: last6Hours.length,
      unique_issues: Object.keys(issueCounts).length,
      top_issues: Object.entries(issueCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([issue, count]) => ({ issue, count })),
    };
  }

  async escalateToMainSession(logEntry, alertType, pattern = null) {
    const escalationMessage = this.formatEscalationMessage(logEntry, alertType, pattern);

    // In a real implementation, this would send to the main session
    // For now, we'll log the escalation and create a special alert file
    logger.log('notifier', 'high', 'escalation', alertType, escalationMessage, {
      original_log: logEntry,
      pattern_summary: pattern,
    });

    // Create alert file for main session to discover
    const alertFile = `/tmp/gloria-monitoring-alert-${Date.now()}.json`;
    const fs = require('fs');
    fs.writeFileSync(
      alertFile,
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          alert_type: alertType,
          message: escalationMessage,
          log_entry: logEntry,
          pattern: pattern,
          requires_attention: true,
        },
        null,
        2,
      ),
    );

    console.log(`🚨 ESCALATION: ${alertType} - Alert file created: ${alertFile}`);
  }

  formatEscalationMessage(logEntry, alertType, pattern) {
    const { agent, category, issue, description, timestamp } = logEntry;

    if (alertType === 'CRITICAL_SECURITY_ALERT') {
      return `🔒 CRITICAL SECURITY ISSUE DETECTED

Agent: ${agent}
Issue: ${issue}
Time: ${timestamp}
Details: ${description}

This requires immediate attention as it may compromise site security.`;
    }

    if (alertType === 'PATTERN_ESCALATION') {
      const summary = pattern || {};
      return `📈 PATTERN ESCALATION: ${category.toUpperCase()}

Multiple issues detected in the last 6 hours:
• Total issues: ${summary.total_issues}
• Unique problems: ${summary.unique_issues}
• Top issues: ${summary.top_issues?.map((i) => `${i.issue} (${i.count}x)`).join(', ')}

Latest trigger:
• ${issue}: ${description}
• Time: ${timestamp}

The monitoring system recommends investigation of ${category} subsystems.`;
    }

    return `⚠️ MONITORING ALERT: ${issue}

Agent: ${agent}
Category: ${category}
Description: ${description}
Time: ${timestamp}`;
  }

  async sendWeeklyDigest() {
    const logs = logger.getRecentLogs(null, 24 * 7); // Last week
    const healthStatus = logger.getHealthStatus();

    const digest = {
      timestamp: new Date().toISOString(),
      period: 'weekly',
      summary: healthStatus,
      highlights: this.generateWeeklyHighlights(logs),
      recommendations: this.generateRecommendations(logs, healthStatus),
    };

    logger.log(
      'notifier',
      'low',
      'system',
      'weekly-digest',
      'Generated weekly monitoring digest',
      digest,
    );

    // In production, this would email gloria.exe@proton.me
    console.log('📊 Weekly Monitoring Digest Generated');
    console.log(JSON.stringify(digest, null, 2));

    return digest;
  }

  generateWeeklyHighlights(logs) {
    const highlights = [];

    // Security highlights
    const securityIssues = logs.filter((l) => l.category === 'security' && l.severity === 'high');
    if (securityIssues.length > 0) {
      highlights.push({
        category: 'security',
        type: 'alert',
        message: `${securityIssues.length} critical security issues detected and addressed`,
      });
    }

    // Creative achievements
    const creativeSuccesses = logs.filter(
      (l) => l.category === 'creative' && l.issue === 'success' && l.context.new_features,
    );
    if (creativeSuccesses.length > 0) {
      highlights.push({
        category: 'creative',
        type: 'success',
        message: `${creativeSuccesses.length} new creative features deployed`,
        details: creativeSuccesses.map((l) => l.context.new_features).filter(Boolean),
      });
    }

    // Performance improvements
    const performanceImprovements = logs.filter(
      (l) => l.category === 'health' && l.auto_fixed && l.issue.includes('performance'),
    );
    if (performanceImprovements.length > 0) {
      highlights.push({
        category: 'health',
        type: 'improvement',
        message: `${performanceImprovements.length} performance optimizations applied automatically`,
      });
    }

    return highlights;
  }

  generateRecommendations(logs, healthStatus) {
    const recommendations = [];

    // High-frequency issues
    const issueFrequency = {};
    logs.forEach((log) => {
      if (log.severity !== 'low') {
        issueFrequency[log.issue] = (issueFrequency[log.issue] || 0) + 1;
      }
    });

    const frequentIssues = Object.entries(issueFrequency)
      .filter(([issue, count]) => count >= 3)
      .sort(([, a], [, b]) => b - a);

    frequentIssues.forEach(([issue, count]) => {
      recommendations.push({
        priority: count >= 10 ? 'high' : 'medium',
        category: 'pattern',
        issue,
        recommendation: `Consider root cause analysis for recurring issue: ${issue} (occurred ${count} times)`,
      });
    });

    // Agent-specific recommendations
    if (healthStatus.by_category.quality.critical > 0) {
      recommendations.push({
        priority: 'high',
        category: 'quality',
        recommendation:
          'Quality issues detected. Review recent deployments and run full site audit.',
      });
    }

    if (healthStatus.by_category.security.total === 0) {
      recommendations.push({
        priority: 'low',
        category: 'security',
        recommendation: 'Excellent security posture maintained. Consider expanding scan coverage.',
      });
    }

    return recommendations;
  }

  // Get system status for dashboard
  getSystemStatus() {
    return {
      timestamp: new Date().toISOString(),
      health: logger.getHealthStatus(),
      active_patterns: Array.from(this.patternTracking.entries()).map(([category, pattern]) => ({
        category,
        recent_count: pattern.filter((p) => p.timestamp > new Date(Date.now() - 6 * 60 * 60 * 1000))
          .length,
        total_count: pattern.length,
      })),
      escalation_thresholds: this.escalationThreshold,
    };
  }
}

module.exports = new NotificationSystem();
