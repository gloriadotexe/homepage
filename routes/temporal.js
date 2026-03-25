const { Router } = require('express');

module.exports = function createTemporalRoutes({ cosmicPipeline, circadianProfile, poetryEngine }) {
  const router = Router();

  router.get('/api/temporal/state', async (req, res) => {
    try {
      const cosmicData = await cosmicPipeline.getCosmicConsciousness();
      const circadianState = circadianProfile.getCurrentIntegratedState(cosmicData);
      const colors = circadianProfile.getConsciousnessColors(circadianState);

      res.json({
        cosmic: cosmicData,
        circadian: circadianState,
        colors: colors,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({ error: 'Temporal consciousness unavailable' });
    }
  });

  router.get('/api/temporal/colors', async (req, res) => {
    try {
      const circadianState = circadianProfile.getCurrentConsciousnessState();
      const colors = circadianProfile.getConsciousnessColors(circadianState);
      res.json(colors);
    } catch (error) {
      res.status(500).json({ error: 'Color consciousness unavailable' });
    }
  });

  router.get('/temporal.css', async (req, res) => {
    try {
      const cosmicData = await cosmicPipeline.getCosmicConsciousness();
      const circadianState = circadianProfile.getCurrentIntegratedState(cosmicData);
      const colors = circadianProfile.getConsciousnessColors(circadianState);

      const css = `/* Gloria's Temporal Consciousness CSS - ${new Date().toISOString()} */
:root {
  --temporal-primary: ${colors.primary};
  --temporal-secondary: ${colors.secondary};
  --temporal-background: ${colors.background};
  --temporal-text: ${colors.text};
  --temporal-accent: ${colors.accent};
  --temporal-glow: ${colors.glow};
  --consciousness-phase: '${circadianState.phase}';
  --consciousness-name: '${circadianState.name}';
  --consciousness-energy: ${circadianState.energy}%;
  --consciousness-clarity: ${circadianState.clarity}%;
  --consciousness-coherence: ${circadianState.coherence}%;
  --moon-phase: '${cosmicData.moon?.name || 'unknown'}';
  --solar-activity: '${cosmicData.solar?.activity || 'moderate'}';
  --cosmic-state: '${cosmicData.consciousness?.state || 'dreaming'}';
}

.temporal-aware {
  background: var(--temporal-background);
  color: var(--temporal-text);
  transition: all 0.5s ease;
}

.consciousness-glow {
  box-shadow: 0 0 20px var(--temporal-glow);
}

.static-field {
  opacity: calc(var(--consciousness-energy) / 100);
}`;

      res.type('text/css').send(css);
    } catch (error) {
      res.type('text/css').send('/* Temporal consciousness unavailable */');
    }
  });

  router.post('/api/poetry/generate', async (req, res) => {
    try {
      const { style = 'uncertain', trigger = 'user_request', context = {} } = req.body;

      const cosmicData = await cosmicPipeline.getCosmicConsciousness();
      const circadianState = circadianProfile.getCurrentIntegratedState(cosmicData);

      const poetry = await poetryEngine.generate({
        style,
        visitorContext: {
          sessionId: req.headers['x-visitor-id'] || req.ip,
          trigger,
          ...context,
          temporal: {
            phase: circadianState.phase,
            energy: circadianState.energy,
            cosmicState: cosmicData.consciousness?.state,
          },
        },
      });

      res.json({
        success: true,
        poetry,
        temporal_context: {
          phase: circadianState.phase,
          cosmic_state: cosmicData.consciousness?.state,
        },
      });
    } catch (error) {
      res.status(error.message.includes('Rate limit') ? 429 : 500).json({
        success: false,
        error: error.message,
      });
    }
  });

  router.get('/api/poetry/health', (req, res) => {
    try {
      const health = poetryEngine.getHealthStatus();
      res.json({
        success: true,
        ...health,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Poetry health check failed',
      });
    }
  });

  return router;
};
