const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';

async function createSampleTickets() {
  try {
    const client = await MongoClient.connect(MONGO_URL, { useUnifiedTopology: true });
    const db = client.db('hubly_crm');
    const collection = db.collection('tickets');
    
    
    const existingTickets = await collection.countDocuments();
    
    if (existingTickets > 0) {
      console.log('⚠️  Tickets already exist!');
      console.log(`Found ${existingTickets} tickets in database`);
      client.close();
      return;
    }
    
    
    const sampleTickets = [
      {
        ticketId: 'TKT-000001',
        userName: 'vishnu',
        userEmail: 'vishnu@example.com',
        userPhone: '+1 (555) 123-4567',
        lastMessage: 'Hi, I need help with my account setup. Can someone guide me?',
        lastMessageTime: new Date('2025-01-15T10:30:00'),
        status: 'unresolved',
        assignedTo: 'admin',
        createdAt: new Date('2025-01-15T10:30:00'),
        updatedAt: new Date('2025-01-15T10:30:00')
      },
      {
        ticketId: 'TKT-000002',
        userName: 'Suraj S',
        userEmail: 'suraj@example.com',
        userPhone: '+1 (555) 987-6543',
        lastMessage: 'The chat widget is not appearing on my website. Please help!',
        lastMessageTime: new Date('2025-01-15T11:45:00'),
        status: 'unresolved',
        assignedTo: 'admin',
        createdAt: new Date('2025-01-15T11:45:00'),
        updatedAt: new Date('2025-01-15T11:45:00')
      },
      {
        ticketId: 'TKT-000003',
        userName: ' Brown',
        userEmail: 'brown@example.com',
        userPhone: '+1 (555) 456-7890',
        lastMessage: 'Thank you for the quick response! Issue is fixed.',
        lastMessageTime: new Date('2025-01-14T15:20:00'),
        status: 'resolved',
        assignedTo: 'admin',
        resolvedAt: new Date('2025-01-14T16:00:00'),
        createdAt: new Date('2025-01-14T15:20:00'),
        updatedAt: new Date('2025-01-14T16:00:00')
      },
      {
        ticketId: 'TKT-000004',
        userName: 'Emily Davis',
        userEmail: 'emily.d@example.com',
        userPhone: '+1 (555) 321-0987',
        lastMessage: 'I cannot login to my dashboard. Getting error 401.',
        lastMessageTime: new Date('2025-01-15T09:15:00'),
        status: 'unresolved',
        assignedTo: 'admin',
        createdAt: new Date('2025-01-15T09:15:00'),
        updatedAt: new Date('2025-01-15T09:15:00')
      },
      {
        ticketId: 'TKT-000005',
        userName: 'David Wilson',
        userEmail: 'david.wilson@example.com',
        userPhone: '+1 (555) 654-3210',
        lastMessage: 'All good now! Thanks for your help.',
        lastMessageTime: new Date('2025-01-13T14:30:00'),
        status: 'resolved',
        assignedTo: 'admin',
        resolvedAt: new Date('2025-01-13T15:00:00'),
        createdAt: new Date('2025-01-13T14:30:00'),
        updatedAt: new Date('2025-01-13T15:00:00')
      }
    ];
    
    await collection.insertMany(sampleTickets);
    
    console.log('✅ Sample tickets created successfully!');
    console.log(`Created ${sampleTickets.length} tickets`);
    console.log('');
    console.log('Ticket IDs:');
    sampleTickets.forEach(ticket => {
      console.log(`  - ${ticket.ticketId} (${ticket.status}): ${ticket.userName}`);
    });
    
    client.close();
  } catch (error) {
    console.error('❌ Error creating sample tickets:', error);
  }
}

createSampleTickets();