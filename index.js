
const Simulator = require('./models/Simulation/Simulator');
const express = require('express');
const app = express();
const port = process.env.PORT || 3001;

const sim = new Simulator();

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the ResourceProcessor Backend!');
});

// API route
app.get('/api', (req, res) => {
  res.json({ message: 'Resource Processor' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
