/**
 * Manual Admin Seeding Script
 * Run this with: node --loader ts-node/esm scripts/seed-admin.js
 * OR use: npx tsx scripts/seed-admin.js
 */

import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

async function seedAdmin() {
  try {
    const MONGO_URI = 'mongodb://localhost:27017/trustinnn';
    const ADMIN_EMAIL = 'admin@nitminer.com';
    const ADMIN_PASSWORD = '12345678';

    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Define schemas
    const userSchema = new mongoose.Schema({
      firstName: String,
      lastName: String,
      username: { type: String, unique: true, sparse: true },
      email: { type: String, required: true, unique: true, lowercase: true },
      password: String,
      phone: String,
      termsAccepted: Boolean,
      isVerified: Boolean,
      googleId: String,
      hasPremium: Boolean,
      noOfTrails: Number,
      trialExceeded: Boolean,
      premiumToken: String,
    }, { timestamps: true });

    const profileSchema = new mongoose.Schema({
      userId: mongoose.Schema.Types.ObjectId,
      profilePictureUrl: String,
      role: { type: String, default: 'user' },
      accountStatus: String,
      lastLoginDate: Date,
      loginMethod: String,
    }, { timestamps: true });

    const User = mongoose.model('User', userSchema);
    const Profile = mongoose.model('Profile', profileSchema);

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
    if (existingAdmin) {
      console.log('⚠️  Admin already exists!');
      console.log('📧 Email:', existingAdmin.email);
      console.log('✅ Verified:', existingAdmin.isVerified);
      await mongoose.disconnect();
      return;
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcryptjs.hash(ADMIN_PASSWORD, 10);

    // Create admin user
    console.log('👤 Creating admin user...');
    const adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: ADMIN_EMAIL,
      password: hashedPassword,
      phone: '+91-1234567890',
      username: 'admin',
      termsAccepted: true,
      isVerified: true,
      hasPremium: false,
      noOfTrails: 999,
      trialExceeded: false,
      googleId: null,
      premiumToken: null,
    });
    console.log('✅ Admin user created:', adminUser._id);

    // Create admin profile
    console.log('📋 Creating admin profile...');
    await Profile.create({
      userId: adminUser._id,
      role: 'admin',
      accountStatus: 'active',
      lastLoginDate: new Date(),
      loginMethod: 'email',
    });
    console.log('✅ Admin profile created');

    console.log('\n' + '='.repeat(50));
    console.log('✅ ADMIN ACCOUNT CREATED SUCCESSFULLY');
    console.log('='.repeat(50));
    console.log('📧 Email:', ADMIN_EMAIL);
    console.log('🔑 Password:', ADMIN_PASSWORD);
    console.log('🆔 User ID:', adminUser._id);
    console.log('='.repeat(50) + '\n');

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedAdmin();
