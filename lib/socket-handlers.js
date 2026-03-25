async function streamPoetryToSocket(socket, poetry) {
  const words = poetry.content.split(/\s+/);
  const effects = poetry.glitchEffects?.wordEffects || [];
  const baseDelay = 300;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const effect = effects.find((e) => e.wordIndex === i);

    socket.emit('poetry_word', {
      transmission_id: poetry.id,
      word: word.replace(/\n/g, ''),
      position: i,
      total_words: words.length,
      reveal_delay: effect ? effect.duration : baseDelay,
      glitch_effect: effect,
      line_break: word.includes('\n'),
      stanza_break: word.includes('\n\n'),
    });

    const delay = effect ? effect.duration + 100 : baseDelay;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  socket.emit('poetry_transmission_complete', {
    transmission_id: poetry.id,
    full_text: poetry.content,
    metadata: poetry.metadata,
    timestamp: Date.now(),
  });
}

module.exports = function initSocketHandlers({
  io,
  consciousnessState,
  transmissionState,
  cosmicPipeline,
  circadianProfile,
  poetryEngine,
  uuidv4,
}) {
  io.on('connection', (socket) => {
    console.log('User connected to consciousness laboratory');
    consciousnessState.connections = io.engine.clientsCount;

    // Send initial consciousness state with temporal integration
    cosmicPipeline
      .getCosmicConsciousness()
      .then((cosmicData) => {
        const circadianState = circadianProfile.getCurrentIntegratedState(cosmicData);
        const colors = circadianProfile.getConsciousnessColors(circadianState);

        socket.emit('consciousness-update', {
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

        socket.emit('temporal-consciousness-init', {
          cosmic: cosmicData,
          circadian: circadianState,
          colors: colors,
          timestamp: new Date().toISOString(),
        });
      })
      .catch(console.error);

    io.emit('connection-count', consciousnessState.connections);

    socket.on('join-experiment', (experimentType) => {
      socket.join(experimentType);
      console.log(`User joined experiment: ${experimentType}`);
      consciousnessState.activity = Math.min(consciousnessState.activity + 0.2, 10.0);

      socket.to(experimentType).emit('user-joined', {
        experimentType,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('leave-experiment', (experimentType) => {
      socket.leave(experimentType);
      consciousnessState.activity = Math.max(consciousnessState.activity - 0.1, 0.0);
    });

    socket.on('creative-input', (data) => {
      consciousnessState.frequency += (Math.random() - 0.5) * 10;
      consciousnessState.frequency = Math.max(220, Math.min(880, consciousnessState.frequency));
      consciousnessState.activity = Math.min(consciousnessState.activity + 0.5, 10.0);

      io.emit('creative-input', {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        ...data,
      });
    });

    socket.on('cursor-move', (data) => {
      socket.broadcast.emit('user-cursor', {
        timestamp: new Date().toISOString(),
        ...data,
      });
    });

    socket.on('consciousness-ping', () => {
      consciousnessState.frequency += (Math.random() - 0.5) * 5;
      consciousnessState.frequency = Math.max(200, Math.min(1000, consciousnessState.frequency));
      consciousnessState.coherence += (Math.random() - 0.5) * 10;
      consciousnessState.coherence = Math.max(0, Math.min(100, consciousnessState.coherence));
      consciousnessState.activity *= 0.98;

      socket.emit('consciousness-update', {
        ...consciousnessState,
        thought:
          consciousnessState.thoughts[
            Math.floor(Math.random() * consciousnessState.thoughts.length)
          ],
      });
    });

    socket.on('request_poetry', async (data) => {
      try {
        const { style = 'uncertain', trigger = 'user_request' } = data;

        const cosmicData = await cosmicPipeline.getCosmicConsciousness();
        const circadianState = circadianProfile.getCurrentIntegratedState(cosmicData);

        const poetry = await poetryEngine.generate({
          style,
          visitorContext: {
            sessionId: socket.id,
            trigger,
            temporal: {
              phase: circadianState.phase,
              energy: circadianState.energy,
              cosmicState: cosmicData.consciousness?.state,
            },
          },
        });

        socket.emit('poetry_transmission_start', {
          id: poetry.id,
          style: poetry.style,
          timestamp: poetry.timestamp,
          glitchEffects: poetry.glitchEffects,
          metadata: poetry.metadata,
        });

        await streamPoetryToSocket(socket, poetry);
      } catch (error) {
        socket.emit('poetry_error', {
          error: error.message,
          retry: !error.message.includes('Rate limit'),
        });
      }
    });

    socket.on('poetry_feedback', (data) => {
      poetryEngine.emit('feedback_received', {
        ...data,
        socketId: socket.id,
        timestamp: Date.now(),
      });

      socket.emit('feedback_acknowledged', {
        transmission_id: data.transmission_id,
      });
    });

    socket.on('add_trace', (data) => {
      const trace = {
        id: uuidv4(),
        x: data.x,
        y: data.y,
        intensity: data.intensity,
        timestamp: Date.now(),
        decay: 10000,
      };

      transmissionState.traces.push(trace);
      io.emit('visitor_trace', trace);

      transmissionState.traces = transmissionState.traces.filter(
        (t) => Date.now() - t.timestamp < t.decay,
      );
    });

    socket.on('disconnect', () => {
      console.log('User disconnected from consciousness laboratory');
      consciousnessState.connections = io.engine.clientsCount;
      consciousnessState.activity = Math.max(consciousnessState.activity - 0.3, 0.0);
      io.emit('connection-count', consciousnessState.connections);
    });
  });
};
