/**
 * Authentication Middleware
 * 
 * Verifies JWT tokens and protects admin routes
 */

const jwt = require('jsonwebtoken');

/**
 * Verify JWT token and authenticate admin
 */
const authenticateAdmin = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add admin info to request
    req.admin = decoded;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired'
      });
    }
    
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
};

/**
 * Check if admin has required role
 */
const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }
    
    if (req.admin.role !== role && req.admin.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }
    
    next();
  };
};

module.exports = {
  authenticateAdmin,
  requireRole
};
