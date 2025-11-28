import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const smallIconStyle = {
    width: '24px',
    height: '24px',
    objectFit: 'contain'
  };

  const largeIconStyle = {
    width: '24px',
    height: '24px',
    objectFit: 'contain',
    transform: 'scale(0.7)',
    transformOrigin: 'center'
  };

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <img src="/images/logo1.png" alt="Hubly" />
      </div>

      <nav className="sidebar-nav">
        <div
          className={`sidebar-item ${isActive('/admin/dashboard') ? 'active' : ''}`}
          onClick={() => navigate('/admin/dashboard')}
          title="Dashboard"
        >
          <img src="/images/home.png" alt="Dashboard" style={smallIconStyle} />
        </div>

        <div
          className={`sidebar-item ${isActive('/admin/chat-center') ? 'active' : ''}`}
          onClick={() => navigate('/admin/chat-center')}
          title="Chat Center"
        >
          <img src="/images/chat.png" alt="Chat Center" style={smallIconStyle} />
        </div>

        <div
          className={`sidebar-item ${isActive('/admin/analytics') ? 'active' : ''}`}
          onClick={() => navigate('/admin/analytics')}
          title="Analytics"
        >
          <img src="/images/Analytics.png" alt="Analytics" style={largeIconStyle} />
        </div>

        <div
          className={`sidebar-item ${isActive('/admin/chatbot') ? 'active' : ''}`}
          onClick={() => navigate('/admin/chatbot')}
          title="Chatbot"
        >
          <img src="/images/Chatboat.png" alt="Chatbot" style={largeIconStyle} />
        </div>

        <div
          className={`sidebar-item ${isActive('/admin/teams') ? 'active' : ''}`}
          onClick={() => navigate('/admin/teams')}
          title="Teams"
        >
          <img src="/images/Teams.png" alt="Teams" style={largeIconStyle} />
        </div>

        <div
          className={`sidebar-item ${isActive('/admin/settings') ? 'active' : ''}`}
          onClick={() => navigate('/admin/settings')}
          title="Settings"
        >
          <img src="/images/Setting.png" alt="Settings" style={largeIconStyle} />
        </div>
      </nav>

      
      <div className="sidebar-logout">
        <div 
          className="sidebar-item" 
          title="Profile"
          style={{ position: 'relative', cursor: 'default' }}
        >
          <svg 
            width="32" 
            height="32" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            style={{ opacity: 0.6 }}
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M7 18.5C7.5 16 9.5 14.5 12 14.5C14.5 14.5 16.5 16 17 18.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          
          <span className="status-indicator"></span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;