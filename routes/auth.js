/**
 * Authentication Routes
 * 
 * Handles admin login, logout, and token refresh
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/database');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/auth/login
 * Admin login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }
    
    // Get admin from database
    const admins = await db.admins.getAll();
    const admin = admins.find(a => a.email === email);
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    // Update last login
    admin.lastLogin = new Date().toISOString();
    await db.admins.save(admins);
    
    // Generate JWT token
    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: admin.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Return admin data (without password) and token
    const { password: _, ...adminData } = admin;
    
    res.json({
      success: true,
      data: {
        admin: adminData,
        token
      }
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
 * GET /api/auth/me
 * Get current admin info
 */
router.get('/me', authenticateAdmin, async (req, res) => {
  try {
    const admins = await db.admins.getAll();
    const admin = admins.find(a => a.id === req.admin.id);
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        error: 'Admin not found'
      });
    }
    
    const { password, ...adminData } = admin;
    
    res.json({
      success: true,
      data: adminData
    });
  } catch (error) {
    console.error('Get admin error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get admin info'
    });
  }
});

/**
 * POST /api/auth/change-password
 * Change admin password
 */
router.post('/change-password', authenticateAdmin, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current and new passwords are required'
      });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 8 characters'
      });
    }
    
    const admins = await db.admins.getAll();
    const adminIndex = admins.findIndex(a => a.id === req.admin.id);
    
    if (adminIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Admin not found'
      });
    }
    
    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      admins[adminIndex].password
    );
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    admins[adminIndex].password = hashedPassword;
    
    await db.admins.save(admins);
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to change password'
    });
  }
});

module.exports = router;
