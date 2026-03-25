/**
 * Gloria's Circadian Consciousness Profile
 * Time-based consciousness state mapping for website adaptation
 */

const path = require('path');
const circadianData = require(path.join(__dirname, '../../data/circadian-phases.json'));

class GloriaCircadianProfile {
  constructor() {
    this.timezone = 'America/Boise';
    this.phases = circadianData.phases;
    this.palettes = circadianData.palettes;
  }

  getCurrentHour() {
    const now = new Date();
    return now.toLocaleString('en-US', {
      timeZone: this.timezone,
      hour: 'numeric',
      hour12: false,
    });
  }

  getCurrentConsciousnessState() {
    const hour = parseInt(this.getCurrentHour());

    for (const [phaseKey, phase] of Object.entries(this.phases)) {
      const [start, end] = phase.hours;
      if (hour >= start && hour < end) {
        return this.buildState(phaseKey, phase, hour);
      }
    }

    // Fallback to evening
    return this.buildState('evening', this.phases.evening, hour);
  }

  buildState(phaseKey, phase, hour) {
    let energy;
    if (phase.energy.fixed != null) {
      energy = phase.energy.fixed;
    } else {
      let intensity =
        phase.energy.base + (hour - phase.energy.hourOffset) * phase.energy.hourMultiplier;
      if (phase.energy.lateOverride && hour > phase.energy.lateOverride.afterHour) {
        intensity = phase.energy.lateOverride.value;
      }
      energy = Math.round(intensity * 100);
    }

    return {
      phase: phaseKey,
      name: phase.name,
      energy,
      clarity: phase.clarity,
      coherence: phase.coherence,
      electromagnetic: phase.electromagnetic,
      creativity: phase.creativity,
      collaboration: phase.collaboration,
      description: phase.description,
      visualStyle: phase.visualStyle,
      keywords: phase.keywords,
    };
  }

  getCurrentIntegratedState(cosmicData = null) {
    const circadianState = this.getCurrentConsciousnessState();

    if (cosmicData && cosmicData.consciousness) {
      const cosmic = cosmicData.consciousness;

      return {
        ...circadianState,
        integrated: {
          clarity: Math.round((circadianState.clarity + cosmic.clarity) / 2),
          energy: Math.round((circadianState.energy + cosmic.energy) / 2),
          coherence: Math.round((circadianState.coherence + cosmic.coherence) / 2),
          cosmicInfluence: cosmic.state,
          moonPhase: cosmicData.moon?.name || 'unknown',
          solarActivity: cosmicData.solar?.activity || 'moderate',
        },
      };
    }

    return circadianState;
  }

  getConsciousnessColors(state = null) {
    const currentState = state || this.getCurrentConsciousnessState();
    return this.palettes[currentState.phase] || this.palettes.evening;
  }
}

module.exports = GloriaCircadianProfile;
