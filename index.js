/**
 * Gita Admin Panel - Main Server Entry Point
 * 
 * This server provides REST API endpoints for the admin dashboard
 * to manage users, shloks, analytics, and app content.
 * 
 * Does NOT modify the mobile app - only serves data.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const shlokRoutes = require('./routes/shloks');
const analyticsRoutes = require('./routes/analytics');
const videoRoutes = require('./routes/videos');

// Import database connection
const { connectDB, initializeDefaultAdmin } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - Allow all origins for development (mobile app + web)
app.use(cors({
  origin: true,  // Allow all origins in development
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bookmarks', userRoutes);  // Mobile app bookmarks endpoint
app.use('/api/shloks', shlokRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/videos', videoRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// Initialize database and start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Create default admin if not exists
    await initializeDefaultAdmin();
    
    // Start server
    app.listen(PORT, () => {
      console.log('\n' + '='.repeat(60));
      console.log('🚀 Gita Admin Panel Server');
      console.log('='.repeat(60));
      console.log(`📡 Server running on: http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔐 Admin Panel: http://localhost:3000`);
      console.log('\n📚 API Endpoints:');
      console.log('   POST   /api/auth/login');
      console.log('   GET    /api/users');
      console.log('   GET    /api/shloks');
      console.log('   GET    /api/analytics/stats');
      console.log('   GET    /api/analytics/popular-shloks');
      console.log('   GET    /api/videos');
      console.log('\n🔑 Default Admin:');
      console.log(`   Email: ${process.env.DEFAULT_ADMIN_EMAIL}`);
      console.log(`   Password: ${process.env.DEFAULT_ADMIN_PASSWORD}`);
      console.log('='.repeat(60) + '\n');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

startServer();
