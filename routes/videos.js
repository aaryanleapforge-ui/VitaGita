/**
 * Video Links Management Routes
 * 
 * Manage video links for shloks
 */

const express = require('express');
const { db } = require('../config/database');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateAdmin);

/**
 * GET /api/videos
 * Get all video links
 */
router.get('/', async (req, res) => {
  try {
    const videos = await db.videos.getAll();
    
    // Convert object to array for easier frontend handling
    const videoArray = Object.entries(videos).map(([key, url]) => ({
      key,
      url
    }));
    
    res.json({
      success: true,
      data: {
        videos: videoArray,
        total: videoArray.length
      }
    });
  } catch (error) {
    console.error('Get videos error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch videos'
    });
  }
});

/**
 * GET /api/videos/:key
 * Get single video link
 */
router.get('/:key', async (req, res) => {
  try {
    const videos = await db.videos.getAll();
    const url = videos[req.params.key];
    
    if (!url) {
      return res.status(404).json({
        success: false,
        error: 'Video not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        key: req.params.key,
        url
      }
    });
  } catch (error) {
    console.error('Get video error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch video'
    });
  }
});

/**
 * POST /api/videos
 * Add new video link
 */
router.post('/', async (req, res) => {
  try {
    const { key, url } = req.body;
    
    if (!key || !url) {
      return res.status(400).json({
        success: false,
        error: 'Key and URL are required'
      });
    }
    
    const videos = await db.videos.getAll();
    
    if (videos[key]) {
      return res.status(409).json({
        success: false,
        error: 'Video key already exists'
      });
    }
    
    videos[key] = url;
    await db.videos.save(videos);
    
    res.status(201).json({
      success: true,
      data: { key, url },
      message: 'Video link added successfully'
    });
  } catch (error) {
    console.error('Add video error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add video link'
    });
  }
});

/**
 * PUT /api/videos/:key
 * Update video link
 */
router.put('/:key', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required'
      });
    }
    
    const videos = await db.videos.getAll();
    
    if (!videos[req.params.key]) {
      return res.status(404).json({
        success: false,
        error: 'Video not found'
      });
    }
    
    videos[req.params.key] = url;
    await db.videos.save(videos);
    
    res.json({
      success: true,
      data: { key: req.params.key, url },
      message: 'Video link updated successfully'
    });
  } catch (error) {
    console.error('Update video error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update video link'
    });
  }
});

/**
 * DELETE /api/videos/:key
 * Delete video link
 */
router.delete('/:key', async (req, res) => {
  try {
    const videos = await db.videos.getAll();
    
    if (!videos[req.params.key]) {
      return res.status(404).json({
        success: false,
        error: 'Video not found'
      });
    }
    
    delete videos[req.params.key];
    await db.videos.save(videos);
    
    res.json({
      success: true,
      message: 'Video link deleted successfully'
    });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete video link'
    });
  }
});

/**
 * POST /api/videos/bulk
 * Bulk import video links
 */
router.post('/bulk', async (req, res) => {
  try {
    const { videos: newVideos } = req.body;
    
    if (!newVideos || typeof newVideos !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Videos object is required'
      });
    }
    
    const videos = await db.videos.getAll();
    
    // Merge new videos
    let added = 0;
    let updated = 0;
    
    for (const [key, url] of Object.entries(newVideos)) {
      if (videos[key]) {
        updated++;
      } else {
        added++;
      }
      videos[key] = url;
    }
    
    await db.videos.save(videos);
    
    res.json({
      success: true,
      message: `Bulk import completed: ${added} added, ${updated} updated`,
      data: { added, updated }
    });
  } catch (error) {
    console.error('Bulk import error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to import videos'
    });
  }
});

module.exports = router;
