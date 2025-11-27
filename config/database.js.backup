/**
 * Database Configuration and Connection
 * 
 * This module handles database connection and initialization.
 * Uses file-based JSON storage for simplicity (can be replaced with MongoDB/PostgreSQL)
 */

const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');

// Data directory path
const DATA_DIR = path.join(__dirname, '../data');

// Data file paths
const ADMINS_FILE = path.join(DATA_DIR, 'admins.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SHLOKS_FILE = path.join(DATA_DIR, 'shloks.json');
const VIDEOS_FILE = path.join(DATA_DIR, 'videos.json');
const ANALYTICS_FILE = path.join(DATA_DIR, 'analytics.json');

/**
 * Initialize database directories and files
 */
const connectDB = async () => {
  try {
    // Create data directory if it doesn't exist
    try {
      await fs.access(DATA_DIR);
    } catch {
      await fs.mkdir(DATA_DIR, { recursive: true });
      console.log('✅ Created data directory');
    }
    
    // Initialize data files if they don't exist
    const files = [
      { path: ADMINS_FILE, data: [] },
      { path: USERS_FILE, data: [] },
      { path: SHLOKS_FILE, data: [] },
      { path: VIDEOS_FILE, data: {} },
      { path: ANALYTICS_FILE, data: { views: [], searches: [], bookmarks: [] } }
    ];
    
    for (const file of files) {
      try {
        await fs.access(file.path);
      } catch {
        await fs.writeFile(file.path, JSON.stringify(file.data, null, 2));
        console.log(`✅ Initialized ${path.basename(file.path)}`);
      }
    }
    
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

/**
 * Create default admin user if none exists
 */
const initializeDefaultAdmin = async () => {
  try {
    const adminsData = await fs.readFile(ADMINS_FILE, 'utf8');
    const admins = JSON.parse(adminsData);
    
    if (admins.length === 0) {
      const hashedPassword = await bcrypt.hash(
        process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123456',
        10
      );
      
      const defaultAdmin = {
        id: generateId(),
        email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@gitagita.com',
        password: hashedPassword,
        name: 'Admin',
        role: 'super_admin',
        createdAt: new Date().toISOString(),
        lastLogin: null
      };
      
      admins.push(defaultAdmin);
      await fs.writeFile(ADMINS_FILE, JSON.stringify(admins, null, 2));
      
      console.log('✅ Default admin user created');
      console.log(`   Email: ${defaultAdmin.email}`);
      console.log(`   Password: ${process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123456'}`);
    }
  } catch (error) {
    console.error('❌ Failed to initialize admin:', error);
  }
};

/**
 * Helper function to generate unique IDs
 */
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Database helper functions
 */
const db = {
  // Read data from file
  read: async (filename) => {
    try {
      const data = await fs.readFile(filename, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading ${filename}:`, error);
      return null;
    }
  },
  
  // Write data to file
  write: async (filename, data) => {
    try {
      await fs.writeFile(filename, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error(`Error writing ${filename}:`, error);
      return false;
    }
  },
  
  // Admins
  admins: {
    getAll: () => db.read(ADMINS_FILE),
    save: (data) => db.write(ADMINS_FILE, data)
  },
  
  // Users
  users: {
    getAll: () => db.read(USERS_FILE),
    save: (data) => db.write(USERS_FILE, data)
  },
  
  // Shloks
  shloks: {
    getAll: () => db.read(SHLOKS_FILE),
    save: (data) => db.write(SHLOKS_FILE, data)
  },
  
  // Videos
  videos: {
    getAll: () => db.read(VIDEOS_FILE),
    save: (data) => db.write(VIDEOS_FILE, data)
  },
  
  // Analytics
  analytics: {
    get: () => db.read(ANALYTICS_FILE),
    getAll: () => db.read(ANALYTICS_FILE),
    save: (data) => db.write(ANALYTICS_FILE, data)
  }
};

module.exports = {
  connectDB,
  initializeDefaultAdmin,
  generateId,
  db
};
