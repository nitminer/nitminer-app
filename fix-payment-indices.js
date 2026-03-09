#!/usr/bin/env node

/**
 * MongoDB Index Fix for Payments Collection
 * 
 * This script fixes the E11000 duplicate key error for the payments collection
 * by dropping the problematic transactionId_1 index if it exists.
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

async function fixPaymentIndices() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const paymentsCollection = db.collection('payments');

    // List all indexes
    console.log('\n📋 Current indexes:');
    const indexes = await paymentsCollection.listIndexes().toArray();
    console.table(indexes.map(idx => ({ name: idx.name, key: JSON.stringify(idx.key) })));

    // Check if transactionId_1 index exists
    const transactionIdIndexExists = indexes.some(idx => idx.name === 'transactionId_1');

    if (transactionIdIndexExists) {
      console.log('\n⚠️  Found problematic transactionId_1 index. Dropping it...');
      await paymentsCollection.dropIndex('transactionId_1');
      console.log('✅ Successfully dropped transactionId_1 index');
    } else {
      console.log('\n✅ transactionId_1 index does not exist - nothing to fix');
    }

    // Verify userId_1 index exists for faster queries
    const userIdIndexExists = indexes.some(idx => idx.name === 'userId_1');
    if (!userIdIndexExists) {
      console.log('\n⚠️  userId_1 index missing. Creating it...');
      await paymentsCollection.createIndex({ userId: 1 });
      console.log('✅ Created userId_1 index');
    }

    // Verify status_1 index exists
    const statusIndexExists = indexes.some(idx => idx.name === 'status_1');
    if (!statusIndexExists) {
      console.log('\n⚠️  status_1 index missing. Creating it...');
      await paymentsCollection.createIndex({ status: 1 });
      console.log('✅ Created status_1 index');
    }

    // Verify createdAt_-1 index exists
    const createdAtIndexExists = indexes.some(idx => idx.name === 'createdAt_-1');
    if (!createdAtIndexExists) {
      console.log('\n⚠️  createdAt_-1 index missing. Creating it...');
      await paymentsCollection.createIndex({ createdAt: -1 });
      console.log('✅ Created createdAt_-1 index');
    }

    console.log('\n📋 Updated indexes:');
    const newIndexes = await paymentsCollection.listIndexes().toArray();
    console.table(newIndexes.map(idx => ({ name: idx.name, key: JSON.stringify(idx.key) })));

    console.log('\n✅ All payment indices have been fixed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing payment indices:', error.message);
    process.exit(1);
  }
}

fixPaymentIndices();
