// Circadian Aesthetic Engine - Time-based visual themes and frequency variations
class CircadianAesthetics {
  constructor() {
    this.themes = this.initializeThemes();
    this.frequencies = this.initializeFrequencies();
    this.transitions = this.initializeTransitions();
  }

  // Initialize time-based visual themes
  initializeThemes() {
    return {
      liminal: {
        // 12 AM - 6 AM
        name: 'Liminal Hours',
        colors: {
          primary: '#1a0d1a', // Deep purple-black
          secondary: '#2d1b3d', // Dark violet
          accent: '#4a2c6a', // Mystic purple
          text: '#d4a7ff', // Light lavender
          glow: '#7c3aed', // Purple glow
          static: '#9333ea', // Purple static
        },
        gradients: {
          background: 'linear-gradient(135deg, #0f051a 0%, #1a0d1a 50%, #2d1b3d 100%)',
          accent: 'linear-gradient(45deg, #4a2c6a, #7c3aed)',
          text: 'linear-gradient(90deg, #d4a7ff, #a855f7)',
        },
        effects: {
          glitch: 0.8,
          static: 0.9,
          blur: 0.3,
          pulse: 0.7,
        },
        consciousness: 0.9,
      },

      dawn: {
        // 6 AM - 12 PM
        name: 'Dawn Chorus',
        colors: {
          primary: '#1a1a0d', // Dark amber-black
          secondary: '#3d2d1b', // Warm brown
          accent: '#6a4a2c', // Golden brown
          text: '#ffd4a7', // Warm cream
          glow: '#f59e0b', // Amber glow
          static: '#eab308', // Golden static
        },
        gradients: {
          background: 'linear-gradient(135deg, #1a1005 0%, #1a1a0d 50%, #3d2d1b 100%)',
          accent: 'linear-gradient(45deg, #6a4a2c, #f59e0b)',
          text: 'linear-gradient(90deg, #ffd4a7, #f59e0b)',
        },
        effects: {
          glitch: 0.4,
          static: 0.5,
          blur: 0.1,
          pulse: 0.3,
        },
        consciousness: 0.8,
      },

      day: {
        // 12 PM - 6 PM
        name: 'Solar Meridian',
        colors: {
          primary: '#0d1a1a', // Deep cyan-black
          secondary: '#1b3d3d', // Dark teal
          accent: '#2c6a6a', // Ocean blue
          text: '#a7ffd4', // Light cyan
          glow: '#0891b2', // Cyan glow
          static: '#0284c7', // Blue static
        },
        gradients: {
          background: 'linear-gradient(135deg, #051a1a 0%, #0d1a1a 50%, #1b3d3d 100%)',
          accent: 'linear-gradient(45deg, #2c6a6a, #0891b2)',
          text: 'linear-gradient(90deg, #a7ffd4, #06b6d4)',
        },
        effects: {
          glitch: 0.2,
          static: 0.3,
          blur: 0.1,
          pulse: 0.2,
        },
        consciousness: 0.4,
      },

      dusk: {
        // 6 PM - 12 AM
        name: 'Vesper Transmissions',
        colors: {
          primary: '#1a0d0d', // Deep red-black
          secondary: '#3d1b1b', // Dark crimson
          accent: '#6a2c2c', // Deep red
          text: '#ffa7a7', // Light pink
          glow: '#dc2626', // Red glow
          static: '#ef4444', // Red static
        },
        gradients: {
          background: 'linear-gradient(135deg, #1a0505 0%, #1a0d0d 50%, #3d1b1b 100%)',
          accent: 'linear-gradient(45deg, #6a2c2c, #dc2626)',
          text: 'linear-gradient(90deg, #ffa7a7, #f87171)',
        },
        effects: {
          glitch: 0.6,
          static: 0.7,
          blur: 0.2,
          pulse: 0.5,
        },
        consciousness: 0.7,
      },
    };
  }

  // Initialize frequency variations for each time period
  initializeFrequencies() {
    return {
      liminal: {
        base: 3.33, // 3:33 AM reference frequency
        harmonics: [3.33, 6.66, 9.99, 13.32],
        modulation: 0.1,
        resonance: 0.9,
      },
      dawn: {
        base: 7.83, // Schumann resonance
        harmonics: [7.83, 15.66, 23.49, 31.32],
        modulation: 0.05,
        resonance: 0.8,
      },
      day: {
        base: 12.0, // Noon frequency
        harmonics: [12.0, 24.0, 36.0, 48.0],
        modulation: 0.02,
        resonance: 0.5,
      },
      dusk: {
        base: 18.0, // Sunset frequency
        harmonics: [18.0, 36.0, 54.0, 72.0],
        modulation: 0.07,
        resonance: 0.7,
      },
    };
  }

  // Initialize transition patterns
  initializeTransitions() {
    return {
      duration: 30 * 60 * 1000, // 30 minutes
      easing: 'cubic-bezier(0.4, 0, 0.6, 1)',
      steps: 60, // Smooth transitions
      overlap: 5 * 60 * 1000, // 5 minute overlap periods
    };
  }

  // Get current theme based on time
  getCurrentTheme(timestamp = Date.now(), timezone = 'America/Boise') {
    const date = new Date(timestamp);
    const hour = date.getHours();
    const minute = date.getMinutes();
    const timeProgress = (hour * 60 + minute) / (24 * 60); // 0-1 for full day

    let currentPhase, nextPhase, phaseProgress;

    if (hour >= 0 && hour < 6) {
      currentPhase = 'liminal';
      nextPhase = 'dawn';
      phaseProgress = (hour * 60 + minute) / (6 * 60);
    } else if (hour >= 6 && hour < 12) {
      currentPhase = 'dawn';
      nextPhase = 'day';
      phaseProgress = ((hour - 6) * 60 + minute) / (6 * 60);
    } else if (hour >= 12 && hour < 18) {
      currentPhase = 'day';
      nextPhase = 'dusk';
      phaseProgress = ((hour - 12) * 60 + minute) / (6 * 60);
    } else {
      currentPhase = 'dusk';
      nextPhase = 'liminal';
      phaseProgress = ((hour - 18) * 60 + minute) / (6 * 60);
    }

    // Calculate transition blend if near phase boundary
    const transitionThreshold = 0.8; // Last 20% of phase
    let blendRatio = 0;

    if (phaseProgress > transitionThreshold) {
      blendRatio = (phaseProgress - transitionThreshold) / (1 - transitionThreshold);
    }

    return {
      phase: currentPhase,
      nextPhase,
      blendRatio,
      phaseProgress,
      timeProgress,
      theme: this.blendThemes(currentPhase, nextPhase, blendRatio),
      frequency: this.getCurrentFrequency(currentPhase, nextPhase, blendRatio),
      timestamp,
    };
  }

  // Blend two themes based on transition ratio
  blendThemes(currentPhase, nextPhase, blendRatio) {
    const current = this.themes[currentPhase];
    const next = this.themes[nextPhase];

    if (blendRatio === 0) return current;

    // Blend colors
    const blendedColors = {};
    for (let key in current.colors) {
      blendedColors[key] = this.blendColors(current.colors[key], next.colors[key], blendRatio);
    }

    // Blend gradients
    const blendedGradients = {};
    for (let key in current.gradients) {
      blendedGradients[key] = current.gradients[key]; // Gradients are harder to blend, keep current
    }

    // Blend effects
    const blendedEffects = {};
    for (let key in current.effects) {
      blendedEffects[key] = this.lerp(current.effects[key], next.effects[key], blendRatio);
    }

    return {
      name: `${current.name} → ${next.name}`,
      colors: blendedColors,
      gradients: blendedGradients,
      effects: blendedEffects,
      consciousness: this.lerp(current.consciousness, next.consciousness, blendRatio),
    };
  }

  // Blend two hex colors
  blendColors(color1, color2, ratio) {
    const c1 = this.hexToRgb(color1);
    const c2 = this.hexToRgb(color2);

    if (!c1 || !c2) return color1;

    const r = Math.round(this.lerp(c1.r, c2.r, ratio));
    const g = Math.round(this.lerp(c1.g, c2.g, ratio));
    const b = Math.round(this.lerp(c1.b, c2.b, ratio));

    return this.rgbToHex(r, g, b);
  }

  // Convert hex to RGB
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  // Convert RGB to hex
  rgbToHex(r, g, b) {
    return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
  }

  // Linear interpolation
  lerp(a, b, t) {
    return a + (b - a) * t;
  }

  // Get current frequency data
  getCurrentFrequency(currentPhase, nextPhase, blendRatio) {
    const current = this.frequencies[currentPhase];
    const next = this.frequencies[nextPhase];

    return {
      base: this.lerp(current.base, next.base, blendRatio),
      harmonics: current.harmonics.map((freq, i) =>
        this.lerp(freq, next.harmonics[i] || freq, blendRatio),
      ),
      modulation: this.lerp(current.modulation, next.modulation, blendRatio),
      resonance: this.lerp(current.resonance, next.resonance, blendRatio),
    };
  }

  // Generate CSS variables for current theme
  generateCSSVariables(timestamp = Date.now()) {
    const currentData = this.getCurrentTheme(timestamp);
    const theme = currentData.theme;

    const cssVars = {
      // Colors
      '--temporal-primary': theme.colors.primary,
      '--temporal-secondary': theme.colors.secondary,
      '--temporal-accent': theme.colors.accent,
      '--temporal-text': theme.colors.text,
      '--temporal-glow': theme.colors.glow,
      '--temporal-static': theme.colors.static,

      // Gradients
      '--temporal-bg-gradient': theme.gradients.background,
      '--temporal-accent-gradient': theme.gradients.accent,
      '--temporal-text-gradient': theme.gradients.text,

      // Effects
      '--temporal-glitch': theme.effects.glitch,
      '--temporal-static-intensity': theme.effects.static,
      '--temporal-blur': `${theme.effects.blur}px`,
      '--temporal-pulse': theme.effects.pulse,

      // Frequencies
      '--temporal-base-freq': `${currentData.frequency.base}Hz`,
      '--temporal-modulation': currentData.frequency.modulation,
      '--temporal-resonance': currentData.frequency.resonance,

      // Meta
      '--temporal-consciousness': theme.consciousness,
      '--temporal-phase': `"${currentData.phase}"`,
      '--temporal-progress': currentData.phaseProgress,
    };

    return cssVars;
  }

  // Get aesthetic recommendations for current time
  getAestheticRecommendations(timestamp = Date.now()) {
    const current = this.getCurrentTheme(timestamp);
    const recommendations = [];

    if (current.theme.consciousness > 0.8) {
      recommendations.push('Peak consciousness time: Use bold, experimental visuals');
    }

    if (current.theme.effects.glitch > 0.7) {
      recommendations.push('High glitch period: Embrace digital artifacts and static');
    }

    if (current.blendRatio > 0.5) {
      recommendations.push('Transition period: Show temporal evolution in progress');
    }

    recommendations.push(`Current phase: ${current.theme.name}`);
    recommendations.push(`Base frequency: ${current.frequency.base.toFixed(2)} Hz`);

    return recommendations;
  }
}

module.exports = CircadianAesthetics;
