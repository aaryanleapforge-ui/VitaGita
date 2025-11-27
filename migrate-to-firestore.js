/**
 * Migrate JSON data to Firestore
 */

const { db } = require('./config/firestore');
const fs = require('fs');
const path = require('path');

async function migrateData() {
  try {
    console.log('📦 Starting data migration to Firestore...\n');
    
    // Migrate Users
    const usersPath = path.join(__dirname, 'data', 'users.json');
    if (fs.existsSync(usersPath)) {
      const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
      console.log(`👥 Migrating ${users.length} users...`);
      await db.users.save(users);
      console.log('✅ Users migrated\n');
    } else {
      console.log('⚠️ No users.json found, skipping\n');
    }
    
    // Migrate Shloks
    const shloksPath = path.join(__dirname, 'data', 'shloks.json');
    if (fs.existsSync(shloksPath)) {
      let shloks = JSON.parse(fs.readFileSync(shloksPath, 'utf8'));
      
      // Clean shloks - remove empty string keys and rename __1, __2 etc
      shloks = shloks.map((shlok, index) => {
        const cleaned = {};
        Object.keys(shlok).forEach(key => {
          if (key === '') return; // Skip empty keys
          if (key === '__1') cleaned.chapterNumber = shlok[key];
          else if (key === '__2') cleaned.chapterName = shlok[key];
          else if (key === '__3') cleaned.shlok = shlok[key];
          else if (key === '__4') cleaned.keywords = shlok[key];
          else if (key === '__5') cleaned.star = shlok[key];
          else if (key === '__6') cleaned.theme = shlok[key];
          else if (key === '__7') cleaned.speaker = shlok[key];
          else if (key === '__8') cleaned.summary = shlok[key];
          else if (key === '__9') cleaned.avLink = shlok[key];
          else cleaned[key] = shlok[key];
        });
        return cleaned;
      });
      
      console.log(`📖 Migrating ${shloks.length} shloks...`);
      await db.shloks.save(shloks);
      console.log('✅ Shloks migrated\n');
    } else {
      console.log('⚠️ No shloks.json found, skipping\n');
    }
    
    // Migrate Videos
    const videosPath = path.join(__dirname, 'data', 'videos.json');
    if (fs.existsSync(videosPath)) {
      let videos = JSON.parse(fs.readFileSync(videosPath, 'utf8'));
      
      // Convert object to array if needed
      if (!Array.isArray(videos)) {
        videos = Object.keys(videos).map(key => ({
          key,
          ...videos[key]
        }));
      }
      
      console.log(`🎥 Migrating ${videos.length} videos...`);
      await db.videos.save(videos);
      console.log('✅ Videos migrated\n');
    } else {
      console.log('⚠️ No videos.json found, skipping\n');
    }
    
    // Migrate Analytics
    const analyticsPath = path.join(__dirname, 'data', 'analytics.json');
    if (fs.existsSync(analyticsPath)) {
      const analytics = JSON.parse(fs.readFileSync(analyticsPath, 'utf8'));
      console.log('📊 Migrating analytics...');
      await db.analytics.save(analytics);
      console.log('✅ Analytics migrated\n');
    } else {
      console.log('⚠️ No analytics.json found, creating default\n');
      await db.analytics.save({
        totalUsers: 0,
        totalShloks: 0,
        totalVideos: 0,
        newUsersToday: 0,
      });
    }
    
    console.log('🎉 Data migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateData();
