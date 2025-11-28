const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
require('dotenv').config();

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/hubly_crm';

async function debugLogin() {
  try {
    console.log(' Debugging Login Issue...\n');
    console.log('Connection String:', MONGO_URL);
    
    const client = await MongoClient.connect(MONGO_URL, { useUnifiedTopology: true });
    
    
    let dbName = 'hubly_crm';
    if (MONGO_URL.includes('/') && MONGO_URL.split('/').length > 3) {
      dbName = MONGO_URL.split('/').pop().split('?')[0];
    }
    
    console.log('Database Name:', dbName);
    
    const db = client.db(dbName);
    const collection = db.collection('users');
    
    
    const admin = await collection.findOne({ email: 'harsha@hubly.com' });
    
    if (!admin) {
      console.log('\n Admin NOT found in database!');
      console.log('Please run: node setup-admin.js');
      client.close();
      return;
    }
    
    console.log('\n Admin found in database:');
    console.log('  Email:', admin.email);
    console.log('  Full Name:', admin.fullName);
    console.log('  Role:', admin.role);
    console.log('  Has Password:', !!admin.password);
    
    
    const testPassword = 'Admin123';
    const isMatch = await bcrypt.compare(testPassword, admin.password);
    
    console.log('\n Password Test:');
    console.log('  Testing password:', testPassword);
    console.log('  Result:', isMatch ? ' CORRECT' : ' WRONG');
    
    if (!isMatch) {
      console.log('\n  Password mismatch! Try recreating admin:');
      console.log('  1. Delete admin: db.users.deleteOne({email: "harsha@hubly.com"})');
      console.log('  2. Run: node setup-admin.js');
    }
    
    
    const allUsers = await collection.find({}).toArray();
    console.log('\n Total users in database:', allUsers.length);
    allUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.role})`);
    });
    
    client.close();
  } catch (error) {
    console.error('\n Error:', error.message);
  }
}

debugLogin();