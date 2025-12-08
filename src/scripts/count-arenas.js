/* eslint-disable @typescript-eslint/no-require-imports */
// Standalone script to count arenas in MongoDB
// This script connects directly to MongoDB without importing TypeScript modules

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Function to load environment variables from .env.local
function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim();
          process.env[key.trim()] = value.replace(/^["']|["']$/g, '');
        }
      }
    });
  }
}

// Load environment variables
loadEnvFile();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI environment variable is not defined');
  console.log('Please set MONGODB_URI in your .env.local file');
  process.exit(1);
}

// Define Arena schema directly in this script
const ArenaSchema = new mongoose.Schema({
  ownerId: String,
  name: String,
  slug: String,
  description: String,
  category: String,
  city: String,
  mainContact: String,
  whatsappNumber: String,
  logo: String,
  isApproved: Boolean,
  isActive: Boolean
}, {
  timestamps: true
});

(async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');
    
    const Arena = mongoose.models.Arena || mongoose.model('Arena', ArenaSchema);
    
    const count = await Arena.countDocuments();
    console.log(`\n✓ Total arenas in database: ${count}`);
    
    // Optional: Get some statistics
    const approvedCount = await Arena.countDocuments({ isApproved: true });
    const activeCount = await Arena.countDocuments({ isActive: true });
    
    console.log(`  - Approved arenas: ${approvedCount}`);
    console.log(`  - Active arenas: ${activeCount}`);
    
    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    await mongoose.connection.close();
    process.exit(1);
  }
})();