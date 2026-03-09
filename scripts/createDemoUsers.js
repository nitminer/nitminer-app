const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });
const bcrypt = require('bcryptjs');

// User Schema - minimal version that matches your database
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true, index: true },
  username: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  phone: String,
  password: String,
  verified: { type: Boolean, default: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user', index: true },
  trialCount: { type: Number, default: 3000 },
  isPremium: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  subscriptionExpiry: Date,
  subscription: {
    _id: mongoose.Schema.Types.ObjectId,
    plan: String,
    planName: String,
    status: { type: String, enum: ['active', 'inactive', 'expired'], default: 'active' },
    startDate: Date,
    endDate: Date,
  },
  permissions: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  try {
    if (this.password) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
  } catch (error) {
    throw error;
  }
});

const User = mongoose.model('User', userSchema);

async function createDemoUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    const password = 'mca27@cse';
    const createdUsers = [];
    const failedUsers = [];

    console.log('Creating 40 demo users...\n');

    // Create 18 more users with usernames mca2741 to mca2758
    for (let i = 41; i <= 58; i++) {
      const username = `mca${2700 + i}`;
      const email = `${username}@student.nitw.ac.in`;
      const firstName = `Student`;
      const lastName = `${i}`;

      try {
        // Check if user already exists
        const existingUser = await User.findOne({
          $or: [
            { email: email.toLowerCase() },
            { username: username.toLowerCase() }
          ]
        });

        if (existingUser) {
          console.log(`⚠ User already exists: ${username} (${email})`);
          failedUsers.push({ username, email, reason: 'Already exists' });
          continue;
        }

        // Create new user
        const user = new User({
          firstName,
          lastName,
          email: email.toLowerCase(),
          username: username.toLowerCase(),
          phone: `+91${String(i).padStart(10, '0')}`,
          password,
          verified: true,
          role: 'user',
          trialCount: 50000,
          isPremium: true,
          isActive: true,
          subscriptionExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
          permissions: ['read', 'write'],
        });

        await user.save();
        createdUsers.push({ username, email });
        console.log(`✓ Created: ${username} (${email})`);
      } catch (error) {
        console.log(`✗ Failed: ${username} - ${error.message}`);
        failedUsers.push({ username, email, reason: error.message });
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('SUMMARY');
    console.log('='.repeat(60));
    console.log(`✓ Total Created: ${createdUsers.length}`);
    console.log(`✗ Total Failed: ${failedUsers.length}`);
    console.log(`✓ Total Users: ${createdUsers.length + failedUsers.length}\n`);

    if (createdUsers.length > 0) {
      console.log('Created Users:');
      createdUsers.forEach((user, index) => {
        console.log(`  ${index + 1}. Username: ${user.username}`);
        console.log(`     Email: ${user.email}`);
        console.log(`     Password: ${password}\n`);
      });
    }

    if (failedUsers.length > 0) {
      console.log('\nFailed Users:');
      failedUsers.forEach(user => {
        console.log(`  - ${user.username}: ${user.reason}`);
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log('LOGIN CREDENTIALS FOR TESTING:');
    console.log('='.repeat(60));
    console.log('Username: mca2741 to mca2758');
    console.log('Password: mca27@cse');
    console.log('='.repeat(60) + '\n');

    await mongoose.disconnect();
    console.log('✓ Database connection closed');
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

createDemoUsers();
