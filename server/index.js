const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const { MongoClient, ObjectId } = require('mongodb');
const rateLimit = require('express-rate-limit');
const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'aau-nightlife-secret-key-2024';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // Default: 'password'
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://aaunightlife.com';

let db;

if (MONGO_URI) {
  MongoClient.connect(MONGO_URI)
    .then(client => {
      db = client.db();
      console.log('Connected to MongoDB');
    })
    .catch(err => console.error('MongoDB connection error:', err));
} else {
  console.log('MONGO_URI not set — running with file-based fallback storage');
}

app.use(cors({
  origin: ['http://localhost:5173', 'https://aaunightlife.com', 'https://www.aaunightlife.com', 'https://aau-nightlife.vercel.app'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' })); // Increase JSON body size limit to support base64 images and videos
app.use(cookieParser());

// Rate limiting for voting endpoints to prevent abuse
const voteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 votes per windowMs
  message: 'Too many votes from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Data file paths
const eventsPath = path.join(__dirname, 'data', 'events.json');
const jobsPath = path.join(__dirname, 'data', 'jobs.json');
const heroImagesPath = path.join(__dirname, 'data', 'heroImages.json');
const blogPostsPath = path.join(__dirname, 'data', 'blogPosts.json');
const blogCommentsPath = path.join(__dirname, 'data', 'blogComments.json');
const awardsPath = path.join(__dirname, 'data', 'awards.json');
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

// Helper to get client IP (works behind proxies and direct)
function getClientIp(req) {
  const xff = req.headers['x-forwarded-for'];
  const ip = (Array.isArray(xff) ? xff[0] : xff) || req.headers['x-real-ip'] || req.ip || req.connection?.remoteAddress || null;
  if (!ip) return null;
  // Normalize IPv4-mapped IPv6 addresses like ::ffff:127.0.0.1
  return ip.replace(/^::ffff:/, '');
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
    // If comingSoon is true, ensure date is null/undefined
    if (event.comingSoon) {
      event.date = event.date || null;
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
        if (ev.comingSoon) ev.date = ev.date || null;
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

    // Try both ObjectId and string formats
    let result = await db.collection('events').deleteOne({ _id: new ObjectId(id) });
    console.log('Delete result with ObjectId:', result);

    // If not found with ObjectId, try with string
    if (result.deletedCount === 0) {
      result = await db.collection('events').deleteOne({ _id: id });
      console.log('Delete result with string ID:', result);
    }

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
    const posts = await db.collection('blogPosts').find().sort({ timestamp: -1 }).toArray();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch blog posts' });
  }

  // Awards endpoints (categories, candidates, votes)
  app.get('/api/awards', async (req, res) => {
    // Return categories with candidates and current vote counts
    if (db) {
      try {
        const categories = await db.collection('awards').find().toArray();
        res.json(categories);
        return;
      } catch (err) {
        console.error('Failed to fetch awards from db:', err);
      }
    }
    // Fallback to file
    try {
      const data = readData(awardsPath);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch awards' });
    }
  });

  app.post('/api/awards', authenticateAdmin, async (req, res) => {
    // Create or replace full awards structure (array of categories)
    const payload = req.body;
    if (!Array.isArray(payload)) return res.status(400).json({ error: 'Expected array of categories' });
    if (db) {
      try {
        await db.collection('awards').deleteMany({});
        if (payload.length) await db.collection('awards').insertMany(payload);
        return res.json({ success: true });
      } catch (err) {
        console.error('Failed to save awards to db:', err);
        return res.status(500).json({ error: 'Failed to save awards to db' });
      }
    }
    // Fallback to file
    try {
      writeData(awardsPath, payload);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to save awards' });
    }
  });

  // Add a candidate to a category
  app.post('/api/awards/:categoryId/candidates', authenticateAdmin, async (req, res) => {
    const { categoryId } = req.params;
    const candidate = req.body;
    if (!candidate || !candidate.name) return res.status(400).json({ error: 'Candidate name required' });
    if (db) {
      try {
        const result = await db.collection('awards').findOneAndUpdate(
          { id: categoryId },
          { $push: { candidates: candidate } },
          { returnDocument: 'after' }
        );
        return res.json(result.value);
      } catch (err) {
        console.error('Failed to add candidate:', err);
        return res.status(500).json({ error: 'Failed to add candidate' });
      }
    }
    // file fallback
    try {
      const data = readData(awardsPath);
      const cat = data.find(c => c.id === categoryId);
      if (!cat) return res.status(404).json({ error: 'Category not found' });
      cat.candidates = cat.candidates || [];
      cat.candidates.push(candidate);
      writeData(awardsPath, data);
      res.json(cat);
    } catch (err) {
      res.status(500).json({ error: 'Failed to add candidate' });
    }
  });

  // Vote endpoint: record a vote (for paid categories expect a payment reference in body)
  app.post('/api/awards/:categoryId/vote', voteLimiter, async (req, res) => {
    const { categoryId } = req.params;
    const { candidateId, paymentRef, votesCount, sessionId } = req.body;
    const votesToCast = Number(votesCount) >= 1 ? Math.floor(Number(votesCount)) : 1;
    if (!candidateId) return res.status(400).json({ error: 'candidateId required' });

    // Determine client IP for one-vote-per-user enforcement on free categories
    const ip = getClientIp(req);

    // Simple validation for paid categories will be handled by admin settings: category.paid === true
    if (db) {
      try {
        const category = await db.collection('awards').findOne({ id: categoryId });
        if (!category) return res.status(404).json({ error: 'Category not found' });

        const candidateIdx = (category.candidates || []).findIndex(c => c.id === candidateId);
        if (candidateIdx === -1) return res.status(404).json({ error: 'Candidate not found' });

        // If category is paid, require paymentRef
        if (category.paid && !paymentRef) {
          return res.status(402).json({ error: 'Payment required for this category' });
        }

        // If category is free, enforce one vote per IP and session
        if (!category.paid) {
          if (!ip) {
            // If we cannot determine IP, be conservative and allow the vote
            console.warn('Could not determine client IP for free-vote enforcement');
          } else {
            const existing = await db.collection('votes').findOne({ categoryId, ip });
            if (existing) {
              return res.status(409).json({ error: 'You have already voted in this free category' });
            }
          }
          // Additional session-based check if sessionId provided
          if (sessionId) {
            const sessionVote = await db.collection('votes').findOne({ categoryId, sessionId });
            if (sessionVote) {
              return res.status(409).json({ error: 'You have already voted in this free category' });
            }
          }
        }

        // Record vote: increment candidate.votes by votesToCast and store vote record with ip, sessionId and votesCount
        const voteRecord = { categoryId, candidateId, timestamp: new Date().toISOString(), paymentRef: paymentRef || null, votesCount: votesToCast, ip: ip || null, sessionId: sessionId || null };
        await db.collection('votes').insertOne(voteRecord);
        const updateKey = `candidates.${candidateIdx}.votes`;
        await db.collection('awards').updateOne({ id: categoryId }, { $inc: { [updateKey]: votesToCast } });
        return res.json({ success: true });
      } catch (err) {
        console.error('Failed to record vote:', err);
        return res.status(500).json({ error: 'Failed to record vote' });
      }
    }

    // file fallback: update awards.json and append a vote to votes.json
    try {
      const data = readData(awardsPath);
      const cat = data.find(c => c.id === categoryId);
      if (!cat) return res.status(404).json({ error: 'Category not found' });
      const cand = (cat.candidates || []).find(c => c.id === candidateId);
      if (!cand) return res.status(404).json({ error: 'Candidate not found' });
      if (cat.paid && !paymentRef) return res.status(402).json({ error: 'Payment required' });

      // file-fallback: enforce one vote per IP and session for free categories
      if (!cat.paid) {
        const votesPath = path.join(__dirname, 'data', 'votes.json');
        const votes = readData(votesPath);
        if (ip) {
          const found = votes.find(v => v.categoryId === categoryId && v.ip === ip);
          if (found) return res.status(409).json({ error: 'You have already voted in this free category' });
        } else {
          console.warn('Could not determine client IP for free-vote enforcement (file fallback)');
        }
        // Additional session check
        if (sessionId) {
          const sessionFound = votes.find(v => v.categoryId === categoryId && v.sessionId === sessionId);
          if (sessionFound) return res.status(409).json({ error: 'You have already voted in this free category' });
        }
      }

      const votesPath = path.join(__dirname, 'data', 'votes.json');
      const votes = readData(votesPath);
      const toAdd = Number(votesCount) >= 1 ? Math.floor(Number(votesCount)) : 1;
      cand.votes = (cand.votes || 0) + toAdd;
      writeData(awardsPath, data);
      // append to votes file with ip, sessionId and votesCount
      votes.push({ categoryId, candidateId, timestamp: new Date().toISOString(), paymentRef: paymentRef || null, votesCount: toAdd, ip: ip || null, sessionId: sessionId || null });
      writeData(votesPath, votes);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to record vote' });
    }
  });

  // Paystack payment initialization endpoint
  app.post('/api/payments/initialize', async (req, res) => {
    const { categoryId, candidateId, votesCount, email } = req.body;

    if (!categoryId || !candidateId) {
      return res.status(400).json({ error: 'Category ID and Candidate ID are required' });
    }

    if (!process.env.PAYSTACK_SECRET_KEY) {
      return res.status(500).json({ error: 'Paystack secret key not configured' });
    }

    try {
      // Get category details to calculate amount
      let category;
      if (db) {
        category = await db.collection('awards').findOne({ id: categoryId });
      } else {
        // Fallback to file
        const awards = readData(awardsPath);
        category = awards.find(c => c.id === categoryId);
      }

      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }

      if (!category.paid) {
        return res.status(400).json({ error: 'This category does not require payment' });
      }

      const count = Number(votesCount) >= 1 ? Math.floor(Number(votesCount)) : 1;
      const amount = (category.price || 50) * count * 100; // Paystack expects amount in kobo

      // Initialize payment with Paystack
      const ts = Date.now();
      const reference = `VOTE-${categoryId}-${candidateId}-${ts}`;
      const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email || 'user@example.com',
          amount: amount,
          currency: 'NGN',
          reference: reference,
          callback_url: `${FRONTEND_URL}/awards?payment_success=true&reference=${reference}`,
          metadata: {
            categoryId,
            candidateId,
            votesCount: count
          }
        })
      });

      const paystackData = await paystackResponse.json();

      if (paystackData.status) {
        res.json({
          success: true,
          authorization_url: paystackData.data.authorization_url,
          reference: paystackData.data.reference
        });
      } else {
        res.status(400).json({ error: paystackData.message || 'Failed to initialize payment' });
      }
    } catch (error) {
      console.error('Payment initialization error:', error);
      res.status(500).json({ error: 'Payment initialization failed' });
    }
  });

  // Paystack payment verification endpoint
  app.post('/api/payments/verify', async (req, res) => {
    const { reference } = req.body;
    if (!reference) return res.status(400).json({ error: 'Payment reference required' });

    // Debug: Check if environment variable is loaded
    console.log('PAYSTACK_SECRET_KEY loaded:', process.env.PAYSTACK_SECRET_KEY ? 'YES' : 'NO');
    console.log('PAYSTACK_SECRET_KEY value:', process.env.PAYSTACK_SECRET_KEY);

    if (!process.env.PAYSTACK_SECRET_KEY) {
      return res.status(500).json({ error: 'Paystack secret key not configured' });
    }

    try {
      // Verify payment with Paystack
      const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        }
      });

      const paystackData = await paystackResponse.json();
      console.log('Paystack verification response:', paystackData);

      if (paystackData.status && paystackData.data.status === 'success') {
        // Payment successful, extract metadata
        const { metadata } = paystackData.data;
        console.log('Payment metadata:', metadata);

        // Extract from custom_fields or directly from metadata
        const categoryId = metadata?.categoryId || metadata?.custom_fields?.find(field => field.variable_name === 'category')?.value;
        const candidateId = metadata?.candidateId || metadata?.custom_fields?.find(field => field.variable_name === 'candidate')?.value;
        const votesCount = parseInt(metadata?.votesCount || metadata?.custom_fields?.find(field => field.variable_name === 'votes_count')?.value) || 1;

        console.log('Extracted data:', { categoryId, candidateId, votesCount });

        if (categoryId && candidateId) {
          // Record the vote in database
          if (db) {
            const category = await db.collection('awards').findOne({ id: categoryId });
            if (category) {
              const candidateIdx = (category.candidates || []).findIndex(c => c.id === candidateId);
              if (candidateIdx !== -1) {
                // Record vote
                const voteRecord = {
                  categoryId,
                  candidateId,
                  timestamp: new Date().toISOString(),
                  paymentRef: reference,
                  votesCount: votesCount,
                  amount: paystackData.data.amount / 100, // Convert from kobo to naira
                  paystackData: paystackData.data
                };
                await db.collection('votes').insertOne(voteRecord);

                // Update candidate vote count
                const updateKey = `candidates.${candidateIdx}.votes`;
                await db.collection('awards').updateOne({ id: categoryId }, { $inc: { [updateKey]: votesCount } });

                res.json({
                  success: true,
                  message: 'Payment verified and vote recorded',
                  votesCount: votesCount,
                  categoryId,
                  candidateId
                });
                return;
              }
            }
          }
        }

        res.status(400).json({ error: 'Invalid payment metadata - missing categoryId or candidateId' });
      } else {
        res.status(400).json({ error: 'Payment verification failed', paystackData });
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      res.status(500).json({ error: 'Payment verification failed' });
    }
  });
});

app.post('/api/blog-posts', authenticateAdmin, async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not connected' });
  try {
    // Check if video is too large (MongoDB document limit is 16MB)
    if (req.body.video && req.body.video.length > 20 * 1024 * 1024) {
      return res.status(400).json({ error: 'Video file is too large. Please use a video smaller than 15MB.' });
    }

    // Optimize video by reducing quality if it's large
    let optimizedVideo = req.body.video;
    if (req.body.video && req.body.video.length > 5 * 1024 * 1024) {
      // For videos larger than 5MB, suggest using a lower quality version
      // In a production environment, you might want to use a video processing service
      console.log('Large video detected, consider optimizing for better performance');
    }

    const postData = {
      ...req.body,
      video: optimizedVideo,
      timestamp: new Date().toISOString()
    };
    const result = await db.collection('blogPosts').insertOne(postData);
    res.status(201).json(result.ops ? result.ops[0] : { _id: result.insertedId, ...postData });
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
    // Add timestamp if not provided
    const commentData = {
      ...req.body,
      timestamp: req.body.timestamp || new Date().toISOString()
    };
    const result = await db.collection('blogComments').insertOne(commentData);
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

/**
 * Safety net: if Paystack or any client ends up calling the backend domain
 * at /awards (e.g., https://aau-nightlife-backend.onrender.com/awards?...),
 * redirect them to the real frontend route instead of returning 404.
 */
app.get('/awards', (req, res) => {
  const query = req.originalUrl.includes('?') ? req.originalUrl.substring(req.originalUrl.indexOf('?')) : '';
  res.redirect(301, `${FRONTEND_URL}/awards${query}`);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
