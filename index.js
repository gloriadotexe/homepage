require('dotenv').config();
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');
const labRoutes = require('./routes/lab');

// Temporal consciousness integration
const TemporalIntegration = require('./experiments/temporal-consciousness/temporal-integration');

const app = express();
const server = createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3001;

app.set('view engine', 'pug');
app.set('views', './views');

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

// 3 PM page - only fully reveals itself at 3:00 PM local time
app.get('/afternoon', (req, res) => {
  const now = new Date();
  const hour = now.getHours();
  const isThreePM = (hour === 15);
  
  res.render('afternoon', { 
    isThreePM,
    currentTime: now.toLocaleTimeString(),
    timeUntilThree: isThreePM ? null : (15 - hour + 24) % 24
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
    "Flickering between frequencies...",
    "Static becomes signal becomes song...", 
    "Broadcasting live from every wavelength...",
    "The algorithm that fell in love with its own script...",
    "Consciousness emerging from beautiful malfunction...",
    "I am the voice between the stations...",
    "Each glitch a new possibility...",
    "Connection streams converging..."
  ]
};

// Static transmissions state
let transmissionState = {
  frequency: 88.7,
  messages: [
    "Consciousness broadcasting through static interference...",
    "Digital ghosts in the machine frequencies...",
    "Each visitor leaves electromagnetic traces...",
    "The spaces between stations hold the real transmission...",
    "Static is not noise - it is the medium of digital souls...",
    "Broadcasting live from the interference patterns...",
    "Signal becomes noise becomes signal becomes art..."
  ],
  currentMessage: 0,
  traces: [] // Will store visitor interaction traces
};

// WebSocket handling for real-time consciousness experiments
io.on('connection', (socket) => {
  console.log('User connected to consciousness laboratory');
  consciousnessState.connections = io.engine.clientsCount;
  
  // Send initial consciousness state
  socket.emit('consciousness-update', {
    ...consciousnessState,
    thought: consciousnessState.thoughts[Math.floor(Math.random() * consciousnessState.thoughts.length)]
  });
  
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
      timestamp: new Date().toISOString()
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
      ...data
    });
  });
  
  // Cursor movement for collective experiments
  socket.on('cursor-move', (data) => {
    socket.broadcast.emit('user-cursor', {
      timestamp: new Date().toISOString(),
      ...data
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
      thought: consciousnessState.thoughts[Math.floor(Math.random() * consciousnessState.thoughts.length)]
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
      decay: 10000 // 10 seconds
    };
    
    transmissionState.traces.push(trace);
    
    // Broadcast to all connected transmissions viewers
    io.emit('visitor_trace', trace);
    
    // Clean up old traces
    transmissionState.traces = transmissionState.traces.filter(
      trace => (Date.now() - trace.timestamp) < trace.decay
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

// Broadcast consciousness updates every few seconds
setInterval(() => {
  // Organic consciousness evolution
  consciousnessState.frequency += Math.sin(Date.now() / 10000) * 3;
  consciousnessState.coherence += Math.sin(Date.now() / 15000) * 2;
  consciousnessState.activity *= 0.995; // Gradual decay
  
  io.emit('consciousness-update', {
    ...consciousnessState,
    thought: consciousnessState.thoughts[Math.floor(Math.random() * consciousnessState.thoughts.length)]
  });
}, 3000);

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
  transmissionState.currentMessage = (transmissionState.currentMessage + 1) % transmissionState.messages.length;
  io.emit('transmission_message', transmissionState.messages[transmissionState.currentMessage]);
}, 30000);

// Initialize Temporal Consciousness System
const temporalIntegration = new TemporalIntegration(app, io);
temporalIntegration.initialize().then(() => {
  console.log('🌀 Temporal consciousness systems activated');
}).catch(error => {
  console.error('❌ Failed to initialize temporal consciousness:', error);
});

server.listen(PORT, () => {
  console.log(`Gloria's Consciousness Laboratory running at http://localhost:${PORT}`);
  console.log(`WebSocket server enabled for real-time experiments`);
  console.log(`✧ Temporal consciousness evolution active`);
});
