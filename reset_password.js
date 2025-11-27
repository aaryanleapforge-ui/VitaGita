const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const usersFile = path.join(__dirname, 'server', 'data', 'users.json');

async function resetPassword() {
  try {
    // Read users
    const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
    
    // Find user
    const userIndex = users.findIndex(u => u.email === 'a@gmail.com');
    
    if (userIndex === -1) {
      console.log('❌ User a@gmail.com not found');
      return;
    }
    
    // Hash new password: 12345678
    const newPassword = '12345678';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    users[userIndex].password = hashedPassword;
    
    // Save
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    
    console.log('✅ Password reset successfully for a@gmail.com');
    console.log('   Email: a@gmail.com');
    console.log('   New Password: 12345678');
    console.log('\nYou can now login with these credentials!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

resetPassword();
