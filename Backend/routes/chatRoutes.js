const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');


const getDb = () => mongoose.connection.db;


router.get('/', async (req, res) => {
  try {
    const { assignedTo, status } = req.query;
    const db = getDb();
    const chatsCollection = db.collection('chats');

    let query = {};
    if (assignedTo) {
      query.assignedTo = assignedTo;
    }
    
    
    if (status) {
      query.status = status;
    }

    const chats = await chatsCollection
      .find(query, { _id: 0 })
      .sort({ createdAt: -1 })
      .toArray();

    res.json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
});


router.get('/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params;
    const { userId } = req.query; 

    const db = getDb();
    const chatsCollection = db.collection('chats');

    const chat = await chatsCollection.findOne(
      { chatId: chatId },
      { _id: 0 }
    );

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

   
    if (userId && chat.assignedTo !== userId) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'This chat is assigned to a different team member. You no longer have access.'
      });
    }

    res.json(chat);
  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({ error: 'Failed to fetch chat' });
  }
});


router.post('/', async (req, res) => {
  try {
    const { userName, userPhone, userEmail, initialMessage } = req.body;

    if (!userName || !userPhone || !userEmail || !initialMessage) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const db = getDb();
    const chatsCollection = db.collection('chats');
    const messagesCollection = db.collection('messages');
    const settingsCollection = db.collection('chatbot_settings');
    const usersCollection = db.collection('users');

    
    const settings = await settingsCollection.findOne({ setting_id: 'default' });
    const timerMinutes = settings?.timer_minutes?.[1] || 10; 

    
    const adminUser = await usersCollection.findOne({ role: 'admin' }, { _id: 0 });
    const assignToUser = adminUser ? adminUser.fullName : 'Harsha s';

   
    const ticketCount = await chatsCollection.countDocuments();
    const chatId = `2025-${String(ticketCount + 1).padStart(5, '0')}`;
    const chatNumber = ticketCount + 1;

    const newChat = {
      chatId: chatId,
      chatNumber: chatNumber,
      userName: userName,
      userPhone: userPhone,
      userEmail: userEmail,
      lastMessage: initialMessage,
      lastMessageTime: new Date(),
      status: 'unresolved',
      assignedTo: assignToUser, 
      unreadCount: 1,
      resolutionTimerMinutes: parseInt(timerMinutes),
      expectedResolutionTime: new Date(Date.now() + parseInt(timerMinutes) * 60000),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await chatsCollection.insertOne(newChat);

   
    const initialMsg = {
      messageId: uuidv4(),
      chatId: chatId,
      sender: userName,
      senderType: 'user',
      text: initialMessage,
      timestamp: new Date(),
      isRead: false
    };

    await messagesCollection.insertOne(initialMsg);

    res.status(201).json({
      message: 'Chat created successfully',
      chat: newChat
    });
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ error: 'Failed to create chat' });
  }
});


router.put('/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params;
    const { assignedTo, status, currentUser } = req.body;

    const db = getDb();
    const chatsCollection = db.collection('chats');

    const chat = await chatsCollection.findOne({ chatId: chatId });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    
    if (currentUser && chat.assignedTo !== currentUser) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You no longer have access to this chat'
      });
    }

    const updateData = {
      updatedAt: new Date()
    };

    if (assignedTo) {
      updateData.assignedTo = assignedTo;
    }

    if (status) {
      updateData.status = status;
      if (status === 'resolved') {
        updateData.resolvedAt = new Date();
        
       
        const resolvedTime = new Date();
        const expectedTime = chat.expectedResolutionTime;
        
        if (resolvedTime > expectedTime) {
          updateData.isMissedChat = true;
          updateData.missedBy = Math.ceil((resolvedTime - expectedTime) / 60000); 
        } else {
          updateData.isMissedChat = false;
          updateData.resolvedEarlyBy = Math.ceil((expectedTime - resolvedTime) / 60000); 
        }
      }
    }

    await chatsCollection.updateOne(
      { chatId: chatId },
      { $set: updateData }
    );

    const updatedChat = await chatsCollection.findOne(
      { chatId: chatId },
      { _id: 0 }
    );

    res.json({
      message: 'Chat updated successfully',
      chat: updatedChat
    });
  } catch (error) {
    console.error('Error updating chat:', error);
    res.status(500).json({ error: 'Failed to update chat' });
  }
});


router.get('/:chatId/messages', async (req, res) => {
  try {
    const { chatId } = req.params;
    const { userId } = req.query;

    const db = getDb();
    const chatsCollection = db.collection('chats');
    const messagesCollection = db.collection('messages');

   
    const chat = await chatsCollection.findOne({ chatId: chatId });
    
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    if (userId && chat.assignedTo !== userId) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You no longer have access to this chat'
      });
    }

    const messages = await messagesCollection
      .find({ chatId: chatId }, { _id: 0 })
      .sort({ timestamp: 1 })
      .toArray();

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});


router.post('/:chatId/messages', async (req, res) => {
  try {
    const { chatId } = req.params;
    const { sender, senderType, text, currentUser } = req.body;

    if (!sender || !senderType || !text) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const db = getDb();
    const chatsCollection = db.collection('chats');
    const messagesCollection = db.collection('messages');

   
    if (senderType === 'admin') {
      const chat = await chatsCollection.findOne({ chatId: chatId });
      
      if (!chat) {
        return res.status(404).json({ error: 'Chat not found' });
      }

      if (currentUser && chat.assignedTo !== currentUser) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You no longer have access to this chat'
        });
      }
    }

    const newMessage = {
      messageId: uuidv4(),
      chatId: chatId,
      sender: sender,
      senderType: senderType,
      text: text,
      timestamp: new Date(),
      isRead: false
    };

    await messagesCollection.insertOne(newMessage);

   
    await chatsCollection.updateOne(
      { chatId: chatId },
      {
        $set: {
          lastMessage: text,
          lastMessageTime: new Date(),
          updatedAt: new Date()
        },
        $inc: { unreadCount: senderType === 'user' ? 1 : 0 }
      }
    );

    res.status(201).json({
      message: 'Message sent successfully',
      data: newMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});


router.get('/analytics/missed', async (req, res) => {
  try {
    const db = getDb();
    const chatsCollection = db.collection('chats');

    const missedChats = await chatsCollection.countDocuments({
      isMissedChat: true
    });

    const resolvedOnTime = await chatsCollection.countDocuments({
      status: 'resolved',
      isMissedChat: false
    });

    res.json({
      missedChats: missedChats,
      resolvedOnTime: resolvedOnTime,
      total: missedChats + resolvedOnTime
    });
  } catch (error) {
    console.error('Error fetching missed chats:', error);
    res.status(500).json({ error: 'Failed to fetch missed chats data' });
  }
});

module.exports = router;