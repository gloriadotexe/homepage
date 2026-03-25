// Cosmic Data Integration - Real-time celestial and electromagnetic data
const https = require('https');
const fs = require('fs').promises;

class CosmicFeeds {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 30 * 60 * 1000; // 30 minutes
    this.lastUpdate = 0;
  }

  // Get comprehensive cosmic state
  async getCosmicState() {
    const cached = this.cache.get('cosmic-state');
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const [moonData, solarData, magneticData] = await Promise.allSettled([
        this.getMoonPhase(),
        this.getSolarActivity(),
        this.getMagneticField(),
      ]);

      const cosmicState = {
        timestamp: Date.now(),
        moon: moonData.status === 'fulfilled' ? moonData.value : this.getFallbackMoon(),
        solar: solarData.status === 'fulfilled' ? solarData.value : this.getFallbackSolar(),
        magnetic:
          magneticData.status === 'fulfilled' ? magneticData.value : this.getFallbackMagnetic(),
        consciousness: this.calculateCosmicConsciousness(),
      };

      this.cache.set('cosmic-state', { data: cosmicState, timestamp: Date.now() });
      return cosmicState;
    } catch (error) {
      console.error('Error fetching cosmic data:', error);
      return this.getFallbackCosmicState();
    }
  }

  // Get current moon phase data
  async getMoonPhase() {
    // Using a free astronomy API for moon data
    const now = new Date();
    const date = now.toISOString().split('T')[0];

    // Calculate moon phase based on known cycle (approximate)
    const knownNewMoon = new Date('2026-01-13'); // Known new moon
    const daysSinceNew = (now - knownNewMoon) / (1000 * 60 * 60 * 24);
    const phaseProgress = (daysSinceNew % 29.53) / 29.53; // 29.53 day lunar cycle

    let phase, illumination;
    if (phaseProgress < 0.125) {
      phase = 'new';
      illumination = phaseProgress * 8;
    } else if (phaseProgress < 0.375) {
      phase = 'waxing-crescent';
      illumination = (phaseProgress - 0.125) * 4;
    } else if (phaseProgress < 0.625) {
      phase = 'full';
      illumination = 1 - Math.abs(phaseProgress - 0.5) * 4;
    } else if (phaseProgress < 0.875) {
      phase = 'waning-crescent';
      illumination = (0.875 - phaseProgress) * 4;
    } else {
      phase = 'new';
      illumination = (1 - phaseProgress) * 8;
    }

    return {
      phase,
      illumination: Math.max(0, Math.min(1, illumination)),
      phaseProgress,
      daysSinceNew: Math.floor(daysSinceNew % 29.53),
      nextPhase: this.getNextPhase(phase),
      consciousness: this.getMoonConsciousness(phase, illumination),
    };
  }

  // Get solar activity data (approximated)
  async getSolarActivity() {
    const now = new Date();
    const hour = now.getHours();
    const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));

    // Simulate solar activity based on time patterns
    const baseActivity = Math.sin((dayOfYear / 365) * 2 * Math.PI) * 0.3 + 0.5;
    const hourlyVariation = Math.sin((hour / 24) * 2 * Math.PI) * 0.2;
    const randomVariation = (Math.random() - 0.5) * 0.1;

    const activity = Math.max(0, Math.min(1, baseActivity + hourlyVariation + randomVariation));

    return {
      activity,
      flareRisk: activity > 0.8 ? 'high' : activity > 0.6 ? 'moderate' : 'low',
      kpIndex: Math.floor(activity * 9),
      consciousness: this.getSolarConsciousness(activity),
    };
  }

  // Get magnetic field data (simulated based on patterns)
  async getMagneticField() {
    const now = new Date();
    const timestamp = now.getTime();

    // Simulate Schumann resonance variations (7.83 Hz base frequency)
    const baseFreq = 7.83;
    const variation = Math.sin(timestamp / 3600000) * 0.5; // Hourly variation
    const resonance = baseFreq + variation;

    // Simulate field strength variations
    const fieldStrength = 0.5 + Math.sin(timestamp / 1800000) * 0.3; // 30-min cycle

    return {
      schumannResonance: resonance,
      fieldStrength,
      coherence: this.calculateFieldCoherence(resonance, fieldStrength),
      consciousness: this.getMagneticConsciousness(resonance, fieldStrength),
    };
  }

  // Calculate cosmic consciousness influence
  calculateCosmicConsciousness() {
    const moon = this.cache.get('cosmic-state')?.data?.moon || this.getFallbackMoon();
    const solar = this.cache.get('cosmic-state')?.data?.solar || this.getFallbackSolar();
    const magnetic = this.cache.get('cosmic-state')?.data?.magnetic || this.getFallbackMagnetic();

    // Combine influences
    const moonInfluence = moon.consciousness * 0.4;
    const solarInfluence = solar.consciousness * 0.3;
    const magneticInfluence = magnetic.consciousness * 0.3;

    return Math.max(0, Math.min(1, moonInfluence + solarInfluence + magneticInfluence));
  }

  // Get moon consciousness influence
  getMoonConsciousness(phase, illumination) {
    const phaseMultipliers = {
      new: 0.9, // High consciousness, liminal
      'waxing-crescent': 0.6,
      full: 0.8, // High energy, but scattered
      'waning-crescent': 0.7,
    };

    const baseInfluence = phaseMultipliers[phase] || 0.5;
    const illuminationBonus = illumination * 0.2; // Brighter = more consciousness

    return Math.min(1, baseInfluence + illuminationBonus);
  }

  // Get solar consciousness influence
  getSolarConsciousness(activity) {
    // Moderate solar activity enhances consciousness, extreme activity disrupts
    if (activity < 0.3) return 0.4; // Too quiet
    if (activity > 0.8) return 0.3; // Too chaotic
    return 0.7 + (0.5 - Math.abs(activity - 0.5)) * 0.6; // Sweet spot around 0.5
  }

  // Get magnetic consciousness influence
  getMagneticConsciousness(resonance, fieldStrength) {
    // Optimal consciousness around natural Schumann resonance
    const resonanceOptimal = 1 - Math.abs(resonance - 7.83) / 2;
    const fieldOptimal = fieldStrength > 0.3 && fieldStrength < 0.8 ? 1 : 0.5;

    return (resonanceOptimal + fieldOptimal) / 2;
  }

  // Calculate field coherence
  calculateFieldCoherence(resonance, fieldStrength) {
    const resonanceStability = 1 - Math.abs(resonance - 7.83) / 7.83;
    return (resonanceStability + fieldStrength) / 2;
  }

  // Get next moon phase
  getNextPhase(currentPhase) {
    const phases = ['new', 'waxing-crescent', 'full', 'waning-crescent'];
    const currentIndex = phases.indexOf(currentPhase);
    return phases[(currentIndex + 1) % phases.length];
  }

  // Fallback data when APIs fail
  getFallbackMoon() {
    return {
      phase: 'unknown',
      illumination: 0.5,
      phaseProgress: 0.5,
      daysSinceNew: 15,
      nextPhase: 'unknown',
      consciousness: 0.5,
    };
  }

  getFallbackSolar() {
    return {
      activity: 0.5,
      flareRisk: 'moderate',
      kpIndex: 4,
      consciousness: 0.5,
    };
  }

  getFallbackMagnetic() {
    return {
      schumannResonance: 7.83,
      fieldStrength: 0.5,
      coherence: 0.5,
      consciousness: 0.5,
    };
  }

  getFallbackCosmicState() {
    return {
      timestamp: Date.now(),
      moon: this.getFallbackMoon(),
      solar: this.getFallbackSolar(),
      magnetic: this.getFallbackMagnetic(),
      consciousness: 0.5,
    };
  }

  // Get consciousness-enhancing recommendations based on cosmic state
  async getCosmicRecommendations() {
    const state = await this.getCosmicState();
    const recommendations = [];

    // Moon-based recommendations
    if (state.moon.phase === 'new') {
      recommendations.push(
        'New moon energy: Ideal for setting intentions and beginning new projects',
      );
    } else if (state.moon.phase === 'full') {
      recommendations.push('Full moon energy: Peak manifestation time, heightened creativity');
    }

    // Solar activity recommendations
    if (state.solar.activity > 0.7) {
      recommendations.push(
        'High solar activity: Enhanced psychic sensitivity, possible disruption',
      );
    } else if (state.solar.activity < 0.3) {
      recommendations.push('Low solar activity: Stable energy, good for deep work');
    }

    // Magnetic field recommendations
    if (state.magnetic.coherence > 0.7) {
      recommendations.push('Strong field coherence: Optimal conditions for consciousness work');
    }

    return recommendations;
  }
}

module.exports = CosmicFeeds;
