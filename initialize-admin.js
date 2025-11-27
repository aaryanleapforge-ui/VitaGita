/**
 * Initialize Default Admin User in Firestore
 * Run this once to create the default admin user
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { db } = require('./config/firestore');

async function initializeAdmin() {
  try {
    console.log(' Initializing default admin user...');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@gitagita.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';

    // Check if admin already exists
    const existingAdmin = await db.admins.findByEmail(adminEmail);

    if (existingAdmin) {
      console.log(' Admin user already exists:', adminEmail);
      console.log('   Email:', adminEmail);
      console.log('   Password: (use the one in .env file)');
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create admin user
    const adminData = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      name: 'Admin',
      createdAt: new Date().toISOString(),
      lastLogin: null,
    };

    await db.admins.create(adminData);

    console.log(' Default admin user created successfully!');
    console.log('');
    console.log(' Email:', adminEmail);
    console.log(' Password:', adminPassword);
    console.log('');
    console.log('  Please change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error(' Failed to initialize admin:', error);
    process.exit(1);
  }
}

initializeAdmin();
