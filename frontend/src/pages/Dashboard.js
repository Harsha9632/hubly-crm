import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import '../styles/Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [filteredChats, setFilteredChats] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchChats();
    
    
    const interval = setInterval(fetchChats, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterChats();
  }, [chats, activeTab, searchQuery]);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
      const response = await fetch(`${backendUrl}/api/chats`);
      const data = await response.json();
      setChats(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching chats:', error);
      setLoading(false);
    }
  };

  const filterChats = () => {
    let filtered = [...chats];

    if (activeTab === 'resolved') {
      filtered = filtered.filter(chat => chat.status === 'resolved');
    } else if (activeTab === 'unresolved') {
      filtered = filtered.filter(chat => chat.status === 'unresolved');
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(chat =>
        chat.chatId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.userName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredChats(filtered);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleOpenTicket = (chatId) => {
    navigate('/admin/chat-center');
  };

  const formatTime = (date) => {
    const d = new Date(date);
    const hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes} ${ampm}`;
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return d.toLocaleDateString('en-US', options);
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const names = name.split(' ');
    return names.map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  if (loading && chats.length === 0) {
    return (
      <div className="dashboard-page">
        <Sidebar />
        <div className="dashboard-main">
          <h1>Dashboard</h1>
          <p>Loading chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <Sidebar />
      <div className="dashboard-main">
        <h1 className="dashboard-title">Dashboard</h1>
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search for ticket or customer"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="tabs-container">
          <button
            className={`tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => handleTabClick('all')}
          >
            ☑️ All Tickets ({chats.length})
          </button>
          <button
            className={`tab ${activeTab === 'resolved' ? 'active' : ''}`}
            onClick={() => handleTabClick('resolved')}
          >
            Resolved ({chats.filter(c => c.status === 'resolved').length})
          </button>
          <button
            className={`tab ${activeTab === 'unresolved' ? 'active' : ''}`}
            onClick={() => handleTabClick('unresolved')}
          >
            Unresolved ({chats.filter(c => c.status === 'unresolved').length})
          </button>
        </div>
        <div className="tickets-container">
          {filteredChats.length === 0 ? (
            <div className="no-tickets">
              <p>No chats found</p>
            </div>
          ) : (
            filteredChats.map((chat) => (
              <div key={chat.chatId} className="ticket-card">
                <div className="ticket-header">
                  <div className="ticket-id-section">
                    <div className="ticket-icon-circle"></div>
                    <span className="ticket-id">Ticket# {chat.chatId}</span>
                  </div>
                </div>

                {chat.status === 'unresolved' ? (
                  <>
                    <div className="ticket-message">
                      {chat.lastMessage}
                    </div>
                    <div className="ticket-time">
                      {formatTime(chat.lastMessageTime)}
                    </div>
                  </>
                ) : (
                  <div className="ticket-resolved-container">
                    <div className="ticket-resolved-badge">
                      {chat.isMissedChat 
                        ? `⚠️ Ticket resolved (Missed by ${chat.missedBy} min)` 
                        : '✅ Ticket has been resolved'
                      }
                    </div>
                  </div>
                )}

                <div className="ticket-footer">
                  <div className="user-info">
                    <div className="user-avatar">
                      {getInitials(chat.userName)}
                    </div>
                    <div className="user-details">
                      <div className="user-name">{chat.userName}</div>
                      <div className="user-contact">{chat.userPhone}</div>
                      <div className="user-email">{chat.userEmail}</div>
                    </div>
                  </div>
                  
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;