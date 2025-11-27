/**
 * Test Firestore Connection
 */

const { db } = require('./config/firestore');

async function testConnection() {
  try {
    console.log('🔥 Testing Firestore connection...');
    
    // Test 1: Get analytics
    const analytics = await db.analytics.get();
    console.log('✅ Analytics:', analytics);
    
    // Test 2: Get users count
    const users = await db.users.getAll();
    console.log(`✅ Found ${users.length} users in Firestore`);
    
    // Test 3: Get shloks count
    const shloks = await db.shloks.getAll();
    console.log(`✅ Found ${shloks.length} shloks in Firestore`);
    
    console.log('\n🎉 Firestore connection successful!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Firestore connection failed:', error);
    process.exit(1);
  }
}

testConnection();
