/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Setup Script for BookMyPlay
 * Run this once to create the initial admin account
 * 
 * Usage: node src/scripts/setup.js
 */

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@bookmyplay.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123456';

const OwnerSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  phone: String,
  whatsappNumber: String,
  accountType: String,
  isActive: Boolean,
  role: String,
}, { timestamps: true });

const Owner = mongoose.models.Owner || mongoose.model('Owner', OwnerSchema);

async function setup() {
  try {
    console.log('🚀 Starting BookMyPlay setup...\n');

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check if admin already exists
    const existingAdmin = await Owner.findOne({ email: ADMIN_EMAIL });
    
    if (existingAdmin) {
      console.log('⚠️  Admin account already exists!');
      console.log(`   Email: ${ADMIN_EMAIL}`);
      console.log('\n✅ Setup complete!\n');
      process.exit(0);
    }

    // Create admin account
    console.log('👤 Creating admin account...');
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

    await Owner.create({
      name: 'Admin',
      email: ADMIN_EMAIL,
      password: hashedPassword,
      phone: '03000000000',
      whatsappNumber: '03000000000',
      accountType: 'premium',
      isActive: true,
      role: 'admin',
    });

    console.log('✅ Admin account created successfully!\n');
    console.log('📋 Admin Credentials:');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log('\n⚠️  IMPORTANT: Change the admin password after first login!\n');

    console.log('✅ Setup complete! You can now start the application.\n');
    console.log('🌐 Run: npm run dev');
    console.log('🔗 Visit: http://localhost:3000/admin/login\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

setup();
