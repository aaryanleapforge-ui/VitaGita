/**
 * Analytics Routes
 * 
 * Provides app usage analytics and statistics
 */

const express = require('express');
const { db } = require('../config/database');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateAdmin);

/**
 * GET /api/analytics/stats
 * Get overall app statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const users = await db.users.getAll();
    const shloks = await db.shloks.getAll();
    const analytics = await db.analytics.getAll();
    
    // Calculate statistics
    const totalUsers = users.length;
    const totalShloks = shloks.length;
    
    // Count bookmarks
    const totalBookmarks = users.reduce((sum, user) => 
      sum + (user.bookmarks?.length || 0), 0
    );
    
    // Count themes
    const themes = {};
    shloks.forEach(shlok => {
      if (shlok.theme) {
        themes[shlok.theme] = (themes[shlok.theme] || 0) + 1;
      }
    });
    
    // Count speakers
    const speakers = {};
    shloks.forEach(shlok => {
      if (shlok.speaker) {
        speakers[shlok.speaker] = (speakers[shlok.speaker] || 0) + 1;
      }
    });
    
    // Count chapters
    const chapters = {};
    shloks.forEach(shlok => {
      if (shlok.chapterName) {
        chapters[shlok.chapterName] = (chapters[shlok.chapterName] || 0) + 1;
      }
    });
    
    // Get recent activity
    const recentUsers = users
      .filter(u => u.createdAt)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
      .map(u => ({
        email: u.email,
        name: u.name,
        createdAt: u.createdAt
      }));
    
    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalShloks,
          totalBookmarks,
          totalThemes: Object.keys(themes).length,
          totalSpeakers: Object.keys(speakers).length,
          totalChapters: Object.keys(chapters).length
        },
        themes,
        speakers,
        chapters,
        recentUsers,
        analytics: {
          totalViews: analytics.views?.length || 0,
          totalSearches: analytics.searches?.length || 0
        }
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
});

/**
 * GET /api/analytics/popular-shloks
 * Get most bookmarked shloks
 */
router.get('/popular-shloks', async (req, res) => {
  try {
    const users = await db.users.getAll();
    const shloks = await db.shloks.getAll();
    
    // Count bookmark frequency for each shlok
    const bookmarkCounts = {};
    
    users.forEach(user => {
      if (user.bookmarks) {
        user.bookmarks.forEach(bookmark => {
          bookmarkCounts[bookmark] = (bookmarkCounts[bookmark] || 0) + 1;
        });
      }
    });
    
    // Convert to array and sort
    const popularShloks = Object.entries(bookmarkCounts)
      .map(([key, count]) => {
        const [chapterName, shlokNum] = key.split('_');
        const shlok = shloks.find(s => 
          s.chapterName === chapterName && s.shlok === parseInt(shlokNum)
        );
        
        return {
          key,
          chapterName,
          shlokNum: parseInt(shlokNum),
          bookmarkCount: count,
          summary: shlok?.summary || '',
          theme: shlok?.theme || ''
        };
      })
      .sort((a, b) => b.bookmarkCount - a.bookmarkCount)
      .slice(0, 20);
    
    res.json({
      success: true,
      data: popularShloks
    });
  } catch (error) {
    console.error('Get popular shloks error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch popular shloks'
    });
  }
});

/**
 * GET /api/analytics/user-growth
 * Get user growth over time
 */
router.get('/user-growth', async (req, res) => {
  try {
    const users = await db.users.getAll();
    
    // Group users by date
    const growthData = {};
    
    users.forEach(user => {
      if (user.createdAt) {
        const date = user.createdAt.split('T')[0]; // Get date part only
        growthData[date] = (growthData[date] || 0) + 1;
      }
    });
    
    // Convert to array and sort
    const growth = Object.entries(growthData)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    // Calculate cumulative
    let cumulative = 0;
    const cumulativeGrowth = growth.map(item => {
      cumulative += item.count;
      return {
        date: item.date,
        newUsers: item.count,
        totalUsers: cumulative
      };
    });
    
    res.json({
      success: true,
      data: cumulativeGrowth
    });
  } catch (error) {
    console.error('Get user growth error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user growth data'
    });
  }
});

/**
 * GET /api/analytics/bookmarks-by-theme
 * Get bookmark distribution by theme
 */
router.get('/bookmarks-by-theme', async (req, res) => {
  try {
    const users = await db.users.getAll();
    const shloks = await db.shloks.getAll();
    
    // Count bookmarks per theme
    const themeBookmarks = {};
    
    users.forEach(user => {
      if (user.bookmarks) {
        user.bookmarks.forEach(bookmark => {
          const [chapterName, shlokNum] = bookmark.split('_');
          const shlok = shloks.find(s => 
            s.chapterName === chapterName && s.shlok === parseInt(shlokNum)
          );
          
          if (shlok && shlok.theme) {
            themeBookmarks[shlok.theme] = (themeBookmarks[shlok.theme] || 0) + 1;
          }
        });
      }
    });
    
    // Convert to array
    const distribution = Object.entries(themeBookmarks)
      .map(([theme, count]) => ({ theme, count }))
      .sort((a, b) => b.count - a.count);
    
    res.json({
      success: true,
      data: distribution
    });
  } catch (error) {
    console.error('Get bookmarks by theme error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bookmark distribution'
    });
  }
});

/**
 * POST /api/analytics/log-view
 * Log a shlok view (called from mobile app)
 */
router.post('/log-view', async (req, res) => {
  try {
    const { email, shlokKey, timestamp } = req.body;
    
    if (!shlokKey) {
      return res.status(400).json({
        success: false,
        error: 'shlokKey is required'
      });
    }
    
    const analytics = await db.analytics.getAll();
    
    if (!analytics.views) {
      analytics.views = [];
    }
    
    analytics.views.push({
      email: email || 'anonymous',
      shlokKey,
      timestamp: timestamp || new Date().toISOString()
    });
    
    await db.analytics.save(analytics);
    
    res.json({
      success: true,
      message: 'View logged'
    });
  } catch (error) {
    console.error('Log view error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to log view'
    });
  }
});

module.exports = router;
