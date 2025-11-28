import React, { useState, useEffect, useRef, useCallback } from 'react';
import AdminLayout from '../components/AdminLayout';
import '../styles/ChatCenter.css';

const ChatCenter = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [showTeammateModal, setShowTeammateModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedTeammate, setSelectedTeammate] = useState('Harsha s');
  const [ticketStatus, setTicketStatus] = useState('unresolved');
  const [showTeammateDropdown, setShowTeammateDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentChatDetails, setCurrentChatDetails] = useState(null);
  const [teammates, setTeammates] = useState([]);
  const [userHasSelectedChat, setUserHasSelectedChat] = useState(false);
  const [showReassignmentMessage, setShowReassignmentMessage] = useState(false);
  const [reassignedToName, setReassignedToName] = useState('');
  const [showResolutionMessage, setShowResolutionMessage] = useState(false);
  const [resolutionMessageText, setResolutionMessageText] = useState('');

  const messagesEndRef = useRef(null);

  
  const currentUserData = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUser = currentUserData.fullName || 'Harsha s';

  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  console.log('=== CURRENT USER ===', currentUser);
  console.log('=== USER DATA ===', currentUserData);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  
  useEffect(() => {
    fetchTeamMembers();
  }, []);

  
  const fetchTeamMembers = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/team`
      );

      if (response.ok) {
        const data = await response.json();

        
        const formattedTeammates = data.map(member => ({
          id: member.id,
          name: member.fullName,
          role: member.role || 'Team Member'
        }));

        setTeammates(formattedTeammates);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
      
      setTeammates([
        { id: 1, name: currentUser, role: 'Admin' }
      ]);
    }
  };

  
  const fetchChats = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/chats?assignedTo=${encodeURIComponent(currentUser)}&status=unresolved`
      );

      if (response.ok) {
        const data = await response.json();
        
       
        if (!showReassignmentMessage && !showResolutionMessage) {
          setChats(data);

          
          if (!userHasSelectedChat && !selectedChat && data.length > 0) {
            setSelectedChat(data[0].chatId);
          }

          
          if (selectedChat && !data.find(chat => chat.chatId === selectedChat)) {
            setSelectedChat(null);
            setMessages([]);
            setCurrentChatDetails(null);
            setUserHasSelectedChat(false);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  }, [currentUser, selectedChat, userHasSelectedChat, showReassignmentMessage, showResolutionMessage]);

  
  useEffect(() => {
    fetchChats();

    
    const interval = setInterval(fetchChats, 5000);
    return () => clearInterval(interval);
  }, [fetchChats]);

  
  const fetchChatDetails = async (chatId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/chats/${chatId}?userId=${encodeURIComponent(currentUser)}`
      );

      if (response.ok) {
        const data = await response.json();
        setCurrentChatDetails(data);
        setSelectedTeammate(data.assignedTo);
        setTicketStatus(data.status);
      } else if (response.status === 403) {
        
        setSelectedChat(null);
        setUserHasSelectedChat(false);
      }
    } catch (error) {
      console.error('Error fetching chat details:', error);
    }
  };

  
  const fetchMessages = async (chatId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/chats/${chatId}/messages?userId=${encodeURIComponent(currentUser)}`
      );

      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else if (response.status === 403) {
       
        setSelectedChat(null);
        setUserHasSelectedChat(false);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  
  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat);
      fetchChatDetails(selectedChat);

      
      const interval = setInterval(() => fetchMessages(selectedChat), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedChat]);

  const getInitials = (name) => {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length >= 2) {
      return names[0][0] + names[1][0];
    }
    return names[0][0];
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleChatClick = (chatId) => {
    setSelectedChat(chatId);
    setUserHasSelectedChat(true);
    setShowReassignmentMessage(false);
    setShowResolutionMessage(false);
  };

  const handleSendMessage = async () => {
    if (message.trim() && selectedChat) {
      const messageText = message;
      setMessage('');
      setLoading(true);

      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/chats/${selectedChat}/messages`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sender: currentUser,
              senderType: 'admin',
              text: messageText,
              currentUser: currentUser
            }),
          }
        );

        if (response.ok) {
          
          await fetchMessages(selectedChat);
        } else if (response.status === 403) {
          
          setSelectedChat(null);
          setUserHasSelectedChat(false);
        } else {
          alert('Failed to send message. Please try again.');
        }
      } catch (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleTeammateChange = (teammate) => {
    if (teammate !== selectedTeammate) {
      setSelectedTeammate(teammate);
      setShowTeammateModal(true);
    }
  };

  const confirmTeammateAssignment = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/chats/${selectedChat}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            assignedTo: selectedTeammate,
            currentUser: currentUser
          }),
        }
      );

      if (response.ok) {
        setShowTeammateModal(false);
        
        
        setReassignedToName(selectedTeammate);
        setShowReassignmentMessage(true);

        
        setTimeout(() => {
          setChats(chats.filter(chat => chat.chatId !== selectedChat));
          setSelectedChat(null);
          setMessages([]);
          setCurrentChatDetails(null);
          setUserHasSelectedChat(false);
          setShowReassignmentMessage(false);
        }, 3000);
      } else if (response.status === 403) {
        setShowTeammateModal(false);
      } else {
        alert('Failed to assign chat. Please try again.');
      }
    } catch (error) {
      console.error('Error assigning chat:', error);
      alert('Failed to assign chat. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    if (newStatus === 'resolved' && ticketStatus === 'unresolved') {
      setShowStatusModal(true);
    } else {
      setTicketStatus(newStatus);
    }
  };

  const confirmStatusChange = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/chats/${selectedChat}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'resolved',
            currentUser: currentUser
          }),
        }
      );

      if (response.ok) {
        setShowStatusModal(false);

        const result = await response.json();
        
        
        if (result.chat.isMissedChat) {
          setResolutionMessageText('Replying to missed chat');
        } else {
          setResolutionMessageText('This chat has been resolved');
        }
        setShowResolutionMessage(true);

        
        setTimeout(() => {
          setChats(chats.filter(chat => chat.chatId !== selectedChat));
          setSelectedChat(null);
          setMessages([]);
          setCurrentChatDetails(null);
          setUserHasSelectedChat(false);
          setShowResolutionMessage(false);
        }, 3000);
      } else if (response.status === 403) {
        setShowStatusModal(false);
      } else {
        alert('Failed to resolve ticket. Please try again.');
      }
    } catch (error) {
      console.error('Error resolving ticket:', error);
      alert('Failed to resolve ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentChat = chats.find(chat => chat.chatId === selectedChat);

  return (
    <AdminLayout>
      <div className="chat-center-container">
        
        <div className="chat-list-section">
          <h2 className="contact-center-header">Contact Center</h2>
          <h3 className="chat-list-title">Chats ({chats.length})</h3>
          <div className="chat-list">
            {chats.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                No unresolved chats assigned to you
              </div>
            ) : (
              chats.map((chat) => (
                <div
                  key={chat.chatId}
                  className={`chat-item ${selectedChat === chat.chatId ? 'active' : ''}`}
                  onClick={() => handleChatClick(chat.chatId)}
                >
                  <div className="chat-avatar">
                    {getInitials(chat.userName)}
                  </div>
                  <div className="chat-info">
                    <div className="chat-name">{chat.userName}</div>
                    <div className="chat-last-message">{chat.lastMessage}</div>
                  </div>
                  <div className="chat-meta">
                    <div className="chat-time">{formatTime(chat.lastMessageTime)}</div>
                    {chat.unreadCount > 0 && (
                      <div className="chat-unread">{chat.unreadCount}</div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        
        <div className="chat-box-section">
          {currentChat ? (
            <>
              
              <div className="chat-header">
                <div className="chat-header-left">
                  <h3 className="ticket-title">Ticket# {currentChat.chatId}</h3>
                </div>
                <img src="/images/material home.png" alt="Home" className="home-icon" />
              </div>

              
              <div className="messages-container" style={{ position: 'relative' }}>
                {messages.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                    No messages yet
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.messageId}
                      className={`message ${msg.senderType === 'admin' ? 'admin-message' : 'user-message'}`}
                    >
                      <div className="message-avatar">
                        {getInitials(msg.sender)}
                      </div>
                      <div className="message-content">
                        <div className="message-sender">{msg.sender}</div>
                        <div className="message-text">{msg.text}</div>
                        <div className="message-time">{formatTime(msg.timestamp)}</div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />

                
                {showReassignmentMessage && (
                  <div style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#f5f5f5',
                    color: '#666',
                    padding: '12px 24px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    textAlign: 'center',
                    zIndex: 1000,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    border: '1px solid #ddd',
                    maxWidth: '90%',
                    whiteSpace: 'nowrap'
                  }}>
                    This chat is assigned to {reassignedToName}. You no longer have access
                  </div>
                )}

                
                {showResolutionMessage && (
                  <div style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: resolutionMessageText === 'Replying to missed chat' ? '#ffebee' : '#f5f5f5',
                    color: resolutionMessageText === 'Replying to missed chat' ? '#c62828' : '#666',
                    padding: '12px 24px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    textAlign: 'center',
                    zIndex: 1000,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    border: resolutionMessageText === 'Replying to missed chat' ? '1px solid #ef5350' : '1px solid #ddd',
                    maxWidth: '90%',
                    whiteSpace: 'nowrap'
                  }}>
                    {resolutionMessageText}
                  </div>
                )}
              </div>

             
              <div className="message-input-container">
                <textarea
                  placeholder="Type your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="message-input"
                  rows="1"
                  disabled={loading || ticketStatus === 'resolved' || showReassignmentMessage || showResolutionMessage}
                />
                <button
                  onClick={handleSendMessage}
                  className="send-btn"
                  title="Send"
                  disabled={loading || ticketStatus === 'resolved' || showReassignmentMessage || showResolutionMessage}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: 'rotate(45deg)' }}>
                    <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </>
          ) : (
            <div className="no-chat-selected">
              <p>Select a chat to start messaging</p>
            </div>
          )}
        </div>

        
        <div className="details-section">
          {currentChatDetails && (
            <>
              
              <div className="details-header">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <h3 className="details-header-title">Chat</h3>
              </div>

              
              <div className="details-label">Details</div>

              
              <div className="detail-row-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span className="detail-text">{currentChatDetails.userName}</span>
              </div>

              
              <div className="detail-row-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                </svg>
                <span className="detail-text">{currentChatDetails.userPhone}</span>
              </div>

              
              <div className="detail-row-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <span className="detail-text">{currentChatDetails.userEmail}</span>
              </div>

             
              <div className="details-label">Teammates</div>

              <div className="custom-dropdown-container">
                <div className="custom-dropdown-header" onClick={() => !showReassignmentMessage && !showResolutionMessage && setShowTeammateDropdown(!showTeammateDropdown)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 00-3-3.87" />
                    <path d="M16 3.13a4 4 0 010 7.75" />
                  </svg>
                  <div className="selected-teammate">
                    <div className="teammate-avatar-small">{getInitials(selectedTeammate.split(' (')[0])}</div>
                    <span>{selectedTeammate}</span>
                  </div>
                  <svg className="dropdown-arrow" width="12" height="12" viewBox="0 0 12 8" fill="none">
                    <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>

                {showTeammateDropdown && !showReassignmentMessage && !showResolutionMessage && (
                  <div className="custom-dropdown-list">
                    {teammates.length === 0 ? (
                      <div style={{ padding: '10px', textAlign: 'center', color: '#999' }}>
                        Loading teammates...
                      </div>
                    ) : (
                      teammates.map((teammate) => (
                        <div
                          key={teammate.id}
                          className="custom-dropdown-item"
                          onClick={() => {
                            handleTeammateChange(teammate.name);
                            setShowTeammateDropdown(false);
                          }}
                        >
                          <div className="teammate-avatar-small">{getInitials(teammate.name.split(' (')[0])}</div>
                          <span>{teammate.name}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              
              <div className="detail-select-row">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <select
                  className="detail-select-field"
                  value={ticketStatus}
                  onChange={handleStatusChange}
                  disabled={loading || showReassignmentMessage || showResolutionMessage}
                >
                  <option value="unresolved">Unresolved</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              {ticketStatus === 'resolved' && (
                <div className="status-resolved-message">
                  {currentChatDetails.isMissedChat
                    ? `⚠️ This chat was MISSED by ${currentChatDetails.missedBy} minutes`
                    : `✅ This chat was resolved on time`
                  }
                </div>
              )}
            </>
          )}
        </div>
      </div>

      
      {showTeammateModal && (
        <div className="modal-overlay-fullscreen">
          <div className="modal-content">
            <h3>Chat would be assigned to different team member</h3>
            <p>Are you sure you want to assign this chat to {selectedTeammate}?</p>
            <div className="modal-actions">
              <button
                className="modal-btn cancel-btn"
                onClick={() => setShowTeammateModal(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="modal-btn confirm-btn"
                onClick={confirmTeammateAssignment}
                disabled={loading}
              >
                {loading ? 'Assigning...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      
      {showStatusModal && (
        <div className="modal-overlay-fullscreen">
          <div className="modal-content">
            <h3>Resolve Ticket</h3>
            <p>Are you sure you want to mark this ticket as resolved?</p>
            <div className="modal-actions">
              <button
                className="modal-btn cancel-btn"
                onClick={() => setShowStatusModal(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="modal-btn confirm-btn"
                onClick={confirmStatusChange}
                disabled={loading}
              >
                {loading ? 'Resolving...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ChatCenter;