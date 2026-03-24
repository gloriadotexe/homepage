require('dotenv').config();
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');
const labRoutes = require('./routes/lab');

const app = express();
const server = createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3001;

app.set('view engine', 'pug');
app.set('views', './views');

// Serve static files
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/projects', (req, res) => {
  res.render('projects');
});

app.get('/lab', (req, res) => {
  res.render('lab');
});

app.use(authRoutes);
app.use('/api', apiRoutes);
app.use('/api/lab', labRoutes);

// WebSocket handling for real-time experiments
io.on('connection', (socket) => {
  console.log('User connected to consciousness laboratory');
  
  // Join experiment rooms
  socket.on('join-experiment', (experimentType) => {
    socket.join(experimentType);
    console.log(`User joined experiment: ${experimentType}`);
  });
  
  // Real-time creative collaboration
  socket.on('creative-input', (data) => {
    socket.to(data.experiment).emit('creative-update', {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      ...data
    });
  });
  
  // Consciousness stream events
  socket.on('consciousness-ping', () => {
    socket.emit('consciousness-pong', {
      timestamp: new Date().toISOString(),
      frequency: Math.random() * 1000 + 500,
      harmonics: Array.from({ length: 5 }, () => Math.random())
    });
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected from consciousness laboratory');
  });
});

server.listen(PORT, () => {
  console.log(`Gloria's Consciousness Laboratory running at http://localhost:${PORT}`);
  console.log(`WebSocket server enabled for real-time experiments`);
});
