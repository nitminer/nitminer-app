/**
 * Script to fix MongoDB duplicate key error on paymentId
 * Drops the problematic unique index and allows the schema to recreate it properly
 */

const mongoose = require('mongoose');

async function fixPaymentIndex() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Get the Payment collection
    const db = mongoose.connection.db;
    const collection = db.collection('payments');

    // List all indexes
    console.log('📋 Current indexes:');
    const indexes = await collection.listIndexes().toArray();
    indexes.forEach((idx) => {
      console.log(`  - ${JSON.stringify(idx.key)}: ${JSON.stringify(idx)}`);
    });

    // Drop the problematic unique index on paymentId
    try {
      await collection.dropIndex('paymentId_1');
      console.log('✅ Dropped paymentId_1 index');
    } catch (err) {
      if (err.message.includes('index not found')) {
        console.log('ℹ️  paymentId_1 index not found (already dropped)');
      } else {
        throw err;
      }
    }

    console.log('✅ Index fix complete!');
    console.log('📝 The new schema will create the correct index automatically.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing index:', error);
    process.exit(1);
  }
}

fixPaymentIndex();
