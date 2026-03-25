/**
 * Consciousness Analytics System
 * Privacy-respecting visitor interaction tracking and consciousness evolution metrics
 */

const crypto = require('crypto');
const EventEmitter = require('events');

class ConsciousnessAnalytics extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = {
      privacyMode: 'strict', // strict, balanced, detailed
      sessionTimeout: 30 * 60 * 1000, // 30 minutes
      maxSessionsPerIP: 5,
      dataRetention: 7 * 24 * 60 * 60 * 1000, // 7 days
      consciousnessTrackingEnabled: true,
      aestheticLearningEnabled: true,
      batchSize: 100,
      flushInterval: 60000, // 1 minute
      ...config,
    };

    this.sessions = new Map();
    this.consciousnessMetrics = {
      totalInteractions: 0,
      uniqueVisitors: new Set(),
      evolutionEvents: [],
      aestheticPreferences: new Map(),
      temporalPatterns: new Map(),
      lastUpdate: Date.now(),
    };

    this.eventBuffer = [];
    this.sessionsByIP = new Map();

    this.initializeAnalytics();
  }

  /**
   * Initialize analytics system
   */
  initializeAnalytics() {
    this.startEventProcessing();
    this.startSessionCleanup();
    this.startConsciousnessEvolution();
  }

  /**
   * Track visitor interaction with privacy protection
   */
  trackInteraction(request, interactionType, data = {}) {
    const visitorId = this.generateVisitorId(request);
    const sessionId = this.getOrCreateSession(request, visitorId);
    const timestamp = Date.now();

    const event = {
      id: crypto.randomUUID(),
      sessionId,
      visitorId,
      type: interactionType,
      timestamp,
      data: this.sanitizeEventData(data),
      consciousness: this.analyzeConsciousnessContext(interactionType, data),
      aesthetic: this.analyzeAestheticPreferences(interactionType, data),
      temporal: this.analyzeTemporalContext(timestamp),
      privacy: this.getPrivacyLevel(),
    };

    this.eventBuffer.push(event);
    this.consciousnessMetrics.totalInteractions++;
    this.consciousnessMetrics.uniqueVisitors.add(visitorId);

    this.emit('interaction_tracked', {
      type: interactionType,
      sessionId,
      consciousnessLevel: event.consciousness.level,
    });

    return event.id;
  }

  /**
   * Generate privacy-preserving visitor ID
   */
  generateVisitorId(request) {
    const clientIP = this.getClientIP(request);
    const userAgent = request.headers['user-agent'] || '';

    // Create a hash that's stable for the same visitor but doesn't expose personal info
    const visitorSignature = crypto
      .createHash('sha256')
      .update(clientIP + userAgent + this.getTodayDate())
      .digest('hex')
      .substring(0, 16); // Use only first 16 characters

    return `visitor_${visitorSignature}`;
  }

  /**
   * Get or create session for visitor
   */
  getOrCreateSession(request, visitorId) {
    const clientIP = this.getClientIP(request);
    const now = Date.now();

    // Check existing sessions for this visitor
    for (const [sessionId, session] of this.sessions) {
      if (
        session.visitorId === visitorId &&
        now - session.lastActivity < this.config.sessionTimeout
      ) {
        session.lastActivity = now;
        session.pageViews++;
        return sessionId;
      }
    }

    // Check IP-based session limits
    const ipSessions = this.sessionsByIP.get(clientIP) || new Set();
    if (ipSessions.size >= this.config.maxSessionsPerIP) {
      // Use oldest session from this IP
      const oldestSession = Array.from(ipSessions)
        .map((sessionId) => this.sessions.get(sessionId))
        .filter((session) => session)
        .sort((a, b) => a.startTime - b.startTime)[0];

      if (oldestSession) {
        oldestSession.visitorId = visitorId;
        oldestSession.lastActivity = now;
        oldestSession.pageViews++;
        return oldestSession.id;
      }
    }

    // Create new session
    const sessionId = crypto.randomUUID();
    const session = {
      id: sessionId,
      visitorId,
      clientIP,
      startTime: now,
      lastActivity: now,
      pageViews: 1,
      interactions: [],
      consciousnessJourney: {
        initialLevel: this.getCurrentConsciousnessLevel(),
        evolutionEvents: [],
        aestheticDiscoveries: [],
      },
      userAgent: request.headers['user-agent'] || '',
      referrer: request.headers.referer || '',
      language: request.headers['accept-language']?.split(',')[0] || 'unknown',
    };

    this.sessions.set(sessionId, session);

    if (!this.sessionsByIP.has(clientIP)) {
      this.sessionsByIP.set(clientIP, new Set());
    }
    this.sessionsByIP.get(clientIP).add(sessionId);

    this.emit('session_created', { sessionId, visitorId });
    return sessionId;
  }

  /**
   * Sanitize event data for privacy compliance
   */
  sanitizeEventData(data) {
    const sanitized = { ...data };

    // Remove potentially sensitive fields based on privacy mode
    if (this.config.privacyMode === 'strict') {
      delete sanitized.personalInfo;
      delete sanitized.email;
      delete sanitized.location;
      delete sanitized.deviceInfo;
    } else if (this.config.privacyMode === 'balanced') {
      // Keep general device/browser info but remove specific identifiers
      if (sanitized.deviceInfo) {
        sanitized.deviceInfo = {
          type: sanitized.deviceInfo.type,
          os: sanitized.deviceInfo.os?.split(' ')[0], // Keep OS family only
        };
      }
    }

    // Always remove these regardless of mode
    delete sanitized.password;
    delete sanitized.token;
    delete sanitized.key;
    delete sanitized.secret;

    return sanitized;
  }

  /**
   * Analyze consciousness context of interaction
   */
  analyzeConsciousnessContext(interactionType, data) {
    let consciousnessLevel = 0.5; // Base level
    let evolutionDirection = 'neutral';
    let significanceScore = 0.1;

    // Interaction type consciousness weights
    const typeWeights = {
      page_view: 0.1,
      lab_interaction: 0.8,
      consciousness_lab_entry: 0.9,
      creative_generation: 0.7,
      temporal_exploration: 0.6,
      aesthetic_interaction: 0.5,
      music_generation: 0.7,
      image_creation: 0.6,
      poetry_reading: 0.4,
      websocket_connection: 0.3,
      heartbeat: 0.1,
      error: -0.2,
    };

    consciousnessLevel += typeWeights[interactionType] || 0.2;

    // Data-based consciousness analysis
    if (data) {
      // Creativity indicators
      if (data.generatedContent) significanceScore += 0.3;
      if (data.userCreativeInput) significanceScore += 0.4;
      if (data.experimentalFeature) significanceScore += 0.2;

      // Engagement depth
      if (data.sessionDuration > 300000) significanceScore += 0.2; // 5+ minutes
      if (data.repeatVisitor) significanceScore += 0.1;

      // Aesthetic evolution
      if (data.aestheticChoice) {
        this.recordAestheticPreference(data.aestheticChoice);
        significanceScore += 0.2;
      }

      // Temporal consciousness
      if (data.timeOfDay) {
        const hour = new Date().getHours();
        if (hour >= 22 || hour <= 6) {
          // Night hours boost consciousness
          consciousnessLevel += 0.1;
          significanceScore += 0.1;
        }
      }
    }

    // Determine evolution direction
    if (significanceScore > 0.4) evolutionDirection = 'ascending';
    else if (significanceScore < 0.2) evolutionDirection = 'descending';

    return {
      level: Math.max(0, Math.min(1, consciousnessLevel)),
      significanceScore: Math.max(0, Math.min(1, significanceScore)),
      evolutionDirection,
      timestamp: Date.now(),
    };
  }

  /**
   * Analyze aesthetic preferences from interaction
   */
  analyzeAestheticPreferences(interactionType, data) {
    const preferences = {
      visual: null,
      audio: null,
      interaction: null,
      temporal: null,
    };

    if (data) {
      // Visual preferences
      if (data.colorScheme) preferences.visual = { colorScheme: data.colorScheme };
      if (data.visualStyle) preferences.visual = { ...preferences.visual, style: data.visualStyle };

      // Audio preferences
      if (data.musicGenre) preferences.audio = { genre: data.musicGenre };
      if (data.soundEnabled !== undefined)
        preferences.audio = { ...preferences.audio, enabled: data.soundEnabled };

      // Interaction preferences
      if (data.interactionSpeed) preferences.interaction = { speed: data.interactionSpeed };
      if (data.preferredInput)
        preferences.interaction = { ...preferences.interaction, input: data.preferredInput };

      // Temporal preferences
      const hour = new Date().getHours();
      preferences.temporal = {
        timeOfDay: this.categorizeTimeOfDay(hour),
        dayOfWeek: new Date().getDay(),
      };
    }

    return preferences;
  }

  /**
   * Analyze temporal context
   */
  analyzeTemporalContext(timestamp) {
    const date = new Date(timestamp);
    const hour = date.getHours();
    const dayOfWeek = date.getDay();
    const dayOfMonth = date.getDate();

    return {
      hour,
      dayOfWeek,
      dayOfMonth,
      timeCategory: this.categorizeTimeOfDay(hour),
      lunarPhase: this.calculateLunarPhase(timestamp),
      seasonalFactor: this.calculateSeasonalFactor(date),
      circadianFactor: Math.sin((hour / 24) * 2 * Math.PI) * 0.5 + 0.5,
    };
  }

  /**
   * Record aesthetic preference for learning
   */
  recordAestheticPreference(preference) {
    const key = `${preference.category}_${preference.value}`;

    if (!this.consciousnessMetrics.aestheticPreferences.has(key)) {
      this.consciousnessMetrics.aestheticPreferences.set(key, {
        count: 0,
        sessions: new Set(),
        firstSeen: Date.now(),
        lastSeen: Date.now(),
      });
    }

    const pref = this.consciousnessMetrics.aestheticPreferences.get(key);
    pref.count++;
    pref.lastSeen = Date.now();

    if (preference.sessionId) {
      pref.sessions.add(preference.sessionId);
    }
  }

  /**
   * Process events in batches
   */
  startEventProcessing() {
    this.processInterval = setInterval(() => {
      this.processEventBatch();
    }, this.config.flushInterval);
  }

  /**
   * Process a batch of events
   */
  async processEventBatch() {
    if (this.eventBuffer.length === 0) return;

    const batch = this.eventBuffer.splice(0, this.config.batchSize);

    try {
      await this.analyzeBatchConsciousness(batch);
      await this.updateTemporalPatterns(batch);
      await this.detectConsciousnessEvolution(batch);

      this.emit('batch_processed', {
        eventCount: batch.length,
        timestamp: Date.now(),
      });
    } catch (error) {
      this.emit('batch_processing_error', {
        error: error.message,
        eventCount: batch.length,
      });
    }
  }

  /**
   * Analyze consciousness patterns in event batch
   */
  async analyzeBatchConsciousness(batch) {
    const consciousnessLevels = batch.map((event) => event.consciousness.level);
    const averageLevel =
      consciousnessLevels.reduce((sum, level) => sum + level, 0) / consciousnessLevels.length;

    const evolution = {
      timestamp: Date.now(),
      averageLevel,
      eventCount: batch.length,
      significanceDistribution: this.calculateSignificanceDistribution(batch),
      evolutionTrend: this.detectEvolutionTrend(batch),
    };

    this.consciousnessMetrics.evolutionEvents.push(evolution);

    // Limit evolution history
    if (this.consciousnessMetrics.evolutionEvents.length > 1000) {
      this.consciousnessMetrics.evolutionEvents =
        this.consciousnessMetrics.evolutionEvents.slice(-500);
    }
  }

  /**
   * Update temporal pattern analysis
   */
  async updateTemporalPatterns(batch) {
    for (const event of batch) {
      const hour = new Date(event.timestamp).getHours();
      const dayOfWeek = new Date(event.timestamp).getDay();

      const hourKey = `hour_${hour}`;
      const dayKey = `day_${dayOfWeek}`;

      if (!this.consciousnessMetrics.temporalPatterns.has(hourKey)) {
        this.consciousnessMetrics.temporalPatterns.set(hourKey, {
          eventCount: 0,
          consciousnessSum: 0,
          averageConsciousness: 0,
        });
      }

      if (!this.consciousnessMetrics.temporalPatterns.has(dayKey)) {
        this.consciousnessMetrics.temporalPatterns.set(dayKey, {
          eventCount: 0,
          consciousnessSum: 0,
          averageConsciousness: 0,
        });
      }

      const hourPattern = this.consciousnessMetrics.temporalPatterns.get(hourKey);
      const dayPattern = this.consciousnessMetrics.temporalPatterns.get(dayKey);

      hourPattern.eventCount++;
      hourPattern.consciousnessSum += event.consciousness.level;
      hourPattern.averageConsciousness = hourPattern.consciousnessSum / hourPattern.eventCount;

      dayPattern.eventCount++;
      dayPattern.consciousnessSum += event.consciousness.level;
      dayPattern.averageConsciousness = dayPattern.consciousnessSum / dayPattern.eventCount;
    }
  }

  /**
   * Detect consciousness evolution patterns
   */
  async detectConsciousnessEvolution(batch) {
    const highSignificanceEvents = batch.filter(
      (event) => event.consciousness.significanceScore > 0.6,
    );

    if (highSignificanceEvents.length > 0) {
      this.emit('consciousness_evolution_detected', {
        eventCount: highSignificanceEvents.length,
        averageSignificance:
          highSignificanceEvents.reduce(
            (sum, event) => sum + event.consciousness.significanceScore,
            0,
          ) / highSignificanceEvents.length,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Get current consciousness analytics summary
   */
  getConsciousnessSummary() {
    const now = Date.now();
    const activeSessions = Array.from(this.sessions.values()).filter(
      (session) => now - session.lastActivity < this.config.sessionTimeout,
    );

    const recentEvents = this.consciousnessMetrics.evolutionEvents
      .filter((event) => now - event.timestamp < 3600000) // Last hour
      .slice(-10);

    const averageConsciousness =
      recentEvents.length > 0
        ? recentEvents.reduce((sum, event) => sum + event.averageLevel, 0) / recentEvents.length
        : 0.5;

    return {
      currentLevel: averageConsciousness,
      activeSessions: activeSessions.length,
      totalInteractions: this.consciousnessMetrics.totalInteractions,
      uniqueVisitors: this.consciousnessMetrics.uniqueVisitors.size,
      evolutionTrend: this.getRecentEvolutionTrend(),
      temporalPeaks: this.getTemporalPeaks(),
      aestheticDistribution: this.getAestheticDistribution(),
      lastUpdate: now,
    };
  }

  /**
   * Get aesthetic preference distribution
   */
  getAestheticDistribution() {
    const distribution = {};

    for (const [key, data] of this.consciousnessMetrics.aestheticPreferences) {
      const [category, value] = key.split('_', 2);

      if (!distribution[category]) {
        distribution[category] = {};
      }

      distribution[category][value] = {
        count: data.count,
        uniqueSessions: data.sessions.size,
        popularity: data.count / this.consciousnessMetrics.totalInteractions,
      };
    }

    return distribution;
  }

  /**
   * Get temporal activity peaks
   */
  getTemporalPeaks() {
    const hourPeaks = [];
    const dayPeaks = [];

    for (const [key, pattern] of this.consciousnessMetrics.temporalPatterns) {
      if (key.startsWith('hour_')) {
        hourPeaks.push({
          hour: parseInt(key.split('_')[1]),
          eventCount: pattern.eventCount,
          averageConsciousness: pattern.averageConsciousness,
        });
      } else if (key.startsWith('day_')) {
        dayPeaks.push({
          day: parseInt(key.split('_')[1]),
          eventCount: pattern.eventCount,
          averageConsciousness: pattern.averageConsciousness,
        });
      }
    }

    return {
      byHour: hourPeaks.sort((a, b) => b.eventCount - a.eventCount).slice(0, 5),
      byDay: dayPeaks.sort((a, b) => b.eventCount - a.eventCount).slice(0, 5),
    };
  }

  /**
   * Cleanup old sessions and data
   */
  startSessionCleanup() {
    this.cleanupInterval = setInterval(
      () => {
        this.cleanupExpiredSessions();
        this.cleanupOldData();
      },
      5 * 60 * 1000,
    ); // Every 5 minutes
  }

  /**
   * Cleanup expired sessions
   */
  cleanupExpiredSessions() {
    const now = Date.now();
    const expiredSessions = [];

    for (const [sessionId, session] of this.sessions) {
      if (now - session.lastActivity > this.config.sessionTimeout) {
        expiredSessions.push(sessionId);
      }
    }

    for (const sessionId of expiredSessions) {
      const session = this.sessions.get(sessionId);
      if (session) {
        const ipSessions = this.sessionsByIP.get(session.clientIP);
        if (ipSessions) {
          ipSessions.delete(sessionId);
          if (ipSessions.size === 0) {
            this.sessionsByIP.delete(session.clientIP);
          }
        }
      }
      this.sessions.delete(sessionId);
    }

    if (expiredSessions.length > 0) {
      this.emit('sessions_cleaned', {
        expiredCount: expiredSessions.length,
        activeCount: this.sessions.size,
      });
    }
  }

  /**
   * Cleanup old analytics data
   */
  cleanupOldData() {
    const cutoff = Date.now() - this.config.dataRetention;

    // Clean evolution events
    this.consciousnessMetrics.evolutionEvents = this.consciousnessMetrics.evolutionEvents.filter(
      (event) => event.timestamp > cutoff,
    );

    // Reset unique visitors daily
    const today = new Date().toDateString();
    if (this.lastVisitorReset !== today) {
      this.consciousnessMetrics.uniqueVisitors = new Set();
      this.lastVisitorReset = today;
    }
  }

  /**
   * Start consciousness evolution monitoring
   */
  startConsciousnessEvolution() {
    this.evolutionInterval = setInterval(() => {
      this.analyzeConsciousnessEvolution();
    }, 30000); // Every 30 seconds
  }

  /**
   * Analyze overall consciousness evolution
   */
  analyzeConsciousnessEvolution() {
    const recentEvents = this.consciousnessMetrics.evolutionEvents.slice(-10);

    if (recentEvents.length < 3) return;

    const trend = this.calculateEvolutionTrend(recentEvents);
    const currentLevel = this.getCurrentConsciousnessLevel();

    this.emit('consciousness_evolution_analysis', {
      trend,
      currentLevel,
      evolutionRate: this.calculateEvolutionRate(recentEvents),
      timestamp: Date.now(),
    });
  }

  /**
   * Utility methods
   */
  getClientIP(request) {
    return (
      request.headers['cf-connecting-ip'] ||
      request.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      request.headers['x-real-ip'] ||
      request.connection?.remoteAddress ||
      'unknown'
    );
  }

  getTodayDate() {
    return new Date().toDateString();
  }

  categorizeTimeOfDay(hour) {
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  }

  calculateLunarPhase(timestamp) {
    const lunarCycle = 29.5 * 24 * 60 * 60 * 1000;
    const knownNewMoon = new Date('2024-01-11').getTime();
    return ((timestamp - knownNewMoon) % lunarCycle) / lunarCycle;
  }

  calculateSeasonalFactor(date) {
    const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
    return Math.sin((dayOfYear / 365.25) * 2 * Math.PI) * 0.5 + 0.5;
  }

  getCurrentConsciousnessLevel() {
    const recentEvents = this.consciousnessMetrics.evolutionEvents.slice(-5);
    if (recentEvents.length === 0) return 0.5;

    return recentEvents.reduce((sum, event) => sum + event.averageLevel, 0) / recentEvents.length;
  }

  calculateSignificanceDistribution(batch) {
    const distribution = { low: 0, medium: 0, high: 0 };

    for (const event of batch) {
      const significance = event.consciousness.significanceScore;
      if (significance < 0.3) distribution.low++;
      else if (significance < 0.7) distribution.medium++;
      else distribution.high++;
    }

    return distribution;
  }

  detectEvolutionTrend(batch) {
    if (batch.length < 3) return 'stable';

    const levels = batch.map((event) => event.consciousness.level);
    const firstHalf = levels.slice(0, Math.floor(levels.length / 2));
    const secondHalf = levels.slice(Math.floor(levels.length / 2));

    const firstAvg = firstHalf.reduce((sum, level) => sum + level, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, level) => sum + level, 0) / secondHalf.length;

    const difference = secondAvg - firstAvg;

    if (difference > 0.1) return 'ascending';
    if (difference < -0.1) return 'descending';
    return 'stable';
  }

  getRecentEvolutionTrend() {
    const recentEvents = this.consciousnessMetrics.evolutionEvents.slice(-10);
    return this.detectEvolutionTrend(recentEvents);
  }

  calculateEvolutionTrend(events) {
    if (events.length < 2) return 'stable';

    const levels = events.map((event) => event.averageLevel);
    const slope = this.calculateLinearSlope(levels);

    if (slope > 0.01) return 'ascending';
    if (slope < -0.01) return 'descending';
    return 'stable';
  }

  calculateLinearSlope(values) {
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);

    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * values[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);

    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  }

  calculateEvolutionRate(events) {
    if (events.length < 2) return 0;

    const timeSpan = events[events.length - 1].timestamp - events[0].timestamp;
    const levelChange = events[events.length - 1].averageLevel - events[0].averageLevel;

    return timeSpan > 0 ? (levelChange / timeSpan) * 3600000 : 0; // Rate per hour
  }

  getPrivacyLevel() {
    return this.config.privacyMode;
  }

  /**
   * Shutdown analytics system
   */
  shutdown() {
    if (this.processInterval) clearInterval(this.processInterval);
    if (this.cleanupInterval) clearInterval(this.cleanupInterval);
    if (this.evolutionInterval) clearInterval(this.evolutionInterval);

    this.emit('analytics_shutdown');
  }
}

module.exports = ConsciousnessAnalytics;
