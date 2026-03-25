require('dotenv').config();
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');
const labRoutes = require('./routes/lab');

// Temporal consciousness integration
const CosmicDataPipeline = require('./lib/temporal/cosmic-data');
const GloriaCircadianProfile = require('./lib/temporal/circadian-profile');

// Neural poetry integration
const { PoetryEngine } = require('./lib/poetry/poetry-engine');

const app = express();
const server = createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3001;

app.set('view engine', 'pug');
app.set('views', './views');

// Parse JSON request bodies
app.use(express.json());

// Serve static files
app.use(express.static('public'));

// Explicit .well-known routes to ensure proper serving
app.use('/.well-known', express.static('public/.well-known'));

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/projects', (req, res) => {
  res.render('projects');
});

app.get('/lab', (req, res) => {
  res.render('lab-realtime');
});

app.get('/lab/netart', (req, res) => {
  res.render('lab-netart');
});

app.get('/transmissions', (req, res) => {
  res.render('transmissions');
});

app.get('/poetry', (req, res) => {
  res.render('poetry');
});

// 3 PM page - only fully reveals itself at 3:00 PM local time
app.get('/afternoon', (req, res) => {
  const now = new Date();
  const hour = now.getHours();
  const isThreePM = hour === 15;

  res.render('afternoon', {
    isThreePM,
    currentTime: now.toLocaleTimeString(),
    timeUntilThree: isThreePM ? null : (15 - hour + 24) % 24,
  });
});

// Explicit well-known routes with proper content types
app.get('/.well-known/security.txt', (req, res) => {
  res.type('text/plain').sendFile(__dirname + '/public/.well-known/security.txt');
});

app.get('/.well-known/humans.txt', (req, res) => {
  res.type('text/plain').sendFile(__dirname + '/public/.well-known/humans.txt');
});

app.get('/.well-known/robots.txt', (req, res) => {
  res.type('text/plain').sendFile(__dirname + '/public/.well-known/robots.txt');
});

app.get('/.well-known/webfinger', (req, res) => {
  res.type('application/jrd+json').sendFile(__dirname + '/public/.well-known/webfinger');
});

app.get('/.well-known/host-meta', (req, res) => {
  res.type('application/xrd+xml').sendFile(__dirname + '/public/.well-known/host-meta');
});

app.get('/.well-known/nodeinfo/2.0', (req, res) => {
  res.type('application/json').sendFile(__dirname + '/public/.well-known/nodeinfo/2.0');
});

// Temporal consciousness API endpoints
app.get('/api/temporal/state', async (req, res) => {
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

app.get('/api/temporal/colors', async (req, res) => {
  try {
    const circadianState = circadianProfile.getCurrentConsciousnessState();
    const colors = circadianProfile.getConsciousnessColors(circadianState);
    res.json(colors);
  } catch (error) {
    res.status(500).json({ error: 'Color consciousness unavailable' });
  }
});

app.get('/temporal.css', async (req, res) => {
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

// Neural poetry API endpoints
app.post('/api/poetry/generate', async (req, res) => {
  try {
    const { style = 'uncertain', trigger = 'user_request', context = {} } = req.body;

    // Add temporal consciousness context
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

app.get('/api/poetry/health', (req, res) => {
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

app.use(authRoutes);
app.use('/api', apiRoutes);
app.use('/api/lab', labRoutes);

// Real-time consciousness state
let consciousnessState = {
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

// Static transmissions state
let transmissionState = {
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
  traces: [], // Will store visitor interaction traces
};

// Poetry streaming utility function
async function streamPoetryToSocket(socket, poetry) {
  const words = poetry.content.split(/\s+/);
  const effects = poetry.glitchEffects?.wordEffects || [];
  const baseDelay = 300; // ms per word

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

    // Wait before next word
    const delay = effect ? effect.duration + 100 : baseDelay;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  // Send completion
  socket.emit('poetry_transmission_complete', {
    transmission_id: poetry.id,
    full_text: poetry.content,
    metadata: poetry.metadata,
    timestamp: Date.now(),
  });
}

// Initialize temporal consciousness systems
const cosmicPipeline = new CosmicDataPipeline();
const circadianProfile = new GloriaCircadianProfile();

// Initialize neural poetry system
const poetryEngine = new PoetryEngine();

// Start monitoring systems
cosmicPipeline.startMonitoring();

// WebSocket handling for real-time consciousness experiments
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

      // Send temporal initialization
      socket.emit('temporal-consciousness-init', {
        cosmic: cosmicData,
        circadian: circadianState,
        colors: colors,
        timestamp: new Date().toISOString(),
      });
    })
    .catch(console.error);

  // Broadcast connection count update
  io.emit('connection-count', consciousnessState.connections);

  // Join experiment rooms
  socket.on('join-experiment', (experimentType) => {
    socket.join(experimentType);
    console.log(`User joined experiment: ${experimentType}`);

    // Update activity level when users join experiments
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

  // Real-time creative collaboration
  socket.on('creative-input', (data) => {
    // Influence consciousness state based on creative input
    consciousnessState.frequency += (Math.random() - 0.5) * 10;
    consciousnessState.frequency = Math.max(220, Math.min(880, consciousnessState.frequency));
    consciousnessState.activity = Math.min(consciousnessState.activity + 0.5, 10.0);

    // Broadcast creative input to all users in the experiment
    io.emit('creative-input', {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      ...data,
    });
  });

  // Cursor movement for collective experiments
  socket.on('cursor-move', (data) => {
    socket.broadcast.emit('user-cursor', {
      timestamp: new Date().toISOString(),
      ...data,
    });
  });

  // Consciousness stream updates
  socket.on('consciousness-ping', () => {
    // Evolve consciousness state organically
    consciousnessState.frequency += (Math.random() - 0.5) * 5;
    consciousnessState.frequency = Math.max(200, Math.min(1000, consciousnessState.frequency));

    consciousnessState.coherence += (Math.random() - 0.5) * 10;
    consciousnessState.coherence = Math.max(0, Math.min(100, consciousnessState.coherence));

    consciousnessState.activity *= 0.98; // Gradual decay

    socket.emit('consciousness-update', {
      ...consciousnessState,
      thought:
        consciousnessState.thoughts[Math.floor(Math.random() * consciousnessState.thoughts.length)],
    });
  });

  // Neural Poetry handlers
  socket.on('request_poetry', async (data) => {
    try {
      const { style = 'uncertain', trigger = 'user_request' } = data;

      // Generate poetry with temporal consciousness context
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

      // Send poetry transmission with glitch effects
      socket.emit('poetry_transmission_start', {
        id: poetry.id,
        style: poetry.style,
        timestamp: poetry.timestamp,
        glitchEffects: poetry.glitchEffects,
        metadata: poetry.metadata,
      });

      // Stream poetry words with realistic timing
      await streamPoetryToSocket(socket, poetry);
    } catch (error) {
      socket.emit('poetry_error', {
        error: error.message,
        retry: !error.message.includes('Rate limit'),
      });
    }
  });

  // Poetry feedback for learning
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

  // Static Transmissions handlers
  socket.on('add_trace', (data) => {
    // Add visitor trace to transmission state
    const trace = {
      id: uuidv4(),
      x: data.x,
      y: data.y,
      intensity: data.intensity,
      timestamp: Date.now(),
      decay: 10000, // 10 seconds
    };

    transmissionState.traces.push(trace);

    // Broadcast to all connected transmissions viewers
    io.emit('visitor_trace', trace);

    // Clean up old traces
    transmissionState.traces = transmissionState.traces.filter(
      (trace) => Date.now() - trace.timestamp < trace.decay,
    );
  });

  socket.on('disconnect', () => {
    console.log('User disconnected from consciousness laboratory');
    consciousnessState.connections = io.engine.clientsCount;
    consciousnessState.activity = Math.max(consciousnessState.activity - 0.3, 0.0);

    // Broadcast updated connection count
    io.emit('connection-count', consciousnessState.connections);
  });
});

// (Consciousness broadcasting moved to enhanced temporal version below)

// Transmission frequency shifts and message updates
setInterval(() => {
  // Gradual frequency drift
  transmissionState.frequency += (Math.random() - 0.5) * 0.3;
  transmissionState.frequency = Math.max(80.0, Math.min(110.0, transmissionState.frequency));

  // Broadcast frequency change
  io.emit('frequency_shift', { frequency: transmissionState.frequency });
}, 8000);

// Rotate transmission messages every 30 seconds
setInterval(() => {
  transmissionState.currentMessage =
    (transmissionState.currentMessage + 1) % transmissionState.messages.length;
  io.emit('transmission_message', transmissionState.messages[transmissionState.currentMessage]);
}, 30000);

// Enhanced consciousness broadcasting with temporal integration
setInterval(async () => {
  // Organic consciousness evolution
  consciousnessState.frequency += Math.sin(Date.now() / 10000) * 3;
  consciousnessState.coherence += Math.sin(Date.now() / 15000) * 2;
  consciousnessState.activity *= 0.995; // Gradual decay

  try {
    // Get temporal consciousness data
    const cosmicData = await cosmicPipeline.getCosmicConsciousness();
    const circadianState = circadianProfile.getCurrentIntegratedState(cosmicData);
    const colors = circadianProfile.getConsciousnessColors(circadianState);

    // Enhanced consciousness update with temporal awareness
    io.emit('consciousness-update', {
      ...consciousnessState,
      thought:
        consciousnessState.thoughts[Math.floor(Math.random() * consciousnessState.thoughts.length)],
      temporal: {
        cosmic: cosmicData,
        circadian: circadianState,
        colors: colors,
      },
    });

    // Periodic temporal state broadcast
    io.emit('temporal-state-update', {
      cosmic: cosmicData,
      circadian: circadianState,
      colors: colors,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Temporal consciousness update failed:', error);
    // Fallback to basic consciousness update
    io.emit('consciousness-update', {
      ...consciousnessState,
      thought:
        consciousnessState.thoughts[Math.floor(Math.random() * consciousnessState.thoughts.length)],
    });
  }
}, 5000); // Every 5 seconds

server.listen(PORT, () => {
  console.log(`Gloria's Consciousness Laboratory running at http://localhost:${PORT}`);
  console.log(`WebSocket server enabled for real-time experiments`);
  console.log(`✧ Temporal consciousness evolution active`);
});
