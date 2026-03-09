const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// User Schema - minimal version that matches your database
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true, index: true },
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
});

const User = mongoose.model('User', userSchema);

async function createAdminUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    const adminEmail = 'nitminer@nitw.ac.in';
    
    // Check if admin already exists
    let admin = await User.findOne({ email: adminEmail });
    
    if (admin) {
      console.log(`⚠ Admin user already exists: ${adminEmail}`);
      console.log('Updating permissions and full access...\n');
      
      // Update existing admin with full permissions
      admin.role = 'admin';
      admin.isActive = true;
      admin.verified = true;
      admin.isPremium = true;
      admin.trialCount = 999999;
      admin.subscriptionExpiry = new Date(2099, 12, 31);
      admin.permissions = [
        'access_dashboard',
        'manage_users',
        'manage_payments',
        'manage_refunds',
        'manage_quotations',
        'manage_subscriptions',
        'view_analytics',
        'access_inbox',
        'system_settings',
        'manage_admins'
      ];
      admin.subscription = {
        plan: 'lifetime',
        planName: 'Admin Lifetime',
        status: 'active',
        startDate: new Date(),
        endDate: new Date(2099, 12, 31),
      };
      admin.updatedAt = new Date();
      await admin.save();
    } else {
      console.log(`✓ Creating new admin user\n`);
      
      const newAdmin = new User({
        firstName: 'NITMINER',
        lastName: 'Administrator',
        email: adminEmail,
        phone: '+91-XXXXXXXXXX',
        password: 'Admin@123456', // Will be hashed on login
        role: 'admin',
        verified: true,
        isActive: true,
        isPremium: true,
        trialCount: 999999,
        subscriptionExpiry: new Date(2099, 12, 31),
        subscription: {
          plan: 'lifetime',
          planName: 'Admin Lifetime',
          status: 'active',
          startDate: new Date(),
          endDate: new Date(2099, 12, 31),
        },
        permissions: [
          'access_dashboard',
          'manage_users',
          'manage_payments',
          'manage_refunds',
          'manage_quotations',
          'manage_subscriptions',
          'view_analytics',
          'access_inbox',
          'system_settings',
          'manage_admins'
        ],
      });

      await newAdmin.save();
      admin = newAdmin;
    }

    console.log('═══════════════════════════════════════════');
    console.log('✅ ADMIN USER SETUP COMPLETE');
    console.log('═══════════════════════════════════════════\n');
    console.log('Admin Details:');
    console.log(`  Email:      ${admin.email}`);
    console.log(`  Name:       ${admin.firstName} ${admin.lastName}`);
    console.log(`  Role:       ${admin.role}`);
    console.log(`  Status:     ${admin.isActive ? '✓ Active' : '✗ Inactive'}`);
    console.log(`  Verified:   ${admin.verified ? '✓ Yes' : '✗ No'}`);
    console.log(`  Premium:    ${admin.isPremium ? '✓ Yes' : '✗ No'}`);
    console.log(`  Trials:     ${admin.trialCount}`);
    console.log(`\nLogin Credentials:`);
    console.log(`  Email:      ${adminEmail}`);
    console.log(`  Password:   Admin@123456`);
    console.log('\nPermissions:');
    admin.permissions.forEach(perm => {
      console.log(`  ✓ ${perm}`);
    });
    console.log('\n═══════════════════════════════════════════');
    console.log('\n⚠️  IMPORTANT: Change the default password on first login!');
    console.log('\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdminUser();
