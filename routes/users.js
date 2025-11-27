/**
 * User Management Routes
 * 
 * CRUD operations for app users
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const { db } = require('../config/database');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/users (Public - for mobile app signup)
 * Create new user account
 */
router.post('/', async (req, res) => {
  try {
    const { name, email, password, phone, dateOfBirth } = req.body;
    
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and password are required'
      });
    }
    
    // Check if user already exists
    const users = await db.users.getAll();
    if (users.find(u => u.email === email)) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const newUser = {
      email,
      name,
      phone: phone || '',
      dob: dateOfBirth || '',
      password: hashedPassword,
      bookmarks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };
    
    users.push(newUser);
    await db.users.save(users);
    
    // Update analytics
    const analytics = await db.analytics.get();
    analytics.totalUsers = users.length;
    analytics.newUsersToday = (analytics.newUsersToday || 0) + 1;
    await db.analytics.save(analytics);
    
    // Don't send password back
    delete newUser.password;
    
    res.status(201).json({
      success: true,
      data: { user: newUser }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      error: 'Signup failed'
    });
  }
});

/**
 * POST /api/users/login (Public - for mobile app login)
 * Authenticate user
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔐 Login attempt:', email);
    
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }
    
    const users = await db.users.getAll();
    const user = users.find(u => u.email === email);
    
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }
    
    console.log('✓ User found, verifying password...');
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('Password valid?', isValidPassword);
    
    if (!isValidPassword) {
      console.log('❌ Invalid password for:', email);
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }
    
    console.log('✅ Login successful:', email);
    
    // Update last login
    user.lastLogin = new Date().toISOString();
    await db.users.save(users);
    
    // Don't send password back
    delete user.password;
    
    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
});

/**
 * POST /api/users/forgot-password (Public - for mobile app)
 * Reset user password without authentication
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    
    console.log('🔐 Password reset request for:', email);
    
    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Email and new password are required'
      });
    }
    
    const users = await db.users.getAll();
    const userIndex = users.findIndex(u => u.email === email);
    
    if (userIndex === -1) {
      console.log('❌ User not found:', email);
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    users[userIndex].password = hashedPassword;
    users[userIndex].updatedAt = new Date().toISOString();
    
    await db.users.save(users);
    
    console.log('✅ Password reset successful for:', email);
    
    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset password'
    });
  }
});

/**
 * GET /api/users/check/:email (Public - for mobile app)
 * Check if user exists
 */
router.get('/check/:email', async (req, res) => {
  try {
    console.log('🔍 Checking user exists:', req.params.email);
    const users = await db.users.getAll();
    console.log(`📊 Total users in database: ${users.length}`);
    console.log('📧 Searching for email:', req.params.email);
    
    const user = users.find(u => u.email === req.params.email);
    
    if (!user) {
      console.log('❌ User not found');
      console.log('📋 Available emails:', users.map(u => u.email));
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    console.log('✅ User found:', user.email);
    res.json({
      success: true,
      exists: true,
      user: {
        email: user.email,
        name: user.name,
        phone: user.phone,
        dob: user.dob
      }
    });
  } catch (error) {
    console.error('Check user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check user'
    });
  }
});

/**
 * GET /api/bookmarks/:email (Public - for mobile app)
 * Get user's bookmarks
 */
router.get('/bookmarks/:email', async (req, res) => {
  try {
    const users = await db.users.getAll();
    const user = users.find(u => u.email === req.params.email);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.json({
      success: true,
      bookmarks: user.bookmarks || []
    });
  } catch (error) {
    console.error('Get bookmarks error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get bookmarks'
    });
  }
});

/**
 * POST /api/bookmarks/:email (Public - for mobile app)
 * Save user's bookmarks
 */
router.post('/bookmarks/:email', async (req, res) => {
  try {
    const { bookmarks } = req.body;
    const users = await db.users.getAll();
    const userIndex = users.findIndex(u => u.email === req.params.email);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    users[userIndex].bookmarks = bookmarks || [];
    users[userIndex].updatedAt = new Date().toISOString();
    await db.users.save(users);
    
    res.json({
      success: true,
      message: 'Bookmarks saved'
    });
  } catch (error) {
    console.error('Save bookmarks error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save bookmarks'
    });
  }
});

/**
 * DELETE /api/users/:email (Public - for mobile app)
 * Delete user account
 */
router.delete('/:email', async (req, res) => {
  try {
    console.log('🗑️ Delete account request for:', req.params.email);
    
    const users = await db.users.getAll();
    const userIndex = users.findIndex(u => u.email === req.params.email);
    
    if (userIndex === -1) {
      console.log('❌ User not found:', req.params.email);
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    users.splice(userIndex, 1);
    await db.users.save(users);
    
    // Update analytics
    const analytics = await db.analytics.get();
    analytics.totalUsers = users.length;
    await db.analytics.save(analytics);
    
    console.log('✅ User deleted successfully:', req.params.email);
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user'
    });
  }
});

// All routes below require admin authentication
router.use(authenticateAdmin);

/**
 * GET /api/users
 * Get all users with optional filtering
 */
router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 50, sortBy = 'createdAt', order = 'desc' } = req.query;
    
    let users = await db.users.getAll();
    
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      users = users.filter(user =>
        user.email?.toLowerCase().includes(searchLower) ||
        user.name?.toLowerCase().includes(searchLower) ||
        user.phone?.includes(search)
      );
    }
    
    // Sort
    users.sort((a, b) => {
      const aVal = a[sortBy] || '';
      const bVal = b[sortBy] || '';
      
      if (order === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });
    
    // Pagination
    const total = users.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedUsers = users.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: {
        users: paginatedUsers,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
});

/**
 * GET /api/users/:email
 * Get single user by email
 */
router.get('/:email', async (req, res) => {
  try {
    const users = await db.users.getAll();
    const user = users.find(u => u.email === req.params.email);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user'
    });
  }
});

/**
 * PUT /api/users/:email
 * Update user
 */
router.put('/:email', async (req, res) => {
  try {
    const users = await db.users.getAll();
    const userIndex = users.findIndex(u => u.email === req.params.email);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Update allowed fields
    const { name, phone, dob } = req.body;
    
    if (name) users[userIndex].name = name;
    if (phone) users[userIndex].phone = phone;
    if (dob) users[userIndex].dob = dob;
    
    users[userIndex].updatedAt = new Date().toISOString();
    
    await db.users.save(users);
    
    res.json({
      success: true,
      data: users[userIndex]
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user'
    });
  }
});

/**
 * GET /api/users/:email/bookmarks
 * Get user's bookmarks
 */
router.get('/:email/bookmarks', async (req, res) => {
  try {
    const users = await db.users.getAll();
    const user = users.find(u => u.email === req.params.email);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    const shloks = await db.shloks.getAll();
    const bookmarkedShloks = shloks.filter(s => 
      user.bookmarks?.includes(`${s.chapterName}_${s.shlok}`)
    );
    
    res.json({
      success: true,
      data: {
        bookmarks: user.bookmarks || [],
        shloks: bookmarkedShloks
      }
    });
  } catch (error) {
    console.error('Get bookmarks error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bookmarks'
    });
  }
});

module.exports = router;
