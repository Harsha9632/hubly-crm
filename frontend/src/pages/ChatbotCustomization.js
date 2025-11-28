import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import '../styles/ChatbotCustomization.css';

const ChatbotCustomization = () => {
  const [headerColor, setHeaderColor] = useState('#3B5567');
  const [backgroundColor, setBackgroundColor] = useState('#EEEEEE');
  const [message1, setMessage1] = useState('How can I help you?');
  const [message2, setMessage2] = useState('Ask me anything!');
  const [welcomeMessage, setWelcomeMessage] = useState("👋 Want to chat about Hubly? I'm an chatbot here to help you find your way.");
  
  const [timerHours, setTimerHours] = useState(['12', '00', '01']);
  const [timerMinutes, setTimerMinutes] = useState(['09', '10', '11']);
  const [timerSeconds, setTimerSeconds] = useState(['59', '00', '01']);

  const [isLoading, setIsLoading] = useState(true);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  const headerPresetColors = ['#000000', '#3B5567', '#FF0000', '#FFC107'];
  const bgPresetColors = ['#000000', '#FFFFFF', '#FF0000', '#FFC107'];

  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/chatbot/settings`);
      const data = await response.json();
      
      setHeaderColor(data.header_color || '#3B5567');
      setBackgroundColor(data.background_color || '#EEEEEE');
      setMessage1(data.message1 || 'How can I help you?');
      setMessage2(data.message2 || 'Ask me anything!');
      setWelcomeMessage(data.welcome_message || "👋 Want to chat about Hubly? I'm an chatbot here to help you find your way.");
      
      if (data.timer_hours) setTimerHours(data.timer_hours);
      if (data.timer_minutes) setTimerMinutes(data.timer_minutes);
      if (data.timer_seconds) setTimerSeconds(data.timer_seconds);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading settings:', error);
      setIsLoading(false);
    }
  }, [BACKEND_URL]);

  const autoSaveSettings = useCallback(async () => {
    try {
      await fetch(`${BACKEND_URL}/api/chatbot/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          header_color: headerColor,
          background_color: backgroundColor,
          message1: message1,
          message2: message2,
          welcome_message: welcomeMessage,
          timer_hours: timerHours,
          timer_minutes: timerMinutes,
          timer_seconds: timerSeconds
        })
      });
      console.log('Settings auto-saved');
    } catch (error) {
      console.error('Error auto-saving settings:', error);
    }
  }, [BACKEND_URL, headerColor, backgroundColor, message1, message2, welcomeMessage, timerHours, timerMinutes, timerSeconds]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    if (!isLoading) {
      autoSaveSettings();
    }
  }, [autoSaveSettings, isLoading]);

  const handleSaveTimer = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/chatbot/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          header_color: headerColor,
          background_color: backgroundColor,
          message1: message1,
          message2: message2,
          welcome_message: welcomeMessage,
          timer_hours: timerHours,
          timer_minutes: timerMinutes,
          timer_seconds: timerSeconds
        })
      });
      
      if (response.ok) {
        alert('Timer settings saved successfully!');
      } else {
        alert('Error saving timer settings');
      }
    } catch (error) {
      console.error('Error saving timer settings:', error);
      alert('Error saving timer settings');
    }
  };

  if (isLoading) {
    return (
      <div className="chatbot-customization-page">
        <Sidebar />
        <div className="chatbot-main-content">
          <h1 className="page-title">Chat Bot</h1>
          <div style={{ textAlign: 'center', padding: '50px', fontSize: '18px' }}>
            Loading settings...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chatbot-customization-page">
      <Sidebar />
      
      <div className="chatbot-main-content">
        <h1 className="page-title">Chat Bot</h1>

        <div className="content-layout">
          <div className="center-section">
            <div className="preview-wrapper">
              <div className="chat-widget">
                <div className="chat-header" style={{ backgroundColor: headerColor }}>
                  <div className="header-content">
                    <div className="chat-avatar-container">
                      <div className="chat-avatar">👤</div>
                      <span className="chat-online-dot"></span>
                    </div>
                    <span className="chat-name">Hubly</span>
                  </div>
                </div>

                <div className="chat-messages" style={{ backgroundColor: backgroundColor }}>
                  <div className="message-left">
                    <div className="bubble-left">{message1}</div>
                  </div>
                  <div className="message-left">
                    <div className="bubble-left">{message2}</div>
                  </div>

                  <div className="message-right">
                    <div className="bubble-right">Hey!</div>
                  </div>

                  <div className="intro-form">
                    <p className="intro-title">Introduction Yourself</p>
                    <input type="text" className="intro-input" placeholder="Your name" disabled />
                    <input type="text" className="intro-input" placeholder="Your Phone" disabled />
                    <input type="email" className="intro-input" placeholder="Your Email" disabled />
                    <button className="intro-button" style={{ backgroundColor: headerColor }}>
                      Thank You!
                    </button>
                  </div>
                </div>

                <div className="chat-footer">
                  <div className="chat-input-wrapper">
                    <input type="text" className="chat-input-field" placeholder="Write a message" disabled />
                    <button className="send-icon-btn">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="#999999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div className="welcome-toast">
                <div className="toast-avatar">👤</div>
                <div className="toast-body">
                  <button className="toast-close">×</button>
                  <p className="toast-message">{welcomeMessage}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="right-section">
            
            <div className="card">
              <label className="card-label">Header Color</label>
              <div className="color-selector-new">
                <div className="color-circles-row">
                  {headerPresetColors.map((color, index) => (
                    <div
                      key={index}
                      className="color-circle"
                      style={{ backgroundColor: color }}
                      onClick={() => setHeaderColor(color)}
                    ></div>
                  ))}
                </div>
                <div className="color-input-row">
                  <div className="color-box" style={{ backgroundColor: headerColor }}></div>
                  <input
                    type="text"
                    className="color-input"
                    value={headerColor}
                    onChange={(e) => setHeaderColor(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="card">
              <label className="card-label">Custom Background Color</label>
              <div className="color-selector-new">
                <div className="color-circles-row">
                  {bgPresetColors.map((color, index) => (
                    <div
                      key={index}
                      className="color-circle"
                      style={{ 
                        backgroundColor: color,
                        border: color === '#FFFFFF' ? '2px solid #ddd' : '2px solid transparent'
                      }}
                      onClick={() => setBackgroundColor(color)}
                    ></div>
                  ))}
                </div>
                <div className="color-input-row">
                  <div className="color-box" style={{ backgroundColor: backgroundColor, border: '2px solid #ddd' }}></div>
                  <input
                    type="text"
                    className="color-input"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="card">
              <label className="card-label">Customized Message</label>
              <div className="input-row">
                <input
                  type="text"
                  className="text-input"
                  value={message1}
                  onChange={(e) => setMessage1(e.target.value)}
                />
                <span className="edit-icon">✏️</span>
              </div>
              <div className="input-row">
                <input
                  type="text"
                  className="text-input"
                  value={message2}
                  onChange={(e) => setMessage2(e.target.value)}
                />
                <span className="edit-icon">✏️</span>
              </div>
            </div>

            <div className="card">
              <label className="card-label">Introduction Form</label>
              <p className="field-label">Your name</p>
              <p className="field-value">Your name</p>
              <p className="field-label">Your Phone</p>
              <p className="field-value">+1(000) 000-0000</p>
              <p className="field-label">Your Email</p>
              <p className="field-value">example@gmail.com</p>
              <button className="action-button" style={{ backgroundColor: headerColor }}>
                Thank You!
              </button>
            </div>

            <div className="card">
              <label className="card-label">Welcome Message</label>
              <div className="textarea-wrapper">
                
                <textarea
                  className="textarea-input"
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  rows="3"
                />
                <span className="edit-icon-absolute">✏️</span>
              </div>
            </div>

            <div className="card">
              <label className="card-label">Missed chat timer</label>
              <div className="timer-wrapper">
                <div className="timer-container">
                  <div className="timer-column">
                    <input type="text" className="timer-box" value={timerHours[0]}
                      onChange={(e) => {
                        const newHours = [...timerHours];
                        newHours[0] = e.target.value;
                        setTimerHours(newHours);
                      }}
                    />
                    <input type="text" className="timer-box" value={timerHours[1]}
                      onChange={(e) => {
                        const newHours = [...timerHours];
                        newHours[1] = e.target.value;
                        setTimerHours(newHours);
                      }}
                    />
                    <input type="text" className="timer-box" value={timerHours[2]}
                      onChange={(e) => {
                        const newHours = [...timerHours];
                        newHours[2] = e.target.value;
                        setTimerHours(newHours);
                      }}
                    />
                  </div>
                  <div className="timer-column">
                    <span className="colon">:</span>
                    <span className="colon">:</span>
                  </div>
                  <div className="timer-column">
                    <input type="text" className="timer-box" value={timerMinutes[0]}
                      onChange={(e) => {
                        const newMinutes = [...timerMinutes];
                        newMinutes[0] = e.target.value;
                        setTimerMinutes(newMinutes);
                      }}
                    />
                    <input type="text" className="timer-box" value={timerMinutes[1]}
                      onChange={(e) => {
                        const newMinutes = [...timerMinutes];
                        newMinutes[1] = e.target.value;
                        setTimerMinutes(newMinutes);
                      }}
                    />
                    <input type="text" className="timer-box" value={timerMinutes[2]}
                      onChange={(e) => {
                        const newMinutes = [...timerMinutes];
                        newMinutes[2] = e.target.value;
                        setTimerMinutes(newMinutes);
                      }}
                    />
                  </div>
                  <div className="timer-column">
                    <span className="colon">:</span>
                    <span className="colon">:</span>
                  </div>
                  <div className="timer-column">
                    <input type="text" className="timer-box" value={timerSeconds[0]}
                      onChange={(e) => {
                        const newSeconds = [...timerSeconds];
                        newSeconds[0] = e.target.value;
                        setTimerSeconds(newSeconds);
                      }}
                    />
                    <input type="text" className="timer-box" value={timerSeconds[1]}
                      onChange={(e) => {
                        const newSeconds = [...timerSeconds];
                        newSeconds[1] = e.target.value;
                        setTimerSeconds(newSeconds);
                      }}
                    />
                    <input type="text" className="timer-box" value={timerSeconds[2]}
                      onChange={(e) => {
                        const newSeconds = [...timerSeconds];
                        newSeconds[2] = e.target.value;
                        setTimerSeconds(newSeconds);
                      }}
                    />
                  </div>
                </div>
                <button className="save-button-full" onClick={handleSaveTimer}>Save</button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotCustomization;