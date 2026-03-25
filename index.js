require('dotenv').config();
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');

const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');
const labRoutes = require('./routes/lab');
const createTemporalRoutes = require('./routes/temporal');

const { consciousnessState, transmissionState, startBroadcasting } = require('./lib/consciousness');
const initSocketHandlers = require('./lib/socket-handlers');

const CosmicDataPipeline = require('./lib/temporal/cosmic-data');
const GloriaCircadianProfile = require('./lib/temporal/circadian-profile');
const { PoetryEngine } = require('./lib/poetry/poetry-engine');

const app = express();
const server = createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3001;

app.set('view engine', 'pug');
app.set('views', './views');

app.use(express.json());
app.use(express.static('public'));
app.use('/.well-known', express.static('public/.well-known'));

// Page routes
app.get('/', (req, res) => res.render('index'));
app.get('/projects', (req, res) => res.render('projects'));
app.get('/lab', (req, res) => res.render('lab-realtime'));
app.get('/lab/netart', (req, res) => res.render('lab-netart'));
app.get('/transmissions', (req, res) => res.render('transmissions'));
app.get('/poetry', (req, res) => res.render('poetry'));

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

// Initialize shared services
const cosmicPipeline = new CosmicDataPipeline();
const circadianProfile = new GloriaCircadianProfile();
const poetryEngine = new PoetryEngine();
cosmicPipeline.startMonitoring();

// Mount route modules
app.use(createTemporalRoutes({ cosmicPipeline, circadianProfile, poetryEngine }));
app.use(authRoutes);
app.use('/api', apiRoutes);
app.use('/api/lab', labRoutes);

// Initialize real-time systems
initSocketHandlers({
  io,
  consciousnessState,
  transmissionState,
  cosmicPipeline,
  circadianProfile,
  poetryEngine,
  uuidv4,
});

startBroadcasting({ io, cosmicPipeline, circadianProfile });

server.listen(PORT, () => {
  console.log(`Gloria's Consciousness Laboratory running at http://localhost:${PORT}`);
  console.log(`WebSocket server enabled for real-time experiments`);
});
