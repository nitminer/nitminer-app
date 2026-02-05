// MongoDB Setup Commands

// ============================================
// Run these in MongoDB Atlas Shell or MongoDB Compass
// ============================================

// 1. CREATE INDEXES FOR PERFORMANCE
db.users.createIndex({ email: 1 });
db.users.createIndex({ googleId: 1 });
db.users.createIndex({ isPremium: 1 });
db.users.createIndex({ subscriptionExpiry: 1 });

db.payments.createIndex({ userId: 1 });
db.payments.createIndex({ status: 1 });
db.payments.createIndex({ createdAt: -1 });
db.payments.createIndex({ paymentId: 1 });

db.usagelogs.createIndex({ userId: 1, timestamp: -1 });
db.usagelogs.createIndex({ toolName: 1 });
db.usagelogs.createIndex({ timestamp: -1 });

// 2. CREATE INITIAL ADMIN USER
// First generate password hash using Node:
// const bcrypt = require('bcryptjs');
// const hash = bcrypt.hashSync('admin123', 10);
// Then use the hash below:

db.users.insertOne({
  name: "Admin User",
  email: "admin@example.com",
  password: "$2a$10$...", // Replace with actual bcryptjs hash
  role: "admin",
  isPremium: true,
  trialCount: 0,
  subscriptionExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
  createdAt: new Date(),
  updatedAt: new Date()
});

// 3. CREATE INITIAL SYSTEM SETTINGS
db.systemsettings.insertOne({
  freeTrialsEnabled: true,
  pricing: {
    sixMonths: 1000,  // ₹10.00
    twelveMonths: 1500 // ₹15.00
  },
  createdAt: new Date(),
  updatedAt: new Date()
});

// 4. VIEW COLLECTIONS
show collections;

// 5. COUNT DOCUMENTS
db.users.countDocuments();
db.payments.countDocuments();
db.usagelogs.countDocuments();
db.systemsettings.countDocuments();

// 6. SAMPLE QUERIES FOR TESTING

// Get all users
db.users.find({});

// Get all admin users
db.users.find({ role: "admin" });

// Get all premium users
db.users.find({ isPremium: true });

// Get all successful payments
db.payments.find({ status: "success" });

// Get payments from last 30 days
db.payments.find({
  createdAt: {
    $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  }
});

// Get usage logs for a user
db.usagelogs.find({ 
  userId: ObjectId("user-id-here") 
});

// 7. UPDATE OPERATIONS

// Give user premium for 6 months
db.users.updateOne(
  { email: "user@example.com" },
  {
    $set: {
      isPremium: true,
      subscriptionExpiry: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      trialCount: 0
    }
  }
);

// Reset user trials
db.users.updateOne(
  { email: "user@example.com" },
  { $set: { trialCount: 5 } }
);

// Expire user subscription
db.users.updateOne(
  { email: "user@example.com" },
  { $set: { isPremium: false } }
);

// Update system settings (pricing)
db.systemsettings.updateOne(
  {},
  {
    $set: {
      pricing: {
        sixMonths: 1200,  // Change to ₹12.00
        twelveMonths: 1800 // Change to ₹18.00
      }
    }
  }
);

// 8. DELETE OPERATIONS

// Delete user (be careful!)
db.users.deleteOne({ email: "user@example.com" });

// Delete all failed payments
db.payments.deleteMany({ status: "failed" });

// 9. AGGREGATE OPERATIONS

// Total revenue
db.payments.aggregate([
  { $match: { status: "success" } },
  { $group: { _id: null, total: { $sum: "$amount" } } }
]);

// Revenue by plan
db.payments.aggregate([
  { $match: { status: "success" } },
  { $group: { _id: "$plan", total: { $sum: "$amount" }, count: { $sum: 1 } } },
  { $sort: { total: -1 } }
]);

// User statistics
db.users.aggregate([
  {
    $group: {
      _id: "$role",
      count: { $sum: 1 },
      avgTrials: { $avg: "$trialCount" }
    }
  }
]);

// Tool usage statistics
db.usagelogs.aggregate([
  { $group: { _id: "$toolName", count: { $sum: 1 } } },
  { $sort: { count: -1 } }
]);

// 10. BACKUP/EXPORT COMMANDS

// Backup users collection
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/nitminer" --collection users --out ./backup

// Export to JSON
mongoexport --uri="mongodb+srv://user:pass@cluster.mongodb.net/nitminer" --collection users --out users.json

// Import from JSON
mongoimport --uri="mongodb+srv://user:pass@cluster.mongodb.net/nitminer" --collection users --file users.json
