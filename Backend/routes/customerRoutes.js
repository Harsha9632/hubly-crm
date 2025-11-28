const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');


const getDb = () => mongoose.connection.db;


router.post('/submit-query', async (req, res) => {
  try {
    const { name, phone, email, message } = req.body;

    if (!name || !phone || !email || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const db = getDb();
    const chatsCollection = db.collection('chats');
    const messagesCollection = db.collection('messages');
    const settingsCollection = db.collection('chatbot_settings');

    
    const settings = await settingsCollection.findOne({ setting_id: 'default' });
    const timerMinutes = settings?.timer_minutes?.[1] || 10;

    
    const ticketCount = await chatsCollection.countDocuments();
    const chatId = `2025-${String(ticketCount + 1).padStart(5, '0')}`;
    const chatNumber = ticketCount + 1;

   
    const newChat = {
      chatId: chatId,
      chatNumber: chatNumber,
      userName: name,
      userPhone: phone,
      userEmail: email,
      lastMessage: message,
      lastMessageTime: new Date(),
      status: 'unresolved',
      assignedTo: 'Admin (You)',
      unreadCount: 1,
      resolutionTimerMinutes: parseInt(timerMinutes),
      expectedResolutionTime: new Date(Date.now() + parseInt(timerMinutes) * 60000),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await chatsCollection.insertOne(newChat);

  
    const initialMessage = {
      messageId: uuidv4(),
      chatId: chatId,
      sender: name,
      senderType: 'user',
      text: message,
      timestamp: new Date(),
      isRead: false
    };

    await messagesCollection.insertOne(initialMessage);

    res.status(201).json({
      success: true,
      message: 'Your query has been submitted successfully! We will get back to you soon.',
      ticketId: chatId,
      chatId: chatId  
    });
  } catch (error) {
    console.error('Error submitting query:', error);
    res.status(500).json({ error: 'Failed to submit query. Please try again.' });
  }
});

module.exports = router;