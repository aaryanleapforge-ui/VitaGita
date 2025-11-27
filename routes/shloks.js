/**
 * Shlok Management Routes
 * 
 * CRUD operations for shloks
 */

const express = require('express');
const { db, generateId } = require('../config/database');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateAdmin);

/**
 * GET /api/shloks
 * Get all shloks with filtering and search
 */
router.get('/', async (req, res) => {
  try {
    const {
      search,
      chapter,
      theme,
      speaker,
      page = 1,
      limit = 50,
      sortBy = 'shlok',
      order = 'asc'
    } = req.query;
    
    let shloks = await db.shloks.getAll();
    
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      shloks = shloks.filter(shlok =>
        shlok.chapterName?.toLowerCase().includes(searchLower) ||
        shlok.summary?.toLowerCase().includes(searchLower) ||
        shlok.theme?.toLowerCase().includes(searchLower) ||
        shlok.keywords?.some(k => k.toLowerCase().includes(searchLower))
      );
    }
    
    // Chapter filter
    if (chapter) {
      shloks = shloks.filter(s => s.chapterName === chapter);
    }
    
    // Theme filter
    if (theme) {
      shloks = shloks.filter(s => s.theme === theme);
    }
    
    // Speaker filter
    if (speaker) {
      shloks = shloks.filter(s => s.speaker === speaker);
    }
    
    // Sort
    shloks.sort((a, b) => {
      const aVal = a[sortBy] || '';
      const bVal = b[sortBy] || '';
      
      if (order === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });
    
    // Pagination
    const total = shloks.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedShloks = shloks.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: {
        shloks: paginatedShloks,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get shloks error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch shloks'
    });
  }
});

/**
 * GET /api/shloks/:id
 * Get single shlok
 */
router.get('/:id', async (req, res) => {
  try {
    const shloks = await db.shloks.getAll();
    const shlok = shloks[parseInt(req.params.id)];
    
    if (!shlok) {
      return res.status(404).json({
        success: false,
        error: 'Shlok not found'
      });
    }
    
    res.json({
      success: true,
      data: shlok
    });
  } catch (error) {
    console.error('Get shlok error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch shlok'
    });
  }
});

/**
 * POST /api/shloks
 * Create new shlok
 */
router.post('/', async (req, res) => {
  try {
    const {
      chapterName,
      shlok,
      speaker,
      theme,
      summary,
      keywords,
      videoFile,
      star
    } = req.body;
    
    // Validate required fields
    if (!chapterName || !shlok || !summary) {
      return res.status(400).json({
        success: false,
        error: 'chapterName, shlok, and summary are required'
      });
    }
    
    const shloks = await db.shloks.getAll();
    
    const newShlok = {
      chapterName,
      shlok: parseInt(shlok),
      speaker: speaker || '',
      theme: theme || '',
      summary,
      keywords: keywords || [],
      videoFile: videoFile || '',
      star: star || false
    };
    
    shloks.push(newShlok);
    await db.shloks.save(shloks);
    
    res.status(201).json({
      success: true,
      data: newShlok,
      message: 'Shlok created successfully'
    });
  } catch (error) {
    console.error('Create shlok error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create shlok'
    });
  }
});

/**
 * PUT /api/shloks/:id
 * Update shlok
 */
router.put('/:id', async (req, res) => {
  try {
    const shloks = await db.shloks.getAll();
    const index = parseInt(req.params.id);
    
    if (index < 0 || index >= shloks.length) {
      return res.status(404).json({
        success: false,
        error: 'Shlok not found'
      });
    }
    
    const {
      chapterName,
      shlok,
      speaker,
      theme,
      summary,
      keywords,
      videoFile,
      star
    } = req.body;
    
    // Update allowed fields
    if (chapterName) shloks[index].chapterName = chapterName;
    if (shlok) shloks[index].shlok = parseInt(shlok);
    if (speaker !== undefined) shloks[index].speaker = speaker;
    if (theme !== undefined) shloks[index].theme = theme;
    if (summary) shloks[index].summary = summary;
    if (keywords) shloks[index].keywords = keywords;
    if (videoFile !== undefined) shloks[index].videoFile = videoFile;
    if (star !== undefined) shloks[index].star = star;
    
    await db.shloks.save(shloks);
    
    res.json({
      success: true,
      data: shloks[index],
      message: 'Shlok updated successfully'
    });
  } catch (error) {
    console.error('Update shlok error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update shlok'
    });
  }
});

/**
 * DELETE /api/shloks/:id
 * Delete shlok
 */
router.delete('/:id', async (req, res) => {
  try {
    const shloks = await db.shloks.getAll();
    const index = parseInt(req.params.id);
    
    if (index < 0 || index >= shloks.length) {
      return res.status(404).json({
        success: false,
        error: 'Shlok not found'
      });
    }
    
    shloks.splice(index, 1);
    await db.shloks.save(shloks);
    
    res.json({
      success: true,
      message: 'Shlok deleted successfully'
    });
  } catch (error) {
    console.error('Delete shlok error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete shlok'
    });
  }
});

/**
 * GET /api/shloks/stats/summary
 * Get shlok statistics
 */
router.get('/stats/summary', async (req, res) => {
  try {
    const shloks = await db.shloks.getAll();
    
    // Count by chapter
    const chapterCounts = {};
    const themeCounts = {};
    const speakerCounts = {};
    
    shloks.forEach(shlok => {
      chapterCounts[shlok.chapterName] = (chapterCounts[shlok.chapterName] || 0) + 1;
      if (shlok.theme) {
        themeCounts[shlok.theme] = (themeCounts[shlok.theme] || 0) + 1;
      }
      if (shlok.speaker) {
        speakerCounts[shlok.speaker] = (speakerCounts[shlok.speaker] || 0) + 1;
      }
    });
    
    res.json({
      success: true,
      data: {
        total: shloks.length,
        chapters: chapterCounts,
        themes: themeCounts,
        speakers: speakerCounts,
        starred: shloks.filter(s => s.star).length
      }
    });
  } catch (error) {
    console.error('Get shlok stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
});

module.exports = router;
