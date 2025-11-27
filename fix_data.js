const fs = require('fs');
const path = require('path');

// Fix data files
const dataDir = path.join(__dirname, 'server', 'data');

// Empty users array
fs.writeFileSync(path.join(dataDir, 'users.json'), '[]', 'utf8');

// Empty analytics
fs.writeFileSync(path.join(dataDir, 'analytics.json'), JSON.stringify({
  views: [],
  searches: [],
  bookmarks: [],
  totalUsers: 0,
  newUsersToday: 0
}, null, 2), 'utf8');

console.log('✅ Data files fixed!');
console.log('📝 users.json reset to empty array');
console.log('📊 analytics.json reset');
console.log('\nNow when users sign up in your mobile app, they will appear here!');
