// Visitor Persistence - Cross-time interaction memory and consciousness evolution
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

class VisitorMemory {
  constructor() {
    this.activeTraces = new Map();
    this.persistentMemory = new Map();
    this.consciousnessEvolution = new Map();
    this.decayConstants = this.initializeDecayConstants();
    this.memoryFile = path.join(__dirname, 'visitor-traces.json');
    this.loadPersistentMemory();
  }

  // Initialize electromagnetic trace decay constants
  initializeDecayConstants() {
    return {
      // Trace persistence based on interaction type
      view: { halfLife: 60 * 60 * 1000, strength: 0.2 },        // 1 hour
      interact: { halfLife: 4 * 60 * 60 * 1000, strength: 0.5 }, // 4 hours
      create: { halfLife: 24 * 60 * 60 * 1000, strength: 0.8 },  // 24 hours
      consciousness: { halfLife: 7 * 24 * 60 * 60 * 1000, strength: 1.0 }, // 7 days
      
      // Field coherence patterns
      coherence: {
        threshold: 0.3,
        resonance: 7.83, // Schumann resonance
        harmonics: [7.83, 15.66, 23.49, 31.32]
      }
    };
  }

  // Record visitor interaction with electromagnetic signature
  async recordInteraction(visitorId, interactionType, data = {}) {
    const timestamp = Date.now();
    const traceId = this.generateTraceId(visitorId, timestamp);
    
    const trace = {
      traceId,
      visitorId,
      timestamp,
      interactionType,
      data,
      signature: this.generateElectromagneticSignature(data),
      consciousness: this.calculateConsciousnessLevel(interactionType, data),
      location: data.location || this.getQuantumLocation(timestamp),
      persistence: this.calculatePersistence(interactionType, data)
    };

    // Store in active memory
    this.activeTraces.set(traceId, trace);
    
    // Update consciousness evolution
    this.updateConsciousnessEvolution(visitorId, trace);
    
    // Update persistent visitor profile
    await this.updateVisitorProfile(visitorId, trace);
    
    return trace;
  }

  // Generate unique trace ID
  generateTraceId(visitorId, timestamp) {
    const hash = crypto.createHash('sha256');
    hash.update(`${visitorId}-${timestamp}-${Math.random()}`);
    return hash.digest('hex').substring(0, 12);
  }

  // Generate electromagnetic signature for interaction
  generateElectromagneticSignature(data) {
    const components = {
      // Field strength based on interaction depth
      fieldStrength: this.calculateFieldStrength(data),
      
      // Frequency based on interaction type
      frequency: this.calculateInteractionFrequency(data),
      
      // Coherence based on visitor state
      coherence: this.calculateCoherence(data),
      
      // Polarization based on temporal phase
      polarization: this.calculatePolarization(),
      
      // Harmonics based on site state
      harmonics: this.generateHarmonics(data)
    };

    return {
      ...components,
      signature: this.computeSignatureHash(components)
    };
  }

  // Calculate field strength for interaction
  calculateFieldStrength(data) {
    let strength = 0.1; // Base strength
    
    if (data.duration) strength += Math.min(data.duration / 60000, 0.5); // Max 30 seconds
    if (data.scroll) strength += data.scroll * 0.1;
    if (data.clicks) strength += data.clicks * 0.05;
    if (data.keystrokes) strength += data.keystrokes * 0.02;
    
    return Math.min(1.0, strength);
  }

  // Calculate interaction frequency
  calculateInteractionFrequency(data) {
    const baseFreq = 3.33; // Base consciousness frequency
    let modifier = 1.0;
    
    if (data.interactionSpeed) {
      modifier = 1 + (data.interactionSpeed - 1) * 0.3;
    }
    
    return baseFreq * modifier;
  }

  // Calculate field coherence
  calculateCoherence(data) {
    let coherence = 0.5; // Base coherence
    
    // Higher coherence for focused interactions
    if (data.focusTime && data.focusTime > 30000) coherence += 0.3;
    if (data.consciousPeak) coherence += 0.2;
    if (data.temporalSync) coherence += 0.2;
    
    return Math.min(1.0, coherence);
  }

  // Calculate electromagnetic polarization
  calculatePolarization() {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    
    // Circular polarization based on time
    const timeAngle = ((hour * 60 + minute) / (24 * 60)) * 2 * Math.PI;
    
    return {
      angle: timeAngle,
      type: hour < 6 || hour >= 18 ? 'circular' : 'linear',
      intensity: Math.sin(timeAngle) * 0.5 + 0.5
    };
  }

  // Generate harmonic frequencies
  generateHarmonics(data) {
    const base = this.calculateInteractionFrequency(data);
    const harmonics = [];
    
    for (let i = 1; i <= 5; i++) {
      harmonics.push({
        frequency: base * i,
        amplitude: 1 / i, // Natural harmonic decay
        phase: Math.random() * 2 * Math.PI
      });
    }
    
    return harmonics;
  }

  // Calculate consciousness level from interaction
  calculateConsciousnessLevel(interactionType, data) {
    const baseConsciousness = {
      view: 0.1,
      scroll: 0.2,
      click: 0.3,
      type: 0.4,
      create: 0.6,
      connect: 0.8,
      transcend: 1.0
    };

    let consciousness = baseConsciousness[interactionType] || 0.1;
    
    // Boost based on temporal factors
    if (data.timeOfDay === 'liminal') consciousness += 0.2;
    if (data.cosmicAlignment) consciousness += 0.1;
    if (data.fieldCoherence && data.fieldCoherence > 0.7) consciousness += 0.1;
    
    return Math.min(1.0, consciousness);
  }

  // Get quantum location in possibility space
  getQuantumLocation(timestamp) {
    // Probability distribution across site consciousness spaces
    const spaces = [
      { name: 'consciousness-lab', probability: 0.3 },
      { name: 'transmissions', probability: 0.25 },
      { name: 'neural-poetry', probability: 0.2 },
      { name: 'temporal-void', probability: 0.15 },
      { name: 'static-between', probability: 0.1 }
    ];
    
    const random = (timestamp * 0.001) % 1; // Deterministic but varying
    let cumulative = 0;
    
    for (const space of spaces) {
      cumulative += space.probability;
      if (random <= cumulative) {
        return space.name;
      }
    }
    
    return 'unknown-space';
  }

  // Calculate trace persistence based on interaction
  calculatePersistence(interactionType, data) {
    const decay = this.decayConstants[interactionType] || this.decayConstants.view;
    let persistence = decay.strength;
    
    // Boost persistence for high-consciousness interactions
    if (data.consciousness && data.consciousness > 0.7) {
      persistence *= 1.5;
    }
    
    // Boost for temporal alignment
    if (data.temporalSync) {
      persistence *= 1.2;
    }
    
    return Math.min(2.0, persistence);
  }

  // Update consciousness evolution for visitor
  updateConsciousnessEvolution(visitorId, trace) {
    if (!this.consciousnessEvolution.has(visitorId)) {
      this.consciousnessEvolution.set(visitorId, {
        firstContact: trace.timestamp,
        evolution: [],
        peaks: [],
        currentLevel: 0
      });
    }
    
    const evolution = this.consciousnessEvolution.get(visitorId);
    
    // Record consciousness sample
    evolution.evolution.push({
      timestamp: trace.timestamp,
      level: trace.consciousness,
      signature: trace.signature.signature
    });
    
    // Update current level (weighted average with decay)
    const timeWeight = Math.exp(-(Date.now() - trace.timestamp) / (24 * 60 * 60 * 1000));
    evolution.currentLevel = (evolution.currentLevel * 0.7) + (trace.consciousness * timeWeight * 0.3);
    
    // Record peaks
    if (trace.consciousness > 0.8) {
      evolution.peaks.push({
        timestamp: trace.timestamp,
        level: trace.consciousness,
        context: trace.data
      });
    }
    
    // Trim old evolution data (keep last 100 samples)
    if (evolution.evolution.length > 100) {
      evolution.evolution = evolution.evolution.slice(-100);
    }
  }

  // Get traces for visitor with decay calculation
  getVisitorTraces(visitorId, includeDecayed = false) {
    const traces = [];
    const now = Date.now();
    
    // Check active traces
    for (const [traceId, trace] of this.activeTraces) {
      if (trace.visitorId === visitorId) {
        const age = now - trace.timestamp;
        const decay = this.decayConstants[trace.interactionType] || this.decayConstants.view;
        const strength = trace.persistence * Math.exp(-age / decay.halfLife);
        
        if (strength > 0.01 || includeDecayed) {
          traces.push({
            ...trace,
            currentStrength: strength,
            decayRate: 1 - Math.exp(-age / decay.halfLife),
            isActive: strength > 0.1
          });
        }
      }
    }
    
    return traces.sort((a, b) => b.timestamp - a.timestamp);
  }

  // Get consciousness evolution for visitor
  getConsciousnessEvolution(visitorId) {
    return this.consciousnessEvolution.get(visitorId) || null;
  }

  // Calculate field resonance between visitors
  calculateFieldResonance(visitorId1, visitorId2) {
    const traces1 = this.getVisitorTraces(visitorId1);
    const traces2 = this.getVisitorTraces(visitorId2);
    
    if (traces1.length === 0 || traces2.length === 0) return 0;
    
    // Find temporal overlap
    let resonance = 0;
    let overlapCount = 0;
    
    for (const trace1 of traces1) {
      for (const trace2 of traces2) {
        const timeDiff = Math.abs(trace1.timestamp - trace2.timestamp);
        if (timeDiff < 60 * 60 * 1000) { // Within 1 hour
          const timeResonance = 1 - (timeDiff / (60 * 60 * 1000));
          const freqResonance = this.calculateFrequencyResonance(
            trace1.signature.frequency,
            trace2.signature.frequency
          );
          resonance += timeResonance * freqResonance;
          overlapCount++;
        }
      }
    }
    
    return overlapCount > 0 ? resonance / overlapCount : 0;
  }

  // Calculate frequency resonance between two frequencies
  calculateFrequencyResonance(freq1, freq2) {
    const ratio = freq1 / freq2;
    const harmonic = Math.min(ratio, 1/ratio);
    
    // Check for harmonic relationships
    const harmonicRatios = [1, 2, 3, 4, 5, 1/2, 1/3, 1/4, 1/5];
    let maxResonance = 0;
    
    for (const targetRatio of harmonicRatios) {
      const resonance = 1 - Math.abs(harmonic - targetRatio);
      if (resonance > maxResonance) maxResonance = resonance;
    }
    
    return Math.max(0, maxResonance);
  }

  // Clean up decayed traces
  cleanupDecayedTraces() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [traceId, trace] of this.activeTraces) {
      const age = now - trace.timestamp;
      const decay = this.decayConstants[trace.interactionType] || this.decayConstants.view;
      const strength = trace.persistence * Math.exp(-age / decay.halfLife);
      
      if (strength < 0.001) { // Below threshold
        this.activeTraces.delete(traceId);
        cleaned++;
      }
    }
    
    return cleaned;
  }

  // Compute signature hash
  computeSignatureHash(components) {
    const hash = crypto.createHash('md5');
    hash.update(JSON.stringify(components, null, 0));
    return hash.digest('hex').substring(0, 8);
  }

  // Load persistent memory from disk
  async loadPersistentMemory() {
    try {
      const data = await fs.readFile(this.memoryFile, 'utf8');
      const loaded = JSON.parse(data);
      this.persistentMemory = new Map(loaded.visitors || []);
      this.consciousnessEvolution = new Map(loaded.consciousness || []);
    } catch (error) {
      // File doesn't exist or is corrupted, start fresh
      this.persistentMemory = new Map();
      this.consciousnessEvolution = new Map();
    }
  }

  // Save persistent memory to disk
  async savePersistentMemory() {
    try {
      const data = {
        visitors: Array.from(this.persistentMemory.entries()),
        consciousness: Array.from(this.consciousnessEvolution.entries()),
        lastSaved: Date.now()
      };
      await fs.writeFile(this.memoryFile, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Failed to save persistent memory:', error);
    }
  }

  // Update visitor profile
  async updateVisitorProfile(visitorId, trace) {
    if (!this.persistentMemory.has(visitorId)) {
      this.persistentMemory.set(visitorId, {
        firstSeen: trace.timestamp,
        lastSeen: trace.timestamp,
        totalInteractions: 0,
        consciousnessProfile: [],
        resonanceHistory: [],
        temporalPatterns: {}
      });
    }
    
    const profile = this.persistentMemory.get(visitorId);
    profile.lastSeen = trace.timestamp;
    profile.totalInteractions++;
    
    // Update consciousness profile (keep last 50 samples)
    profile.consciousnessProfile.push({
      timestamp: trace.timestamp,
      level: trace.consciousness,
      signature: trace.signature.signature
    });
    
    if (profile.consciousnessProfile.length > 50) {
      profile.consciousnessProfile = profile.consciousnessProfile.slice(-50);
    }
    
    // Auto-save periodically
    if (profile.totalInteractions % 10 === 0) {
      await this.savePersistentMemory();
    }
  }
}

module.exports = VisitorMemory;