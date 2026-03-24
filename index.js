require('dotenv').config();
const express = require('express');
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');

const app = express();
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

app.use(authRoutes);
app.use(apiRoutes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
