import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import '../styles/Settings.css';

function Settings() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (userData.fullName) {
      const [firstName, ...lastNameParts] = userData.fullName.split(' ');
      setFormData({
        firstName: firstName || '',
        lastName: lastNameParts.join(' ') || '',
        email: userData.email || '',
        password: '',
        confirmPassword: '',
        role: userData.role || ''
      });
      
      
      setIsAdmin(userData.role === 'Admin' || userData.role === 'admin');
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    
    if (formData.password || formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        setMessage({ text: 'Passwords do not match!', type: 'error' });
        return;
      }
    }

    setLoading(true);

    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
      
      
      const updateData = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName
      };

     
      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await fetch(`${backendUrl}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ text: 'Profile updated successfully!', type: 'success' });
        
        
        if (!formData.password) {
          const updatedUser = {
            ...userData,
            fullName: `${formData.firstName} ${formData.lastName}`,
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          
          
          setFormData(prev => ({
            ...prev,
            password: '',
            confirmPassword: ''
          }));
        } else {
          
          localStorage.removeItem('user');
          setTimeout(() => {
            navigate('/login');
          }, 1500);
        }
      } else {
        setMessage({ text: data.error || 'Failed to update profile', type: 'error' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ text: 'An error occurred. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-container">
      <Sidebar />
      
      <div className="settings-main">
        <h1 className="settings-title">Settings</h1>
        
        <div className="settings-content">
          <div className="settings-tab-header">
            <h2 className="tab-title active">Edit Profile</h2>
          </div>

          <form className="settings-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="firstName">First name</label>
              <div className={isAdmin ? "email-input-wrapper" : ""}>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`form-input ${isAdmin ? 'email-readonly' : ''}`}
                  required
                  readOnly={isAdmin}
                  disabled={isAdmin}
                />
                {isAdmin && <span className="info-icon" title="Admin name cannot be changed">ⓘ</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last name</label>
              <div className={isAdmin ? "email-input-wrapper" : ""}>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`form-input ${isAdmin ? 'email-readonly' : ''}`}
                  required
                  readOnly={isAdmin}
                  disabled={isAdmin}
                />
                {isAdmin && <span className="info-icon" title="Admin name cannot be changed">ⓘ</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="email-input-wrapper">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  className="form-input email-readonly"
                  readOnly
                  disabled
                />
                <span className="info-icon" title="Email cannot be changed">ⓘ</span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-wrapper">
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="••••••••••"
                />
                <span className="info-icon" title="Leave blank to keep current password">ⓘ</span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="password-input-wrapper">
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="••••••••••"
                />
                <span className="info-icon" title="User will logged out immediately">ⓘ</span>
              </div>
              {(formData.password || formData.confirmPassword) && (
                <p className="password-warning">User will be logged out immediately</p>
              )}
            </div>

            {message.text && (
              <div className={`message ${message.type}`}>
                {message.text}
              </div>
            )}

            <div className="form-actions">
              <button 
                type="submit" 
                className="save-btn"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Settings;