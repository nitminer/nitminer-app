require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function test() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db('trustinn');
    
    // Check if update from earlier worked
    const refund = await db.collection('refundrequests').findOne({ _id: '69884042442afe3c20803e4a' });
    console.log('Refund record:');
    console.log('- _id:', refund._id);
    console.log('- userEmail:', refund.userEmail || 'NOT SET');
    console.log('- status:', refund.status);
    
    if (!refund.userEmail) {
      // Update it if missing
      await db.collection('refundrequests').updateOne(
        { _id: refund._id },
        { $set: { userEmail: 'rajeshbyreddy95@gmail.com' } }
      );
      console.log('✅ Updated refund with userEmail');
    } else {
      console.log('✅ Refund already has userEmail');
    }
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await client.close();
  }
}

test().then(() => process.exit(0)).catch(() => process.exit(1));
