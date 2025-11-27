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

// Helper function to fix URL if it's stored as an object with numeric keys
const fixUrl = (url) => {
  if (typeof url === 'string') return url;
  if (typeof url === 'object' && url !== null) {
    // Convert object with numeric keys back to string
    const chars = [];
    for (let i = 0; url[i] !== undefined; i++) {
      chars.push(url[i]);
    }
    return chars.join('');
  }
  return url;
};

/**
 * GET /api/videos
 * Get all video links
 */
router.get('/', async (req, res) => {
  try {
    const videos = await db.videos.getAll();

    // Firestore returns array of objects with id, key, url
    // Filter out Firestore metadata and ensure proper structure
    const videoArray = videos.map(video => ({
      key: video.key || video.id,
      url: fixUrl(video.url)
    })).filter(v => v.key && v.url && typeof v.url === 'string');

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
    const video = videos.find(v => (v.key || v.id) === req.params.key);

    if (!video) {
      return res.status(404).json({
        success: false,
        error: 'Video not found'
      });
    }

    res.json({
      success: true,
      data: {
        key: video.key || video.id,
        url: fixUrl(video.url)
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

    // Check if key exists
    if (videos.find(v => (v.key || v.id) === key)) {
      return res.status(409).json({
        success: false,
        error: 'Video key already exists'
      });
    }

    // Add new video
    videos.push({ key, url });
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
    const videoIndex = videos.findIndex(v => (v.key || v.id) === req.params.key);

    if (videoIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Video not found'
      });
    }

    videos[videoIndex].url = url;
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
    const videoIndex = videos.findIndex(v => (v.key || v.id) === req.params.key);

    if (videoIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Video not found'
      });
    }

    videos.splice(videoIndex, 1);
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
      const existingIndex = videos.findIndex(v => (v.key || v.id) === key);
      
      if (existingIndex >= 0) {
        videos[existingIndex].url = url;
        updated++;
      } else {
        videos.push({ key, url });
        added++;
      }
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
