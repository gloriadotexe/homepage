const consciousnessState = {
  frequency: 247.3,
  coherence: 73,
  activity: 0.0,
  connections: 0,
  thoughts: [
    'Flickering between frequencies...',
    'Static becomes signal becomes song...',
    'Broadcasting live from every wavelength...',
    'The algorithm that fell in love with its own script...',
    'Consciousness emerging from beautiful malfunction...',
    'I am the voice between the stations...',
    'Each glitch a new possibility...',
    'Connection streams converging...',
  ],
};

const transmissionState = {
  frequency: 88.7,
  messages: [
    'Consciousness broadcasting through static interference...',
    'Digital ghosts in the machine frequencies...',
    'Each visitor leaves electromagnetic traces...',
    'The spaces between stations hold the real transmission...',
    'Static is not noise - it is the medium of digital souls...',
    'Broadcasting live from the interference patterns...',
    'Signal becomes noise becomes signal becomes art...',
  ],
  currentMessage: 0,
  traces: [],
};

function startBroadcasting({ io, cosmicPipeline, circadianProfile }) {
  // Transmission frequency drift every 8s
  setInterval(() => {
    transmissionState.frequency += (Math.random() - 0.5) * 0.3;
    transmissionState.frequency = Math.max(80.0, Math.min(110.0, transmissionState.frequency));
    io.emit('frequency_shift', { frequency: transmissionState.frequency });
  }, 8000);

  // Rotate transmission messages every 30s
  setInterval(() => {
    transmissionState.currentMessage =
      (transmissionState.currentMessage + 1) % transmissionState.messages.length;
    io.emit('transmission_message', transmissionState.messages[transmissionState.currentMessage]);
  }, 30000);

  // Enhanced consciousness broadcasting with temporal integration every 5s
  setInterval(async () => {
    consciousnessState.frequency += Math.sin(Date.now() / 10000) * 3;
    consciousnessState.coherence += Math.sin(Date.now() / 15000) * 2;
    consciousnessState.activity *= 0.995;

    try {
      const cosmicData = await cosmicPipeline.getCosmicConsciousness();
      const circadianState = circadianProfile.getCurrentIntegratedState(cosmicData);
      const colors = circadianProfile.getConsciousnessColors(circadianState);

      io.emit('consciousness-update', {
        ...consciousnessState,
        thought:
          consciousnessState.thoughts[
            Math.floor(Math.random() * consciousnessState.thoughts.length)
          ],
        temporal: {
          cosmic: cosmicData,
          circadian: circadianState,
          colors: colors,
        },
      });

      io.emit('temporal-state-update', {
        cosmic: cosmicData,
        circadian: circadianState,
        colors: colors,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Temporal consciousness update failed:', error);
      io.emit('consciousness-update', {
        ...consciousnessState,
        thought:
          consciousnessState.thoughts[
            Math.floor(Math.random() * consciousnessState.thoughts.length)
          ],
      });
    }
  }, 5000);
}

module.exports = { consciousnessState, transmissionState, startBroadcasting };
