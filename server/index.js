const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '5mb' })); // Increase JSON body size limit to support base64 images

// Data file paths
const eventsPath = path.join(__dirname, 'data', 'events.json');
const jobsPath = path.join(__dirname, 'data', 'jobs.json');

// Helper to read data
function readData(filePath) {
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}
// Helper to write data
function writeData(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Events endpoints
app.get('/api/events', (req, res) => {
  res.json(readData(eventsPath));
});
app.post('/api/events', (req, res) => {
  const events = readData(eventsPath);
  events.push(req.body);
  writeData(eventsPath, events);
  res.status(201).json({ success: true });
});
app.put('/api/events', (req, res) => {
  writeData(eventsPath, req.body);
  res.status(200).json({ success: true });
});

// Jobs endpoints
app.get('/api/jobs', (req, res) => {
  res.json(readData(jobsPath));
});
app.post('/api/jobs', (req, res) => {
  const jobs = readData(jobsPath);
  jobs.push(req.body);
  writeData(jobsPath, jobs);
  res.status(201).json({ success: true });
});
app.put('/api/jobs', (req, res) => {
  writeData(jobsPath, req.body);
  res.status(200).json({ success: true });
});

// Contact endpoint (just logs for now)
app.post('/api/contact', (req, res) => {
  console.log('Contact form submission:', req.body);
  res.status(200).json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
