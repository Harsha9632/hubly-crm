require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URL)
  .then(async () => {
    console.log('Connected to MongoDB');
    const db = mongoose.connection.db;
    
   
    const result = await db.collection('chats').updateMany(
      {},
      { $set: { assignedTo: 'Harsha s' } }
    );
    
    console.log(`Updated ${result.modifiedCount} chats to "Harsha s"`);
    
    
    const chats = await db.collection('chats').find({}).toArray();
    console.log('\nAll chats:');
    chats.forEach(chat => {
      console.log(`- ${chat.userName} assigned to: "${chat.assignedTo}"`);
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });