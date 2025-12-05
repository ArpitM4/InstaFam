/**
 * Database Index Synchronization Script
 * 
 * Run this script to ensure all database indexes are created:
 * node scripts/sync-indexes.mjs
 * 
 * This script should be run:
 * - After deploying to production
 * - After adding new indexes to models
 * - When experiencing slow query performance
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Prefer .env.local if it exists, else fallback to .env
const envLocalPath = path.resolve(process.cwd(), '.env.local');
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
  console.log('🔑 Loaded environment variables from .env.local');
} else if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log('🔑 Loaded environment variables from .env');
} else {
  dotenv.config();
  console.log('⚠️  No .env or .env.local found, loading default env');
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is not set');
  process.exit(1);
}

// Define indexes inline to avoid import issues with mixed module systems
const indexDefinitions = {
  users: [
    { key: { email: 1 }, options: { unique: true } },
    { key: { username: 1 } },
    { key: { accountType: 1 } },
    { key: { createdAt: -1 } }
  ],
  payments: [
    { key: { to_user: 1, createdAt: -1 } },
    { key: { from_user: 1, createdAt: -1 } },
    { key: { eventId: 1 } },
    { key: { oid: 1 } },
    { key: { done: 1, createdAt: -1 } }
  ],
  pointtransactions: [
    { key: { userId: 1 } },
    { key: { userId: 1, type: 1, createdAt: -1 } },
    { key: { userId: 1, used: 1, expired: 1 } },
    { key: { expiresAt: 1, expired: 1 } },
    { key: { createdAt: -1 } }
  ],
  events: [
    { key: { creatorId: 1, startTime: -1 } },
    { key: { creatorId: 1, status: 1 } }
  ],
  redemptions: [
    { key: { fanId: 1 } },
    { key: { creatorId: 1 } },
    { key: { vaultItemId: 1 } },
    { key: { fanId: 1, creatorId: 1 } }
  ]
};

async function syncIndexes() {
  console.log('🔄 Starting database index synchronization...\n');

  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;

    // Sync indexes for each collection
    for (const [collectionName, indexes] of Object.entries(indexDefinitions)) {
      try {
        console.log(`📊 Syncing indexes for ${collectionName}...`);
        
        const collection = db.collection(collectionName);
        
        // Create each index
        for (const { key, options = {} } of indexes) {
          try {
            await collection.createIndex(key, { background: true, ...options });
          } catch (indexError) {
            // Index might already exist with different options, that's OK
            if (!indexError.message.includes('already exists')) {
              console.log(`      ⚠️ Index ${JSON.stringify(key)}: ${indexError.message}`);
            }
          }
        }
        
        // Get and display current indexes
        const currentIndexes = await collection.indexes();
        console.log(`   ✅ ${collectionName} indexes synced (${currentIndexes.length} indexes):`);
        currentIndexes.forEach(idx => {
          if (idx.name !== '_id_') {
            console.log(`      - ${idx.name}: ${JSON.stringify(idx.key)}`);
          }
        });
        console.log('');
      } catch (error) {
        console.error(`   ❌ Error syncing ${collectionName} indexes:`, error.message);
      }
    }

    console.log('🎉 Index synchronization complete!\n');

  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
syncIndexes();
