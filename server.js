require('dotenv').config();
const dns = require('dns');
// Fallback to Google & Cloudflare DNS to prevent local Windows/ISP DNS SRV lookup failures
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (_e) {}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const resumeRoutes = require('./routes/resume');
const interviewRoutes = require('./routes/interview');

const app = express();

// --- Middleware ---
app.use(cors({
  origin: process.env.CLIENT_URL || true,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/interview', interviewRoutes);

// --- Health check ---
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    mongoState: mongoose.connection.readyState, // 1 = connected, 0 = disconnected
    hasNvidiaKey: Boolean(process.env.NVIDIA_API_KEY || process.env.NVIDIA_KEY),
    nvidiaModel: process.env.NVIDIA_MODEL || 'nvidia/nemotron-3.5-lightning-30b-a3b'
  });
});

// --- Serve Static Client Files in Production / Local Build ---
const clientDistPath = path.join(__dirname, 'client', 'dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(clientDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).json({ error: 'Route not found' });
    }
  });
});

// --- Global error handler ---
app.use((err, _req, res, _next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'An unexpected server error occurred'
  });
});

// --- Server Startup with Graceful DB Fallback ---
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/resumeai';

mongoose.set('strictQuery', false);

mongoose
  .connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 3000, // Timeout fast if local mongo is not running
  })
  .then(() => {
    console.log('✅ Connected to MongoDB successfully.');
  })
  .catch((err) => {
    console.warn('⚠️  MongoDB connection unavailable:', err.message);
    console.warn('ℹ️  Server will continue in hybrid mode (in-memory analysis & fallback).');
  })
  .finally(() => {
    if (require.main === module) {
      app.listen(PORT, () => {
        console.log(`🚀 Server listening on http://localhost:${PORT}`);
      });
    }
  });

module.exports = app;
