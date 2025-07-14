const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const { MongoClient, ObjectId } = require('mongodb');
const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'aau-nightlife-secret-key-2024';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // Default: 'password'

let db;

MongoClient.connect(MONGO_URI)
  .then(client => {
    db = client.db();
    console.log('Connected to MongoDB');
  })
  .catch(err => console.error('MongoDB connection error:', err));

app.use(cors({
  origin: ['http://localhost:5173', 'https://aaunightlife.com', 'https://www.aaunightlife.com', 'https://aau-nightlife.vercel.app'],
  credentials: true
}));
app.use(express.json({ limit: '5mb' })); // Increase JSON body size limit to support base64 images
app.use(cookieParser());

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

// Authentication middleware
function authenticateAdmin(req, res, next) {
  const token = req.cookies.adminToken || req.headers.authorization?.replace('Bearer ', '');

  // Temporary bypass for development/testing
  const bypassHeader = req.headers['x-admin-bypass'];
  if (bypassHeader === 'emergency-access') {
    console.log('Using emergency admin bypass');
    req.admin = { role: 'admin', emergency: true };
    return next();
  }

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token.' });
  }
}

// Admin Authentication Endpoints
app.post('/api/admin/login', async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    // Compare password with hash
    const isValidPassword = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { role: 'admin', loginTime: Date.now() },
      JWT_SECRET,
      { expiresIn: '4h' } // Token expires in 4 hours
    );

    // Set secure cookie
    res.cookie('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 4 * 60 * 60 * 1000 // 4 hours
    });

    res.json({
      success: true,
      message: 'Login successful',
      expiresIn: '4h'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/admin/logout', (req, res) => {
  res.clearCookie('adminToken');
  res.json({ success: true, message: 'Logout successful' });
});

app.get('/api/admin/verify', authenticateAdmin, (req, res) => {
  res.json({
    success: true,
    admin: req.admin,
    message: 'Token is valid'
  });
});

// Utility endpoint to generate password hash (for development)
app.post('/api/admin/generate-hash', async (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }
  const hash = await bcrypt.hash(password, 10);
  res.json({ hash });
});

// Events endpoints (MongoDB)
app.get('/api/events', async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not connected' });
  try {
    // Map 'category' to 'venue' for backward compatibility
    const events = await db.collection('events').find().toArray();
    const migrated = events.map(ev => {
      if (ev.category && !ev.venue) {
        ev.venue = ev.category;
        delete ev.category;
      }
      return ev;
    });
    res.json(migrated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

app.post('/api/events', authenticateAdmin, async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not connected' });
  try {
    // Accept both 'venue' and legacy 'category' for compatibility
    const event = { ...req.body };
    if (event.category && !event.venue) {
      event.venue = event.category;
      delete event.category;
    }
    const result = await db.collection('events').insertOne(event);
    res.status(201).json(result.ops ? result.ops[0] : { _id: result.insertedId, ...event });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add event' });
  }
});

app.put('/api/events', authenticateAdmin, async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not connected' });
  try {
    // req.body should be an array of events (for bulk update)
    await db.collection('events').deleteMany({});
    if (Array.isArray(req.body) && req.body.length > 0) {
      // Accept both 'venue' and legacy 'category' for compatibility
      const events = req.body.map(ev => {
        if (ev.category && !ev.venue) {
          ev.venue = ev.category;
          delete ev.category;
        }
        return ev;
      });
      await db.collection('events').insertMany(events);
    }
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update events' });
  }
});

// Delete individual event endpoint
app.delete('/api/events/:id', authenticateAdmin, async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not connected' });
  try {
    const { id } = req.params;
    console.log('Attempting to delete event with ID:', id);

    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid event ID format' });
    }

    const result = await db.collection('events').deleteOne({ _id: new ObjectId(id) });
    console.log('Delete result:', result);

    if (result.deletedCount === 1) {
      res.json({ success: true, message: 'Event deleted successfully' });
    } else {
      res.status(404).json({ error: 'Event not found' });
    }
  } catch (err) {
    console.error('Error deleting event:', err);
    res.status(500).json({ error: 'Failed to delete event', details: err.message });
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

app.post('/api/jobs', authenticateAdmin, async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not connected' });
  try {
    const result = await db.collection('jobs').insertOne(req.body);
    res.status(201).json(result.ops ? result.ops[0] : { _id: result.insertedId, ...req.body });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add job' });
  }
});

app.put('/api/jobs', authenticateAdmin, async (req, res) => {
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

// Hero Images endpoints (MongoDB, returns array of image strings)
app.get('/api/hero-images', async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not connected' });
  try {
    const docs = await db.collection('heroImages').find().toArray();
    const images = docs.map(doc => doc.image);
    res.json(images);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch hero images' });
  }
});

app.put('/api/hero-images', authenticateAdmin, async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not connected' });
  try {
    await db.collection('heroImages').deleteMany({});
    if (Array.isArray(req.body) && req.body.length > 0) {
      const docs = req.body.map(image => ({ image }));
      await db.collection('heroImages').insertMany(docs);
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

app.post('/api/blog-posts', authenticateAdmin, async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not connected' });
  try {
    const result = await db.collection('blogPosts').insertOne(req.body);
    res.status(201).json(result.ops ? result.ops[0] : { _id: result.insertedId, ...req.body });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add blog post' });
  }
});

app.put('/api/blog-posts', authenticateAdmin, async (req, res) => {
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

// Add this DELETE endpoint for blog posts
app.delete('/api/blog-posts/:id', authenticateAdmin, async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not connected' });
  try {
    const { id } = req.params;
    const result = await db.collection('blogPosts').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 1) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Blog post not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete blog post' });
  }
});

// Add this PUT endpoint for updating a single blog post by _id
app.put('/api/blog-posts/:id', authenticateAdmin, async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not connected' });
  try {
    const { id } = req.params;
    const update = { ...req.body };
    delete update._id; // Don't overwrite the _id
    const result = await db.collection('blogPosts').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: 'after' }
    );
    if (result.value) {
      res.json(result.value);
    } else {
      res.status(404).json({ error: 'Blog post not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to update blog post' });
  }
});

// Blog Comments endpoints (MongoDB, by blogId)
app.get('/api/blog-comments/:blogId', async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not connected' });
  try {
    const blogId = req.params.blogId;
    const comments = await db.collection('blogComments').find({ blogId }).toArray();
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch blog comments' });
  }
});

app.post('/api/blog-comments', async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not connected' });
  try {
    // expects { blogId, ...commentData }
    const result = await db.collection('blogComments').insertOne(req.body);
    res.status(201).json(result.ops ? result.ops[0] : { _id: result.insertedId, ...req.body });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add blog comment' });
  }
});

app.delete('/api/blog-comments/:id', authenticateAdmin, async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not connected' });
  try {
    const { id } = req.params;
    console.log('Attempting to delete comment with ID:', id);

    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid comment ID format' });
    }

    const result = await db.collection('blogComments').deleteOne({ _id: new ObjectId(id) });
    console.log('Delete result:', result);

    if (result.deletedCount === 1) {
      res.json({ success: true, message: 'Comment deleted successfully' });
    } else {
      res.status(404).json({ error: 'Comment not found' });
    }
  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).json({ error: 'Failed to delete blog comment', details: err.message });
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

app.post('/api/advertisers', authenticateAdmin, async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not connected' });
  const { name, media, link, description, facebook, instagram, whatsapp, mediaType } = req.body;
  if (!name) return res.status(400).json({ error: 'Missing required field: name' });
  try {
    const advertiserData = {
      name,
      media: media || '', // Changed from 'logo' to 'media' to support both images and videos
      mediaType: mediaType || 'image', // Track whether it's image or video
      link: link || '',
      description: description || '',
      facebook: facebook || '',
      instagram: instagram || '',
      whatsapp: whatsapp || '',
      createdAt: new Date()
    };
    const result = await db.collection('advertisers').insertOne(advertiserData);
    res.status(201).json(result.ops ? result.ops[0] : { _id: result.insertedId, ...advertiserData });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add advertiser' });
  }
});

// Add PUT endpoint for editing advertisers
app.put('/api/advertisers/:id', authenticateAdmin, async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not connected' });
  const { id } = req.params;
  const { name, media, link, description, facebook, instagram, whatsapp, mediaType } = req.body;
  if (!name) return res.status(400).json({ error: 'Missing required field: name' });
  try {
    const updateData = {
      name,
      media: media || '',
      mediaType: mediaType || 'image',
      link: link || '',
      description: description || '',
      facebook: facebook || '',
      instagram: instagram || '',
      whatsapp: whatsapp || '',
      updatedAt: new Date()
    };
    const result = await db.collection('advertisers').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Advertiser not found' });
    }
    res.json({ success: true, ...updateData });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update advertiser' });
  }
});

app.delete('/api/advertisers/:id', authenticateAdmin, async (req, res) => {
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
