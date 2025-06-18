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
const heroImagesPath = path.join(__dirname, 'data', 'heroImages.json');
const blogPostsPath = path.join(__dirname, 'data', 'blogPosts.json');
const blogCommentsPath = path.join(__dirname, 'data', 'blogComments.json');

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

// Hero Images endpoints
app.get('/api/hero-images', (req, res) => {
  res.json(readData(heroImagesPath));
});
app.put('/api/hero-images', (req, res) => {
  writeData(heroImagesPath, req.body);
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

// Blog Posts endpoints
app.get('/api/blog-posts', (req, res) => {
  res.json(readData(blogPostsPath));
});
app.post('/api/blog-posts', (req, res) => {
  const posts = readData(blogPostsPath);
  posts.unshift(req.body); // add new post to the start
  writeData(blogPostsPath, posts);
  res.status(201).json({ success: true });
});
app.put('/api/blog-posts', (req, res) => {
  writeData(blogPostsPath, req.body);
  res.status(200).json({ success: true });
});
app.put('/api/blog-posts/:id', (req, res) => {
  const id = Number(req.params.id);
  let posts = readData(blogPostsPath);
  posts = posts.map(p => p.id === id ? { ...p, ...req.body } : p);
  writeData(blogPostsPath, posts);
  res.status(200).json({ success: true });
});
app.delete('/api/blog-posts/:id', (req, res) => {
  const id = Number(req.params.id);
  let posts = readData(blogPostsPath);
  posts = posts.filter(p => p.id !== id);
  writeData(blogPostsPath, posts);
  // Also remove comments for this post
  let allComments = readData(blogCommentsPath);
  delete allComments[id];
  writeData(blogCommentsPath, allComments);
  res.status(200).json({ success: true });
});

// Blog Comments endpoints
app.get('/api/blog-comments', (req, res) => {
  res.json(readData(blogCommentsPath));
});
app.post('/api/blog-comments', (req, res) => {
  // expects { blogId, comment }
  const { blogId, comment } = req.body;
  const allComments = readData(blogCommentsPath);
  if (!allComments[blogId]) allComments[blogId] = [];
  allComments[blogId].push(comment);
  writeData(blogCommentsPath, allComments);
  res.status(201).json({ success: true });
});
app.put('/api/blog-comments', (req, res) => {
  writeData(blogCommentsPath, req.body);
  res.status(200).json({ success: true });
});
app.delete('/api/blog-comments/:blogId/:idx', (req, res) => {
  const blogId = req.params.blogId;
  const idx = Number(req.params.idx);
  let allComments = readData(blogCommentsPath);
  if (allComments[blogId]) {
    allComments[blogId].splice(idx, 1);
    writeData(blogCommentsPath, allComments);
  }
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
