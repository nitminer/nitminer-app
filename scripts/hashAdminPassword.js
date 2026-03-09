const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true, index: true },
  password: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isActive: Boolean,
  isPremium: Boolean,
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);

async function updateAdminPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    const adminEmail = 'nitminer@nitw.ac.in';
    const plainPassword = 'Admin@123456';
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(plainPassword, 12);
    console.log('✓ Password hashed successfully\n');

    // Update the admin user with hashed password
    const admin = await User.findOneAndUpdate(
      { email: adminEmail },
      { password: hashedPassword, role: 'admin', isActive: true, isPremium: true },
      { new: true }
    );

    if (admin) {
      console.log('═══════════════════════════════════════════');
      console.log('✅ ADMIN PASSWORD UPDATED SUCCESSFULLY');
      console.log('═══════════════════════════════════════════\n');
      console.log('Login Credentials:');
      console.log(`  Email:    ${admin.email}`);
      console.log(`  Password: ${plainPassword}`);
      console.log(`  Role:     ${admin.role}`);
      console.log(`  Status:   ${admin.isActive ? '✓ Active' : '✗ Inactive'}`);
      console.log(`  Premium:  ${admin.isPremium ? '✓ Lifetime' : '✗ No'}`);
      console.log('\n═══════════════════════════════════════════\n');
    } else {
      console.log('❌ Admin user not found!\n');
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateAdminPassword();
