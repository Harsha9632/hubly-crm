import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../styles/ChatWidget.css';

const ChatWidget = () => {
  
  const defaultSettings = {
    headerColor: '#3B5567',
    backgroundColor: '#EEEEEE',
    welcomeMessage: "👋 Want to chat about Hubly? I'm an chatbot here to help you find your way.",
    customMessages: ['How can I help you?', 'Ask me anything!']
  };

  const [settings, setSettings] = useState(defaultSettings);
  const [isOpen, setIsOpen] = useState(false);
  const [showToast, setShowToast] = useState(true);
  const [step, setStep] = useState('form'); 
  const [chatId, setChatId] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobile, isOpen]);

  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  
  useEffect(() => {
    if (step === 'chat' && isMobile && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [step, isMobile]);

 
  const loadSettings = useCallback(async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/chatbot/settings`);
      const data = await response.json();
      
      setSettings({
        headerColor: data.header_color || '#3B5567',
        backgroundColor: data.background_color || '#EEEEEE',
        welcomeMessage: data.welcome_message || "👋 Want to chat about Hubly? I'm an chatbot here to help you find your way.",
        customMessages: [
          data.message1 || 'How can I help you?',
          data.message2 || 'Ask me anything!'
        ]
      });
    } catch (error) {
      console.error('Error loading chatbot settings:', error);
    }
  }, [BACKEND_URL]);

  
  const fetchMessages = useCallback(async () => {
    if (!chatId) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/chats/${chatId}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [chatId, BACKEND_URL]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  
  useEffect(() => {
    if (step === 'chat' && chatId) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [step, chatId, fetchMessages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/chats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName: formData.name,
          userPhone: formData.phone,
          userEmail: formData.email,
          initialMessage: 'Hello! I would like to chat with you.'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        setChatId(data.chat.chatId);
        setCustomerName(formData.name);
        setMessages([
          {
            sender: formData.name,
            senderType: 'user',
            text: 'Hello! I would like to chat with you.',
            timestamp: new Date().toISOString()
          }
        ]);
        setStep('chat');
      } else {
        alert('Failed to start chat. Please try again.');
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      alert('Failed to start chat. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !chatId) return;

    const messageText = newMessage;
    setNewMessage('');

    const optimisticMessage = {
      sender: customerName,
      senderType: 'user',
      text: messageText,
      timestamp: new Date().toISOString()
    };
    setMessages([...messages, optimisticMessage]);

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/chats/${chatId}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sender: customerName,
            senderType: 'user',
            text: messageText
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      await fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (showToast) {
      setShowToast(false);
    }
  };

  const closeChat = () => {
    setIsOpen(false);
  };

  const closeToast = (e) => {
    e.stopPropagation();
    setShowToast(false);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="chat-widget-container">
      
      {showToast && !isOpen && (
        <div className={`chat-toast ${isMobile ? 'mobile' : ''}`}>
          <div className="toast-robot-icon">
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
              <circle cx="30" cy="30" r="30" fill="#FFB84D"/>
              <circle cx="30" cy="25" r="8" fill="#FF6B6B"/>
              <rect x="22" y="28" width="16" height="12" rx="2" fill="#FF8A80"/>
              <rect x="26" y="32" width="8" height="6" fill="#FFF" opacity="0.8"/>
              <line x1="30" y1="15" x2="30" y2="10" stroke="#4A90E2" strokeWidth="2"/>
              <circle cx="30" cy="8" r="2" fill="#4A90E2"/>
              <line x1="22" y1="18" x2="18" y2="14" stroke="#4A90E2" strokeWidth="2"/>
              <circle cx="16" cy="12" r="2" fill="#4A90E2"/>
              <line x1="38" y1="18" x2="42" y2="14" stroke="#4A90E2" strokeWidth="2"/>
              <circle cx="44" cy="12" r="2" fill="#4A90E2"/>
            </svg>
          </div>
          <div className="toast-content">
            <p className="toast-text">{settings.welcomeMessage}</p>
          </div>
          <button className="toast-close-btn" onClick={closeToast} aria-label="Close notification">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      )}

      
      {isOpen && (
        <div className={`chat-box ${isMobile ? 'mobile-fullscreen' : ''}`}>
          
          <div 
            className="chat-box-header" 
            style={{ backgroundColor: settings.headerColor }}
          >
            <div className="chat-header-content">
              <div className="chat-robot-avatar-container">
                <div className="chat-robot-avatar">
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <circle cx="20" cy="20" r="20" fill="#FFB84D"/>
                    <circle cx="20" cy="17" r="5" fill="#FF6B6B"/>
                    <rect x="15" y="19" width="10" height="8" rx="1" fill="#FF8A80"/>
                  </svg>
                </div>
                <div className="online-indicator"></div>
              </div>
              <span className="chat-header-title">{step === 'chat' ? 'Hubly Support' : 'Hubly'}</span>
            </div>
            {isMobile && (
              <button className="close-chat-btn" onClick={closeChat} aria-label="Close chat">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            )}
          </div>

         
          <div 
            className={`chat-box-body ${isMobile ? 'mobile' : ''}`}
            style={{ backgroundColor: settings.backgroundColor }}
          >
            {step === 'form' ? (
              <>
                
                {settings.customMessages.map((msg, index) => (
                  <div key={index} className="bot-message-bubble">
                    <div className="bot-avatar-small">
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                        <circle cx="16" cy="16" r="16" fill="#FFB84D"/>
                        <circle cx="16" cy="14" r="4" fill="#FF6B6B"/>
                      </svg>
                    </div>
                    <div className="bot-message-text">{msg}</div>
                  </div>
                ))}

                
                <div className="user-message-container">
                  <div className="user-message-bubble">Hey!</div>
                </div>

                
                <div className={`chat-intro-form ${isMobile ? 'mobile' : ''}`}>
                  <h3>Introduce Yourself</h3>
                  
                  <form onSubmit={handleSubmit} className="chat-form">
                    <div className="form-group">
                      <label>Your name</label>
                      <input
                        type="text"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                        autoComplete="name"
                      />
                    </div>

                    <div className="form-group">
                      <label>Your Phone</label>
                      <input
                        type="tel"
                        placeholder="+1 (000) 000-0000"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        required
                        autoComplete="tel"
                      />
                    </div>

                    <div className="form-group">
                      <label>Your Email</label>
                      <input
                        type="email"
                        placeholder="example@gmail.com"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                        autoComplete="email"
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="submit-btn"
                      style={{ backgroundColor: settings.headerColor }}
                      disabled={loading}
                    >
                      {loading ? 'Loading...' : 'Thank You!'}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <>
                
                <div className={`chat-messages-list ${isMobile ? 'mobile' : ''}`}>
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`chat-message ${msg.senderType === 'user' ? 'user-msg' : 'admin-msg'}`}
                    >
                      {msg.senderType === 'admin' && (
                        <div className="bot-avatar-small">
                          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                            <circle cx="16" cy="16" r="16" fill="#FFB84D"/>
                            <circle cx="16" cy="14" r="4" fill="#FF6B6B"/>
                          </svg>
                        </div>
                      )}
                      <div className="message-bubble">
                        <div className="message-text">{msg.text}</div>
                        <div className="message-time">{formatTime(msg.timestamp)}</div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </>
            )}
          </div>

          
          <div className={`chat-box-footer ${isMobile ? 'mobile' : ''}`}>
            {step === 'chat' ? (
              <form onSubmit={handleSendMessage} className="message-form">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Write a message"
                  className="message-input"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  autoComplete="off"
                />
                <button 
                  type="submit" 
                  className="send-btn-icon"
                  disabled={!newMessage.trim()}
                  aria-label="Send message"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill={newMessage.trim() ? '#3B5567' : '#999'}/>
                  </svg>
                </button>
              </form>
            ) : (
              <div className="message-form">
                <input
                  type="text"
                  placeholder="Write a message"
                  className="message-input"
                  disabled
                />
                <button className="send-btn-icon" disabled aria-label="Send message">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="#999"/>
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      
      <button 
        className={`chat-fab-btn ${isMobile ? 'mobile' : ''}`}
        onClick={toggleChat}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <img src="/images/close-icon.png" alt="Close" className="fab-icon" />
        ) : (
          <img src="/images/chat-icon.png" alt="Chat" className="fab-icon" />
        )}
      </button>
    </div>
  );
};

export default ChatWidget;

