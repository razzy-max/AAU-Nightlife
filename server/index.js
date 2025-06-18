const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');
const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

let db;

MongoClient.connect(MONGO_URI)
  .then(client => {
    db = client.db();
    console.log('Connected to MongoDB');
  })
  .catch(err => console.error('MongoDB connection error:', err));

app.use(cors());
app.use(express.json({ limit: '5mb' })); // Increase JSON body size limit to support base64 images

// Data file paths
const eventsPath = path.join(__dirname, 'data', 'events.json');
const jobsPath = path.join(__dirname, 'data', 'jobs.json');
const heroImagesPath = path.join(__dirname, 'data', 'heroImages.json');
const blogPostsPath = path.join(__dirname, 'data', 'blogPosts.json');
const blogCommentsPath = path.join(__dirname, 'data', 'blogComments.json');
// --- Advertisers API ---
const advertisersPath = path.join(__dirname, 'data', 'advertisers.json');

// Helper to read data
function readData(filePath) {
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}
// Helper to write data
function writeData(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Events endpoints (MongoDB)
app.get('/api/events', async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not connected' });
  try {
    const events = await db.collection('events').find().toArray();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

app.post('/api/events', async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not connected' });
  try {
    const result = await db.collection('events').insertOne(req.body);
    res.status(201).json(result.ops ? result.ops[0] : { _id: result.insertedId, ...req.body });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add event' });
  }
});

app.put('/api/events', async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not connected' });
  try {
    // req.body should be an array of events (for bulk update)
    await db.collection('events').deleteMany({});
    if (Array.isArray(req.body) && req.body.length > 0) {
      await db.collection('events').insertMany(req.body);
    }
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update events' });
  }
});

// Jobs endpoints (MongoDB)
app.get('/api/jobs', async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not connected' });
  try {
    const jobs = await db.collection('jobs').find().toArray();
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

app.post('/api/jobs', async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not connected' });
  try {
    const result = await db.collection('jobs').insertOne(req.body);
    res.status(201).json(result.ops ? result.ops[0] : { _id: result.insertedId, ...req.body });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add job' });
  }
});

app.put('/api/jobs', async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not connected' });
  try {
    await db.collection('jobs').deleteMany({});
    if (Array.isArray(req.body) && req.body.length > 0) {
      await db.collection('jobs').insertMany(req.body);
    }
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update jobs' });
  }
});

// Hero Images endpoints (MongoDB)
app.get('/api/hero-images', async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not connected' });
  try {
    const images = await db.collection('heroImages').find().toArray();
    res.json(images);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch hero images' });
  }
});

app.put('/api/hero-images', async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not connected' });
  try {
    await db.collection('heroImages').deleteMany({});
    if (Array.isArray(req.body) && req.body.length > 0) {
      await db.collection('heroImages').insertMany(req.body);
    }
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update hero images' });
  }
});

// Blog Posts endpoints (MongoDB)
app.get('/api/blog-posts', async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not connected' });
  try {
    const posts = await db.collection('blogPosts').find().toArray();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch blog posts' });
  }
});

app.post('/api/blog-posts', async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not connected' });
  try {
    const result = await db.collection('blogPosts').insertOne(req.body);
    res.status(201).json(result.ops ? result.ops[0] : { _id: result.insertedId, ...req.body });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add blog post' });
  }
});

app.put('/api/blog-posts', async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not connected' });
  try {
    await db.collection('blogPosts').deleteMany({});
    if (Array.isArray(req.body) && req.body.length > 0) {
      await db.collection('blogPosts').insertMany(req.body);
    }
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update blog posts' });
  }
});

// Blog Comments endpoints (MongoDB)
app.get('/api/blog-comments', async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not connected' });
  try {
    const comments = await db.collection('blogComments').find().toArray();
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch blog comments' });
  }
});

app.post('/api/blog-comments', async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not connected' });
  try {
    const result = await db.collection('blogComments').insertOne(req.body);
    res.status(201).json(result.ops ? result.ops[0] : { _id: result.insertedId, ...req.body });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add blog comment' });
  }
});

app.put('/api/blog-comments', async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not connected' });
  try {
    await db.collection('blogComments').deleteMany({});
    if (Array.isArray(req.body) && req.body.length > 0) {
      await db.collection('blogComments').insertMany(req.body);
    }
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update blog comments' });
  }
});

// Contact endpoint (just logs for now)
app.post('/api/contact', (req, res) => {
  console.log('Contact form submission:', req.body);
  res.status(200).json({ success: true });
});

// Advertisers endpoints (MongoDB)
app.get('/api/advertisers', async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not connected' });
  try {
    const advertisers = await db.collection('advertisers').find().toArray();
    res.json(advertisers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch advertisers' });
  }
});

app.post('/api/advertisers', async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not connected' });
  const { name, logo, link } = req.body;
  if (!name || !logo || !link) return res.status(400).json({ error: 'Missing fields' });
  try {
    const result = await db.collection('advertisers').insertOne({ name, logo, link });
    res.status(201).json(result.ops ? result.ops[0] : { _id: result.insertedId, name, logo, link });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add advertiser' });
  }
});

app.delete('/api/advertisers/:id', async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not connected' });
  try {
    const { id } = req.params;
    await db.collection('advertisers').deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete advertiser' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
