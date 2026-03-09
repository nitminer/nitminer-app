const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// User Schema
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true, index: true },
  username: { type: String, unique: true, sparse: true },
  phone: String,
  password: String,
  verified: { type: Boolean, default: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user', index: true },
  trialCount: { type: Number, default: 5 },
  isPremium: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  subscriptionExpiry: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);

async function updateTrialCounts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    // Update all users (except admin) with trialCount < 50000
    const result = await User.updateMany(
      { 
        role: { $ne: 'admin' },
        trialCount: { $lt: 50000 }
      },
      { 
        $set: { trialCount: 50000 }
      }
    );

    console.log('='.repeat(60));
    console.log('TRIAL COUNT UPDATE SUMMARY');
    console.log('='.repeat(60));
    console.log(`✓ Modified: ${result.modifiedCount} users`);
    console.log(`✓ Matched: ${result.matchedCount} users`);
    console.log(`✓ New trial count: 50,000 (50k)`);
    console.log('='.repeat(60) + '\n');

    // Verify the update
    const userWithTrials = await User.findOne({ role: 'user' });
    if (userWithTrials) {
      console.log('✓ Sample user verification:');
      console.log(`  - Username: ${userWithTrials.username}`);
      console.log(`  - Trial Count: ${userWithTrials.trialCount.toLocaleString()}`);
      console.log('');
    }

    await mongoose.disconnect();
    console.log('✓ Database connection closed');
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

updateTrialCounts();
