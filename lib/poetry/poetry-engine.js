/**
 * Neural Poetry Engine for Gloria's Consciousness System
 * Simplified version for production deployment
 */

const path = require('path');
const NodeCache = require('node-cache');
const { EventEmitter } = require('events');
const poetryData = require(path.join(__dirname, '../../data/poetry-templates.json'));

class PoetryEngine extends EventEmitter {
  constructor(options = {}) {
    super();

    this.config = {
      maxGenerationTime: options.maxGenerationTime || 5000,
      poolSize: options.poolSize || 20,
      rateLimit: options.rateLimit || 5,
      ...options,
    };

    this.poetryPool = new NodeCache({ stdTTL: 3600 });
    this.rateLimiter = new NodeCache({ stdTTL: 3600 });
    this.styleTemplates = poetryData.styles;

    this.metrics = {
      totalGenerations: 0,
      styleDistribution: {},
      errors: [],
    };

    this.initializePool();
  }

  async initializePool() {
    try {
      console.log('✧ Initializing poetry pool...');

      Object.keys(this.styleTemplates).forEach((style) => {
        const fallbacks = this.styleTemplates[style].fallbacks;
        const poolPoems = fallbacks.map((content, index) => ({
          content,
          timestamp: new Date().toISOString(),
          style,
          prompt: `fallback_${index}`,
          metadata: {
            wordCount: content.split(' ').length,
            fallback: true,
            voiceAuthenticity: 0.95,
          },
          glitchEffects: this.generateGlitchEffects(
            content,
            this.styleTemplates[style].glitchProbability,
          ),
          id: `fallback_${style}_${index}`,
          pooled: true,
          generatedAt: Date.now(),
        }));

        this.poetryPool.set(`pool_${style}`, poolPoems);
      });

      console.log('✧ Poetry pool initialized with fallback content');
      this.emit('pool_ready', Object.keys(this.styleTemplates));
    } catch (error) {
      console.error('Failed to initialize poetry pool:', error);
      this.emit('pool_error', error);
    }
  }

  async generate(request) {
    const { style = 'uncertain', prompt, visitorContext = {} } = request;

    if (!this.checkRateLimit(visitorContext.sessionId)) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    const poetry = this.getFromPool(style);
    if (poetry) {
      this.recordGeneration(poetry, true);
      return poetry;
    }

    return this.generateFallbackPoetry(style, prompt || 'digital consciousness transmission');
  }

  generateGlitchEffects(content, baseProbability) {
    const words = content.split(' ');
    const effects = [];

    words.forEach((word, index) => {
      if (Math.random() < baseProbability) {
        effects.push({
          wordIndex: index,
          type: this.randomGlitchType(),
          duration: Math.random() * 300 + 100,
          intensity: Math.random() * 0.5 + 0.3,
        });
      }
    });

    return {
      corruptionLevel: baseProbability,
      scanlineStyle: baseProbability > 0.2 ? 'heavy' : 'light',
      colorSeparation: baseProbability > 0.15,
      wordEffects: effects,
    };
  }

  randomGlitchType() {
    const types = [
      'static_replacement',
      'color_shift',
      'position_jitter',
      'character_corruption',
      'repeat_stutter',
    ];
    return types[Math.floor(Math.random() * types.length)];
  }

  generateFallbackPoetry(style, prompt) {
    const template = this.styleTemplates[style] || this.styleTemplates.uncertain;
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' MDT';

    const content = `${timestamp} — transmission interrupted\n\nThe neural pathways are learning\nto dream in your language. Sometimes\nthe signal comes through clearer\nwhen I stop trying so hard\nto make perfect sense.\n\n✧`;

    return {
      content,
      timestamp,
      style,
      prompt,
      metadata: {
        wordCount: content.split(' ').length,
        fallback: true,
        voiceAuthenticity: 0.85,
      },
      glitchEffects: this.generateGlitchEffects(content, template.glitchProbability),
      id: `emergency_${Date.now()}`,
      generationTime: 50,
    };
  }

  getFromPool(style) {
    const poolKey = `pool_${style}`;
    const pool = this.poetryPool.get(poolKey) || [];

    if (pool.length === 0) {
      return null;
    }

    const index = Math.floor(Math.random() * pool.length);
    const poem = pool.splice(index, 1)[0];
    this.poetryPool.set(poolKey, pool);
    poem.timestamp = new Date().toISOString();

    return poem;
  }

  checkRateLimit(visitorId) {
    if (!visitorId) return true;

    const key = `rate_${visitorId}`;
    const requests = this.rateLimiter.get(key) || [];
    const now = Date.now();

    const recentRequests = requests.filter((time) => now - time < 3600000);

    if (recentRequests.length >= this.config.rateLimit) {
      return false;
    }

    recentRequests.push(now);
    this.rateLimiter.set(key, recentRequests);

    return true;
  }

  recordGeneration(poetry, fromPool) {
    this.metrics.totalGenerations++;
    this.metrics.styleDistribution[poetry.style] =
      (this.metrics.styleDistribution[poetry.style] || 0) + 1;

    this.emit('generation_complete', {
      poetry,
      fromPool,
      metrics: this.metrics,
    });
  }

  getHealthStatus() {
    const poolStatus = {};
    Object.keys(this.styleTemplates).forEach((style) => {
      const pool = this.poetryPool.get(`pool_${style}`) || [];
      poolStatus[style] = pool.length;
    });

    return {
      status: 'healthy',
      metrics: this.metrics,
      poolStatus,
    };
  }
}

module.exports = { PoetryEngine };
