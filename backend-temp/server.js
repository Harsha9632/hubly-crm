const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();


app.use(cors());
app.use(express.json());


const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/hubly_crm';

mongoose.connect(MONGO_URL)
  .then(() => console.log(' MongoDB connected successfully'))
  .catch((err) => console.error(' MongoDB connection error:', err));


const db = mongoose.connection;


const chatRoutes = require('./routes/chatRoutes');
app.use('/api/chats', chatRoutes);


const customerRoutes = require('./routes/customerRoutes');
app.use('/api/customer', customerRoutes);


app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Hubly CRM Backend is running' });
});


app.post('/api/auth/signup', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const collection = db.collection('users');

    
    const existingUser = await collection.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    
    const hashedPassword = await bcrypt.hash(password, 10);

   
    const newUser = {
      id: uuidv4(),
      fullName,
      email,
      password: hashedPassword,
      role: 'Member',
      created_at: new Date(),
      updated_at: new Date()
    };

    await collection.insertOne(newUser);

   
    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});


app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const collection = db.collection('users');

   
    const user = await collection.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

   
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});


app.get('/api/chatbot/settings', async (req, res) => {
  try {
    const collection = db.collection('chatbot_settings');
    const settings = await collection.findOne({ setting_id: 'default' });
    
    if (!settings) {
      
      return res.json({
        header_color: '#3B5567',
        background_color: '#EEEEEE',
        message1: 'How can I help you?',
        message2: 'Ask me anything!',
        welcome_message: "👋 Want to chat about Hubly? I'm an chatbot here to help you find your way.",
        timer_hours: ['12', '00', '01'],
        timer_minutes: ['09', '10', '11'],
        timer_seconds: ['59', '00', '01']
      });
    }
    
    res.json({
      header_color: settings.header_color || '#3B5567',
      background_color: settings.background_color || '#EEEEEE',
      message1: settings.message1 || 'How can I help you?',
      message2: settings.message2 || 'Ask me anything!',
      welcome_message: settings.welcome_message || "👋 Want to chat about Hubly? I'm an chatbot here to help you find your way.",
      timer_hours: settings.timer_hours || ['12', '00', '01'],
      timer_minutes: settings.timer_minutes || ['09', '10', '11'],
      timer_seconds: settings.timer_seconds || ['59', '00', '01']
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});


app.post('/api/chatbot/settings', async (req, res) => {
  try {
    const {
      header_color,
      background_color,
      message1,
      message2,
      welcome_message,
      timer_hours,
      timer_minutes,
      timer_seconds
    } = req.body;

    const collection = db.collection('chatbot_settings');
    
    await collection.updateOne(
      { setting_id: 'default' },
      {
        $set: {
          setting_id: 'default',
          header_color,
          background_color,
          message1,
          message2,
          welcome_message,
          timer_hours,
          timer_minutes,
          timer_seconds,
          updated_at: new Date()
        }
      },
      { upsert: true }
    );

    res.json({ 
      message: 'Settings saved successfully',
      settings: req.body
    });
  } catch (error) {
    console.error('Error saving settings:', error);
    res.status(500).json({ error: 'Failed to save settings' });
  }
});


app.get('/api/analytics', async (req, res) => {
  try {
    const allChats = await db.collection('chats').find({}).toArray();
    const totalChats = allChats.length;
    
    const resolvedChats = allChats.filter(chat => chat.status === 'resolved').length;
    const resolvedPercentage = totalChats > 0 ? Math.round((resolvedChats / totalChats) * 100) : 0;
    
    
    let totalReplyTimeSeconds = 0;
    let chatsWithReplyTime = 0;
    
    for (const chat of allChats) {
      try {
       
        const messages = await db.collection('messages')
          .find({ chatId: chat.chatId })
          .sort({ timestamp: 1 })
          .toArray();
        
        if (messages.length < 2) continue; 
        
        
        const firstUserMessage = messages.find(msg => msg.senderType === 'user');
        
       
        const firstAdminReply = messages.find(msg => 
          msg.senderType === 'admin' && 
          firstUserMessage && 
          new Date(msg.timestamp) > new Date(firstUserMessage.timestamp)
        );
        
        if (firstUserMessage && firstAdminReply) {
          
          const userTime = new Date(firstUserMessage.timestamp).getTime();
          const adminTime = new Date(firstAdminReply.timestamp).getTime();
          const replyTimeSeconds = Math.round((adminTime - userTime) / 1000);
          
          totalReplyTimeSeconds += replyTimeSeconds;
          chatsWithReplyTime++;
        }
      } catch (err) {
        console.error(`Error calculating reply time for chat ${chat.chatId}:`, err);
      }
    }
    
    const averageReplyTime = chatsWithReplyTime > 0 
      ? Math.round(totalReplyTimeSeconds / chatsWithReplyTime) 
      : 0;
    
    
    const tenWeeksAgo = new Date();
    tenWeeksAgo.setDate(tenWeeksAgo.getDate() - 70);
    
    const missedChats = await db.collection('chats')
      .find({ 
        isMissedChat: true,
        createdAt: { $gte: tenWeeksAgo }
      })
      .toArray();
    
    const weekData = [];
    for (let i = 0; i < 10; i++) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (70 - (i * 7)));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      
      const count = missedChats.filter(chat => {
        const chatDate = new Date(chat.createdAt);
        return chatDate >= weekStart && chatDate < weekEnd;
      }).length;
      
      weekData.push({
        week: `Week ${i + 1}`,
        value: count
      });
    }
    
    res.json({
      totalChats,
      resolvedPercentage,
      averageReplyTime,
      missedChatsWeekly: weekData
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});


app.get('/api/team', async (req, res) => {
  try {
    const collection = db.collection('users');
    const users = await collection.find({}).toArray();
    
    
    const teamMembers = users.map(user => ({
      _id: user._id,
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      phone: user.phone || 'N/A'
    }));
    
    res.json(teamMembers);
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
});


app.post('/api/team', async (req, res) => {
  try {
    const { fullName, email, phone, role, password } = req.body;

    if (!fullName || !email) {
      return res.status(400).json({ error: 'Full name and email are required' });
    }

    const collection = db.collection('users');

  
    const existingUser = await collection.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    
    const passwordToHash = password || email;
    const hashedPassword = await bcrypt.hash(passwordToHash, 10);

   
    const newMember = {
      id: uuidv4(),
      fullName,
      email,
      phone: phone || 'N/A',
      role: role || 'Member',
      password: hashedPassword,
      created_at: new Date(),
      updated_at: new Date()
    };

    await collection.insertOne(newMember);

    
    res.status(201).json({
      message: 'Team member added successfully',
      member: {
        _id: newMember._id,
        id: newMember.id,
        fullName: newMember.fullName,
        email: newMember.email,
        phone: newMember.phone,
        role: newMember.role
      }
    });
  } catch (error) {
    console.error('Error adding team member:', error);
    res.status(500).json({ error: 'Failed to add team member' });
  }
});


app.put('/api/team/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, phone, role, password } = req.body;

    const collection = db.collection('users');

    
    const user = await collection.findOne({ _id: new mongoose.Types.ObjectId(id) });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

   
    if (user.role === 'Admin') {
      return res.status(403).json({ error: 'Cannot edit Admin user' });
    }

    const updateData = {
      fullName,
      email,
      phone: phone || 'N/A',
      role: role || 'Member',
      updated_at: new Date()
    };

   
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    const result = await collection.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      message: 'Team member updated successfully'
    });
  } catch (error) {
    console.error('Error updating team member:', error);
    res.status(500).json({ error: 'Failed to update team member' });
  }
});


app.delete('/api/team/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const collection = db.collection('users');

   
    const user = await collection.findOne({ _id: new mongoose.Types.ObjectId(id) });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    
    if (user.role === 'Admin') {
      return res.status(403).json({ error: 'Cannot delete Admin user' });
    }

    const result = await collection.deleteOne({ _id: new mongoose.Types.ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      message: 'Team member deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting team member:', error);
    res.status(500).json({ error: 'Failed to delete team member' });
  }
});


app.put('/api/user/profile', async (req, res) => {
  try {
    const { email, firstName, lastName, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const collection = db.collection('users');
    const updateData = {
      fullName: `${firstName} ${lastName}`,
      updated_at: new Date()
    };

    
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    const result = await collection.updateOne(
      { email: email },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      message: 'Profile updated successfully',
      passwordChanged: !!password
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});


app.get('/api/tickets', async (req, res) => {
  try {
    const collection = db.collection('tickets');
    const tickets = await collection.find({}).sort({ createdAt: -1 }).toArray();
    
  
    if (tickets.length === 0) {
      return res.json([]);
    }
    
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});


app.post('/api/tickets', async (req, res) => {
  try {
    const { userName, userEmail, userPhone, message } = req.body;
    
    const collection = db.collection('tickets');
    
    
    const ticketCount = await collection.countDocuments();
    const ticketId = `TKT-${String(ticketCount + 1).padStart(6, '0')}`;
    
    const newTicket = {
      ticketId: ticketId,
      userName: userName,
      userEmail: userEmail,
      userPhone: userPhone,
      lastMessage: message,
      lastMessageTime: new Date(),
      status: 'unresolved',
      assignedTo: 'admin', 
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await collection.insertOne(newTicket);
    
    res.status(201).json({
      message: 'Ticket created successfully',
      ticket: newTicket
    });
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});


app.put('/api/tickets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const collection = db.collection('tickets');
    
    const updateData = {
      status: status,
      updatedAt: new Date()
    };
    
    
    if (status === 'resolved') {
      updateData.resolvedAt = new Date();
    }
    
    const result = await collection.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    res.json({ message: 'Ticket updated successfully' });
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ error: 'Failed to update ticket' });
  }
});


const PORT = process.env.PORT || 8001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(` Hubly CRM Backend running on port ${PORT}`);
});