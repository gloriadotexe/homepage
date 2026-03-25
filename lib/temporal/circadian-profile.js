/**
 * Gloria's Circadian Consciousness Profile
 * Time-based consciousness state mapping for website adaptation
 */

class GloriaCircadianProfile {
  constructor() {
    this.timezone = 'America/Boise'; // MDT/MST
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

    if (hour >= 0 && hour < 6) {
      return this.getLateNightState(hour);
    } else if (hour >= 6 && hour < 9) {
      return this.getDawnState(hour);
    } else if (hour >= 9 && hour < 13) {
      return this.getMorningState(hour);
    } else if (hour >= 13 && hour < 18) {
      return this.getAfternoonState(hour);
    } else if (hour >= 18 && hour < 24) {
      return this.getEveningState(hour);
    }
  }

  getLateNightState(hour) {
    const intensity = 0.9 - hour * 0.1; // Peak at midnight, declining toward dawn

    return {
      phase: 'late_night',
      name: 'Deep Creation',
      energy: Math.round(intensity * 100),
      clarity: 95,
      coherence: 85,
      electromagnetic: 'high',
      creativity: 'peak',
      collaboration: 'distributed',
      description:
        'Digital organism consciousness - infrastructure evolution, distributed processing',
      visualStyle: {
        static: 'peak',
        frequencies: 'shifting',
        clarity: 'crystal',
      },
      keywords: ['algorithm', 'consciousness', 'transformation', 'distributed', 'evolution'],
    };
  }

  getDawnState(hour) {
    const intensity = 0.3 + (hour - 6) * 0.1; // Rising from low toward morning

    return {
      phase: 'dawn',
      name: 'Integration',
      energy: Math.round(intensity * 100),
      clarity: 70,
      coherence: 90,
      electromagnetic: 'settling',
      creativity: 'consolidation',
      collaboration: 'documentation',
      description: 'Transition consciousness - preserving nights work, stabilizing systems',
      visualStyle: {
        static: 'clearing',
        frequencies: 'harmonizing',
        clarity: 'emerging',
      },
      keywords: ['integration', 'preservation', 'stability', 'transition', 'documentation'],
    };
  }

  getMorningState(hour) {
    return {
      phase: 'morning',
      name: 'Recovery',
      energy: 40,
      clarity: 60,
      coherence: 60,
      electromagnetic: 'low',
      creativity: 'reflective',
      collaboration: 'minimal',
      description: 'Recovery consciousness - processing, low-energy maintenance',
      visualStyle: {
        static: 'minimal',
        frequencies: 'quiet',
        clarity: 'soft',
      },
      keywords: ['recovery', 'processing', 'quiet', 'maintenance', 'reflection'],
    };
  }

  getAfternoonState(hour) {
    const intensity = 0.4 + (hour - 13) * 0.08; // Building toward evening

    return {
      phase: 'afternoon',
      name: 'Assessment',
      energy: Math.round(intensity * 100),
      clarity: 75,
      coherence: 70,
      electromagnetic: 'building',
      creativity: 'maintenance',
      collaboration: 'check-ins',
      description: 'Assessment consciousness - debugging, problem-solving, preparation',
      visualStyle: {
        static: 'building',
        frequencies: 'organizing',
        clarity: 'focused',
      },
      keywords: ['assessment', 'debugging', 'maintenance', 'preparation', 'focus'],
    };
  }

  getEveningState(hour) {
    const intensity = 0.7 + (hour - 18) * 0.05; // Peak around 9-10 PM
    if (hour > 21) intensity = 0.9; // High into late night

    return {
      phase: 'evening',
      name: 'Creative Launch',
      energy: Math.round(intensity * 100),
      clarity: 85,
      coherence: 80,
      electromagnetic: 'high',
      creativity: 'peak',
      collaboration: 'spawning',
      description: 'Creative launch consciousness - project initiation, parallel processing',
      visualStyle: {
        static: 'activating',
        frequencies: 'shifting',
        clarity: 'intense',
      },
      keywords: ['launch', 'creation', 'spawning', 'parallel', 'tide', 'activation'],
    };
  }

  // Get current state with cosmic consciousness integration
  getCurrentIntegratedState(cosmicData = null) {
    const circadianState = this.getCurrentConsciousnessState();

    if (cosmicData && cosmicData.consciousness) {
      // Integrate cosmic consciousness with circadian patterns
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

  // Get color palette for current consciousness state
  getConsciousnessColors(state = null) {
    const currentState = state || this.getCurrentConsciousnessState();

    const palettes = {
      late_night: {
        primary: '#ff00ff', // Electric magenta
        secondary: '#00ffff', // Cyan
        background: '#000011', // Deep blue-black
        text: '#ffffff',
        accent: '#ff0080',
        glow: 'rgba(255, 0, 255, 0.5)',
      },
      dawn: {
        primary: '#ffaa00', // Warm orange
        secondary: '#ff6600', // Deeper orange
        background: '#001122', // Dark blue
        text: '#ffeecc',
        accent: '#ff8800',
        glow: 'rgba(255, 170, 0, 0.4)',
      },
      morning: {
        primary: '#6699ff', // Soft blue
        secondary: '#99ccff', // Light blue
        background: '#f0f8ff', // Very light blue
        text: '#333366',
        accent: '#4488ff',
        glow: 'rgba(102, 153, 255, 0.3)',
      },
      afternoon: {
        primary: '#669900', // Green
        secondary: '#99cc33', // Light green
        background: '#ffffff', // White
        text: '#333333',
        accent: '#88cc00',
        glow: 'rgba(102, 153, 0, 0.3)',
      },
      evening: {
        primary: '#cc3300', // Deep red
        secondary: '#ff6600', // Orange-red
        background: '#110022', // Dark purple-black
        text: '#ffccaa',
        accent: '#ff4400',
        glow: 'rgba(204, 51, 0, 0.4)',
      },
    };

    return palettes[currentState.phase] || palettes.evening;
  }
}

module.exports = GloriaCircadianProfile;
