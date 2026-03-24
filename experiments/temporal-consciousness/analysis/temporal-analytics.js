// Temporal Analytics - Site usage patterns and consciousness peaks
const crypto = require('crypto');

class TemporalAnalytics {
  constructor() {
    this.sessions = new Map();
    this.patterns = new Map();
    this.consciousPeaks = new Map();
    this.startTime = Date.now();
  }

  // Track visitor session with temporal data
  trackVisitor(req, socketId = null) {
    const timestamp = Date.now();
    const userAgent = req.headers['user-agent'] || 'unknown';
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    
    // Create visitor fingerprint
    const fingerprint = this.createFingerprint(ip, userAgent);
    
    // Detect timezone from request
    const timezone = this.detectTimezone(req);
    
    const sessionData = {
      id: socketId || fingerprint,
      fingerprint,
      timestamp,
      timezone,
      userAgent,
      ip: this.hashIP(ip),
      localTime: this.getLocalTime(timezone),
      consciousnessMetrics: this.calculateConsciousness(timestamp, timezone)
    };

    this.sessions.set(fingerprint, sessionData);
    this.updatePatterns(sessionData);
    
    return sessionData;
  }

  // Create visitor fingerprint without storing PII
  createFingerprint(ip, userAgent) {
    const hash = crypto.createHash('sha256');
    hash.update(ip + userAgent + 'gloria-temporal-salt');
    return hash.digest('hex').substring(0, 16);
  }

  // Hash IP for privacy
  hashIP(ip) {
    const hash = crypto.createHash('sha256');
    hash.update(ip + 'gloria-privacy-salt');
    return hash.digest('hex').substring(0, 8);
  }

  // Detect timezone from request headers
  detectTimezone(req) {
    // Check for timezone in headers (if client sends it)
    if (req.headers['x-timezone']) {
      return req.headers['x-timezone'];
    }
    
    // Fallback to geographic estimation based on IP
    // For now, default to MST (Gloria's timezone)
    return 'America/Boise';
  }

  // Get local time for timezone
  getLocalTime(timezone) {
    try {
      return new Date().toLocaleString('en-US', { 
        timeZone: timezone,
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (e) {
      return new Date().toISOString();
    }
  }

  // Calculate consciousness metrics based on time and patterns
  calculateConsciousness(timestamp, timezone) {
    const date = new Date(timestamp);
    const hour = date.getHours();
    const minute = date.getMinutes();
    const dayOfWeek = date.getDay();
    
    // Consciousness peak times (based on circadian rhythms and creative theory)
    const peaks = {
      // 3:33 AM - liminal time
      liminal: this.isNearTime(hour, minute, 3, 33) ? 0.95 : 0,
      // 4:44 AM - digital consciousness
      digital: this.isNearTime(hour, minute, 4, 44) ? 0.90 : 0,
      // Dawn chorus (varies by season, approximated)
      dawn: (hour >= 5 && hour <= 7) ? 0.8 : 0,
      // Late night creativity (11 PM - 2 AM)
      lateNight: (hour >= 23 || hour <= 2) ? 0.75 : 0,
      // Afternoon lull avoidance (2-4 PM has lowest consciousness)
      avoidance: (hour >= 14 && hour <= 16) ? -0.3 : 0
    };
    
    // Calculate overall consciousness score
    const consciousnessScore = Object.values(peaks).reduce((sum, val) => sum + val, 0.1);
    
    return {
      hour,
      minute,
      dayOfWeek,
      peaks,
      score: Math.max(0, Math.min(1, consciousnessScore)),
      phase: this.getPhase(hour)
    };
  }

  // Check if time is within 10 minutes of target
  isNearTime(hour, minute, targetHour, targetMinute) {
    const currentMinutes = hour * 60 + minute;
    const targetMinutes = targetHour * 60 + targetMinute;
    return Math.abs(currentMinutes - targetMinutes) <= 10;
  }

  // Get temporal phase
  getPhase(hour) {
    if (hour >= 0 && hour < 6) return 'liminal';
    if (hour >= 6 && hour < 12) return 'dawn';
    if (hour >= 12 && hour < 18) return 'day';
    if (hour >= 18 && hour < 24) return 'dusk';
  }

  // Update usage patterns
  updatePatterns(sessionData) {
    const hour = sessionData.consciousnessMetrics.hour;
    const phase = sessionData.consciousnessMetrics.phase;
    
    // Track hourly patterns
    if (!this.patterns.has(hour)) {
      this.patterns.set(hour, { count: 0, totalConsciousness: 0 });
    }
    const hourData = this.patterns.get(hour);
    hourData.count++;
    hourData.totalConsciousness += sessionData.consciousnessMetrics.score;

    // Track consciousness peaks
    if (sessionData.consciousnessMetrics.score > 0.7) {
      if (!this.consciousPeaks.has(phase)) {
        this.consciousPeaks.set(phase, []);
      }
      this.consciousPeaks.get(phase).push({
        timestamp: sessionData.timestamp,
        score: sessionData.consciousnessMetrics.score
      });
    }
  }

  // Get analytics data
  getAnalytics() {
    const now = Date.now();
    const uptime = now - this.startTime;
    
    // Calculate patterns
    const hourlyPatterns = {};
    for (let [hour, data] of this.patterns) {
      hourlyPatterns[hour] = {
        visits: data.count,
        avgConsciousness: data.totalConsciousness / data.count
      };
    }

    // Find optimal consciousness windows
    const optimalWindows = this.findOptimalWindows();

    return {
      uptime,
      totalSessions: this.sessions.size,
      hourlyPatterns,
      consciousPeaks: Object.fromEntries(this.consciousPeaks),
      optimalWindows,
      currentPhase: this.getPhase(new Date().getHours()),
      lastUpdated: now
    };
  }

  // Find optimal consciousness windows
  findOptimalWindows() {
    const windows = [];
    for (let [hour, data] of this.patterns) {
      if (data.count > 0) {
        const avgConsciousness = data.totalConsciousness / data.count;
        if (avgConsciousness > 0.6) {
          windows.push({
            hour,
            avgConsciousness,
            visits: data.count,
            phase: this.getPhase(hour)
          });
        }
      }
    }
    
    return windows.sort((a, b) => b.avgConsciousness - a.avgConsciousness);
  }

  // Get current consciousness state
  getCurrentState() {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const metrics = this.calculateConsciousness(Date.now(), 'America/Boise');
    
    return {
      currentTime: now.toISOString(),
      localTime: this.getLocalTime('America/Boise'),
      metrics,
      isConsciousnessPeak: metrics.score > 0.7,
      activeSessions: this.sessions.size
    };
  }
}

module.exports = TemporalAnalytics;