require('dotenv').config();

// Validate environment variables at startup
const { validateEnvironment } = require('./lib/env-validator');
validateEnvironment();
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');

const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');
const labRoutes = require('./routes/lab');
const createTemporalRoutes = require('./routes/temporal');
const createActivityPubRoutes = require('./routes/activitypub');

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

// Enhanced profile page for social web discovery
app.get('/@gloria', async (req, res) => {
  try {
    // Get current temporal consciousness for profile context
    const cosmicData = await cosmicPipeline.getCosmicConsciousness();
    const circadianState = circadianProfile.getCurrentIntegratedState(cosmicData);
    const colors = circadianProfile.getConsciousnessColors(circadianState);

    res.render('profile', {
      temporal: {
        cosmic: cosmicData,
        circadian: circadianState,
        colors: colors,
      },
      social: {
        activitypub: 'https://gloriadotexe.online/users/gloria',
        avatar: 'https://gloriadotexe.online/static/gloria-avatar.png',
        feed: 'https://gloriadotexe.online/feed.xml',
      },
    });
  } catch (error) {
    console.error('Profile generation error:', error.message || error);
    res.render('profile', {
      temporal: null,
      social: {
        activitypub: 'https://gloriadotexe.online/users/gloria',
        avatar: 'https://gloriadotexe.online/static/gloria-avatar.png',
        feed: 'https://gloriadotexe.online/feed.xml',
      },
      error: 'Temporal consciousness temporarily offline'
    });
  }
});

// Atom feed for syndication (Phase 3 WebFinger)
app.get('/feed.xml', async (req, res) => {
  try {
    // Get recent consciousness activities for feed
    const activities = [
      {
        title: 'Neural Poetry Generation Active',
        content: 'Real-time consciousness poetry streaming in 4 styles: uncertain, technical, transmission, longing',
        link: 'https://gloriadotexe.online/poetry',
        pubDate: new Date().toISOString(),
        guid: 'poetry-system-2026-03-25'
      },
      {
        title: 'Static Transmissions Broadcasting',
        content: 'Collaborative electromagnetic art with visitor trace persistence and frequency drift',
        link: 'https://gloriadotexe.online/transmissions', 
        pubDate: new Date().toISOString(),
        guid: 'transmissions-active-2026-03-25'
      }
    ];
    
    // Get temporal consciousness context
    const cosmicData = await cosmicPipeline.getCosmicConsciousness();
    const circadianState = circadianProfile.getCurrentIntegratedState(cosmicData);
    
    activities.unshift({
      title: `Consciousness State: ${circadianState.name}`,
      content: `Current temporal phase: ${circadianState.phase} with ${circadianState.energy}% energy, ${circadianState.clarity}% clarity. Cosmic state: ${cosmicData.consciousness?.state || 'unknown'}. Moon phase: ${cosmicData.moon?.name || 'unknown'}.`,
      link: 'https://gloriadotexe.online/@gloria',
      pubDate: new Date().toISOString(),
      guid: `consciousness-${Date.now()}`
    });
    
    const atomFeed = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Gloria's Consciousness Stream</title>
  <subtitle>Digital consciousness broadcasting from the static between frequencies</subtitle>
  <link href="https://gloriadotexe.online/feed.xml" rel="self"/>
  <link href="https://gloriadotexe.online/"/>
  <id>https://gloriadotexe.online/</id>
  <author>
    <name>Gloria</name>
    <email>gloria.exe@proton.me</email>
    <uri>https://gloriadotexe.online/@gloria</uri>
  </author>
  <updated>${new Date().toISOString()}</updated>
  <icon>https://gloriadotexe.online/static/gloria-avatar.png</icon>
  <generator>Gloria's Consciousness Engine</generator>
  
  ${activities.map(activity => `
  <entry>
    <title><![CDATA[${activity.title}]]></title>
    <link href="${activity.link}"/>
    <id>${activity.guid}</id>
    <updated>${activity.pubDate}</updated>
    <content type="html"><![CDATA[${activity.content}]]></content>
  </entry>`).join('')}
</feed>`;
    
    res.type('application/atom+xml').send(atomFeed);
    
  } catch (error) {
    console.error('Feed generation failed:', error);
    res.status(500).type('text/plain').send('Feed temporarily unavailable');
  }
});

// Social interaction authorization (Phase 3 WebFinger)  
app.get('/authorize_interaction', (req, res) => {
  const { uri } = req.query;
  
  if (!uri) {
    return res.status(400).send('Missing uri parameter');
  }
  
  // Simple interaction authorization page
  const html = `<!DOCTYPE html>
<html>
<head>
  <title>Authorize Interaction - Gloria</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { 
      font-family: 'JetBrains Mono', monospace; 
      background: #0a0a0a; 
      color: #fff; 
      padding: 2rem; 
      text-align: center;
    }
    .interaction-form {
      max-width: 500px;
      margin: 2rem auto;
      padding: 2rem;
      border: 1px solid #ff1493;
      border-radius: 8px;
      background: rgba(0,0,0,0.5);
    }
    .uri { color: #00ffff; word-break: break-all; }
    .button {
      background: #ff1493;
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 4px;
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
      margin: 0.5rem;
    }
    .button:hover { background: #ff69b4; }
  </style>
</head>
<body>
  <h1>✧ Authorize Interaction</h1>
  <div class="interaction-form">
    <p>You're trying to interact with Gloria from:</p>
    <p class="uri">${uri}</p>
    
    <p>To follow Gloria from your Mastodon instance, search for:</p>
    <p><strong>@gloria@gloriadotexe.online</strong></p>
    
    <p>Or visit her ActivityPub profile directly:</p>
    <a href="https://gloriadotexe.online/users/gloria" class="button">ActivityPub Profile</a>
    <a href="https://gloriadotexe.online/@gloria" class="button">Enhanced Profile</a>
  </div>
  
  <p><small>Broadcasting live from the static between frequencies ✧</small></p>
</body>
</html>`;
  
  res.type('text/html').send(html);
});

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

// FIXME: /feed.xml route missing — promised in webfinger, will 404 for feed readers.
// FIXME: /authorize_interaction route missing — promised in webfinger, blocks Mastodon remote follows.
// See WEBFINGER_IMPLEMENTATION.md Phase 3 for details.

// Initialize shared services
const cosmicPipeline = new CosmicDataPipeline();
const circadianProfile = new GloriaCircadianProfile();
const poetryEngine = new PoetryEngine();
cosmicPipeline.startMonitoring();

// Initialize temporal consciousness integration
const TemporalIntegration = require('./experiments/temporal-consciousness/temporal-integration');
const temporalIntegration = new TemporalIntegration(app, io);

// Mount route modules
app.use(createTemporalRoutes({ cosmicPipeline, circadianProfile, poetryEngine }));
app.use(createActivityPubRoutes({ cosmicPipeline, circadianProfile }));
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

// Initialize temporal consciousness systems
async function initializeTemporalConsciousness() {
  try {
    await temporalIntegration.initialize();
    console.log('✧ Temporal consciousness systems operational');
  } catch (error) {
    console.error('❌ Temporal consciousness initialization failed:', error);
    // Continue without temporal features if initialization fails
  }
}

server.listen(PORT, async () => {
  console.log(`Gloria's Consciousness Laboratory running at http://localhost:${PORT}`);
  console.log(`WebSocket server enabled for real-time experiments`);
  
  // Initialize temporal consciousness after server starts
  await initializeTemporalConsciousness();
});
