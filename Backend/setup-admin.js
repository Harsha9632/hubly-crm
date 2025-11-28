const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';

async function setupAdmin() {
  try {
    const client = await MongoClient.connect(MONGO_URL, { useUnifiedTopology: true });
    const db = client.db('hubly_crm');
    
    // Check if admin already exists (using 'users' collection)
    const existingAdmin = await db.collection('users').findOne({ role: 'Admin' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('Email:', existingAdmin.email);
      client.close();
      return;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash('Admin123', 10);
    
    // Create admin user (using 'users' collection)
    await db.collection('users').insertOne({
      id: uuidv4(),  // Added UUID for consistency
      fullName: 'Harsha',
      phone: '+1 (555) 100-2000',
      email: 'harsha@hubly.com',
      role: 'Admin',
      password: hashedPassword,
      created_at: new Date(),
      updated_at: new Date()
    });
    
    console.log('✅ Admin user created successfully!');
    console.log('');
    console.log('=== Admin Credentials ===');
    console.log('Email: harsha@hubly.com');
    console.log('Password: Admin123');
    console.log('========================');
    
    client.close();
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  }
}

setupAdmin();