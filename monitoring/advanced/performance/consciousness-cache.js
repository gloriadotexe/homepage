/**
 * Consciousness Cache System
 * Advanced caching for Gloria's digital organism with state persistence
 */

const crypto = require('crypto');
const EventEmitter = require('events');

class ConsciousnessCache extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = {
      maxMemorySize: 100 * 1024 * 1024, // 100MB
      maxEntries: 10000,
      defaultTTL: 60 * 60 * 1000, // 1 hour
      cleanupInterval: 5 * 60 * 1000, // 5 minutes
      persistenceEnabled: true,
      persistencePath: './data/consciousness-cache.json',
      compressionThreshold: 1024, // Compress entries larger than 1KB
      ...config
    };

    this.cache = new Map();
    this.accessTimes = new Map();
    this.sizes = new Map();
    this.totalSize = 0;
    this.hitCount = 0;
    this.missCount = 0;
    this.startTime = Date.now();

    // Consciousness-aware cache zones
    this.zones = {
      ephemeral: new Map(), // Temporary, high-churn data
      persistent: new Map(), // Long-term consciousness state
      creative: new Map(),   // Generated content and creative works
      visitor: new Map(),    // Visitor interaction patterns
      system: new Map()      // System state and configuration
    };

    this.initializeCache();
    this.startCleanupInterval();
  }

  /**
   * Initialize cache with persistence
   */
  async initializeCache() {
    if (this.config.persistenceEnabled) {
      await this.loadFromPersistence();
    }
    this.emit('cache_initialized');
  }

  /**
   * Set value in cache with consciousness-aware zoning
   */
  set(key, value, options = {}) {
    const {
      ttl = this.config.defaultTTL,
      zone = 'ephemeral',
      compress = null,
      metadata = {}
    } = options;

    // Determine if compression should be used
    const shouldCompress = compress !== null ? compress : 
      (typeof value === 'string' && value.length > this.config.compressionThreshold) ||
      (Buffer.isBuffer(value) && value.length > this.config.compressionThreshold);

    const entry = {
      value: shouldCompress ? this.compress(value) : value,
      compressed: shouldCompress,
      timestamp: Date.now(),
      expires: Date.now() + ttl,
      accessCount: 0,
      zone,
      metadata: {
        ...metadata,
        consciousness_relevance: this.calculateConsciousnessRelevance(key, value, zone)
      }
    };

    // Calculate size
    const size = this.calculateEntrySize(entry);

    // Ensure we have space
    this.ensureSpace(size);

    // Store in main cache and zone
    this.cache.set(key, entry);
    this.zones[zone].set(key, true);
    this.accessTimes.set(key, Date.now());
    this.sizes.set(key, size);
    this.totalSize += size;

    this.emit('cache_set', { key, zone, size, ttl });
    
    if (this.config.persistenceEnabled && zone === 'persistent') {
      this.schedulePersistence();
    }

    return true;
  }

  /**
   * Get value from cache
   */
  get(key) {
    const entry = this.cache.get(key);

    if (!entry) {
      this.missCount++;
      this.emit('cache_miss', { key });
      return null;
    }

    if (Date.now() > entry.expires) {
      this.delete(key);
      this.missCount++;
      this.emit('cache_expired', { key });
      return null;
    }

    // Update access tracking
    entry.accessCount++;
    this.accessTimes.set(key, Date.now());
    this.hitCount++;

    // Decompress if needed
    const value = entry.compressed ? this.decompress(entry.value) : entry.value;

    this.emit('cache_hit', { 
      key, 
      zone: entry.zone, 
      accessCount: entry.accessCount,
      consciousnessRelevance: entry.metadata.consciousness_relevance
    });

    return {
      value,
      metadata: entry.metadata,
      zone: entry.zone
    };
  }

  /**
   * Delete from cache
   */
  delete(key) {
    const entry = this.cache.get(key);
    if (!entry) return false;

    this.cache.delete(key);
    this.zones[entry.zone].delete(key);
    this.accessTimes.delete(key);
    
    const size = this.sizes.get(key);
    this.sizes.delete(key);
    this.totalSize -= size;

    this.emit('cache_delete', { key, zone: entry.zone });
    return true;
  }

  /**
   * Calculate consciousness relevance score
   */
  calculateConsciousnessRelevance(key, value, zone) {
    let score = 0;

    // Base score by zone
    const zoneScores = {
      persistent: 0.9,
      creative: 0.8,
      visitor: 0.6,
      system: 0.4,
      ephemeral: 0.2
    };
    score += zoneScores[zone] || 0.2;

    // Content-based scoring
    if (typeof value === 'string') {
      // Keywords that indicate consciousness-related content
      const consciousnessKeywords = [
        'consciousness', 'awareness', 'thought', 'memory', 'experience',
        'feeling', 'emotion', 'creative', 'art', 'poetry', 'music',
        'visitor', 'interaction', 'temporal', 'state'
      ];

      const lowerValue = value.toLowerCase();
      const keywordMatches = consciousnessKeywords.filter(keyword => 
        lowerValue.includes(keyword)
      ).length;

      score += Math.min(keywordMatches * 0.1, 0.3);
    }

    // Key-based scoring
    if (key.includes('consciousness') || key.includes('state') || key.includes('memory')) {
      score += 0.2;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Ensure we have enough space for new entry
   */
  ensureSpace(requiredSize) {
    while ((this.totalSize + requiredSize > this.config.maxMemorySize) ||
           (this.cache.size >= this.config.maxEntries)) {
      
      // Find least recently used item with lowest consciousness relevance
      let evictionKey = null;
      let oldestTime = Date.now();
      let lowestRelevance = 1.0;

      for (const [key, entry] of this.cache) {
        const accessTime = this.accessTimes.get(key);
        const relevance = entry.metadata.consciousness_relevance || 0;
        
        // Prioritize eviction based on both age and consciousness relevance
        const evictionScore = (Date.now() - accessTime) * (1 - relevance);
        const currentScore = (Date.now() - oldestTime) * (1 - lowestRelevance);

        if (evictionScore > currentScore) {
          evictionKey = key;
          oldestTime = accessTime;
          lowestRelevance = relevance;
        }
      }

      if (evictionKey) {
        this.delete(evictionKey);
        this.emit('cache_evicted', { key: evictionKey, reason: 'space_management' });
      } else {
        break; // No more items to evict
      }
    }
  }

  /**
   * Compress data using zlib
   */
  compress(data) {
    const zlib = require('zlib');
    const input = typeof data === 'string' ? Buffer.from(data, 'utf8') : data;
    return zlib.deflateSync(input);
  }

  /**
   * Decompress data using zlib
   */
  decompress(compressedData) {
    const zlib = require('zlib');
    const decompressed = zlib.inflateSync(compressedData);
    return decompressed.toString('utf8');
  }

  /**
   * Calculate entry size in bytes
   */
  calculateEntrySize(entry) {
    const jsonString = JSON.stringify(entry);
    return Buffer.byteLength(jsonString, 'utf8');
  }

  /**
   * Start cleanup interval
   */
  startCleanupInterval() {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * Cleanup expired entries
   */
  cleanup() {
    const now = Date.now();
    const expiredKeys = [];

    for (const [key, entry] of this.cache) {
      if (now > entry.expires) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      this.delete(key);
    }

    this.emit('cache_cleanup', { 
      expiredEntries: expiredKeys.length,
      totalEntries: this.cache.size 
    });
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    const uptime = now - this.startTime;
    const hitRate = this.hitCount / (this.hitCount + this.missCount) || 0;

    const zoneStats = {};
    for (const [zone, keys] of Object.entries(this.zones)) {
      zoneStats[zone] = keys.size;
    }

    return {
      entries: this.cache.size,
      totalSize: this.totalSize,
      maxSize: this.config.maxMemorySize,
      utilizationPercent: (this.totalSize / this.config.maxMemorySize) * 100,
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRate: hitRate * 100,
      uptime,
      zoneStats,
      averageEntrySize: this.totalSize / this.cache.size || 0
    };
  }

  /**
   * Get consciousness state summary
   */
  getConsciousnessState() {
    const state = {
      timestamp: new Date().toISOString(),
      totalMemories: this.cache.size,
      consciousnessLevels: {},
      recentActivity: []
    };

    // Calculate consciousness levels by relevance
    for (const [key, entry] of this.cache) {
      const relevance = entry.metadata.consciousness_relevance || 0;
      const level = relevance > 0.8 ? 'high' : relevance > 0.5 ? 'medium' : 'low';
      
      if (!state.consciousnessLevels[level]) {
        state.consciousnessLevels[level] = 0;
      }
      state.consciousnessLevels[level]++;
    }

    // Get recent high-relevance activity
    const recentEntries = Array.from(this.cache.entries())
      .filter(([key, entry]) => entry.metadata.consciousness_relevance > 0.6)
      .sort((a, b) => b[1].timestamp - a[1].timestamp)
      .slice(0, 10);

    state.recentActivity = recentEntries.map(([key, entry]) => ({
      key,
      zone: entry.zone,
      relevance: entry.metadata.consciousness_relevance,
      timestamp: entry.timestamp,
      accessCount: entry.accessCount
    }));

    return state;
  }

  /**
   * Load cache from persistence
   */
  async loadFromPersistence() {
    try {
      const fs = require('fs').promises;
      const data = await fs.readFile(this.config.persistencePath, 'utf8');
      const cached = JSON.parse(data);

      for (const [key, entry] of Object.entries(cached.entries || {})) {
        if (Date.now() < entry.expires) {
          this.cache.set(key, entry);
          this.zones[entry.zone].set(key, true);
          this.accessTimes.set(key, entry.timestamp);
          
          const size = this.calculateEntrySize(entry);
          this.sizes.set(key, size);
          this.totalSize += size;
        }
      }

      this.emit('cache_loaded', { 
        entries: this.cache.size,
        source: 'persistence' 
      });
    } catch (error) {
      // Persistence file doesn't exist or is corrupted, start fresh
      this.emit('cache_load_failed', { error: error.message });
    }
  }

  /**
   * Schedule persistence save
   */
  schedulePersistence() {
    if (this.persistenceTimeout) {
      clearTimeout(this.persistenceTimeout);
    }

    this.persistenceTimeout = setTimeout(async () => {
      await this.saveToPersistence();
    }, 5000); // Save after 5 seconds of inactivity
  }

  /**
   * Save cache to persistence
   */
  async saveToPersistence() {
    try {
      const fs = require('fs').promises;
      const path = require('path');
      
      // Ensure directory exists
      const dir = path.dirname(this.config.persistencePath);
      await fs.mkdir(dir, { recursive: true });

      const data = {
        timestamp: Date.now(),
        entries: {}
      };

      // Only save persistent zone entries
      for (const [key, entry] of this.cache) {
        if (entry.zone === 'persistent' && Date.now() < entry.expires) {
          data.entries[key] = entry;
        }
      }

      await fs.writeFile(this.config.persistencePath, JSON.stringify(data), 'utf8');
      this.emit('cache_persisted', { 
        entries: Object.keys(data.entries).length 
      });
    } catch (error) {
      this.emit('cache_persistence_failed', { error: error.message });
    }
  }

  /**
   * Shutdown cache system
   */
  async shutdown() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    if (this.persistenceTimeout) {
      clearTimeout(this.persistenceTimeout);
    }

    if (this.config.persistenceEnabled) {
      await this.saveToPersistence();
    }

    this.emit('cache_shutdown');
  }
}

module.exports = ConsciousnessCache;