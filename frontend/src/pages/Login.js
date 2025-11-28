import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Auth.css';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.username,
                    password: formData.password
                })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('token', data.token);
                
                alert('Login successful!');
                
                if (data.user.role === 'Admin') {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/admin/chat-center');
                }
            } else {
                setError(data.error || 'Invalid email or password');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('Error logging in. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-form-section">
                <div className="auth-form-wrapper">
                    <div className="auth-logo">
                        <img src="/images/hubly-logo.png" alt="Hubly" />
                    </div>

                    <h1 className="auth-title">Sign in to your Plexify</h1>

                    {error && (
                        <div style={{
                            backgroundColor: '#FEE2E2',
                            color: '#DC2626',
                            padding: '12px',
                            borderRadius: '8px',
                            marginBottom: '20px',
                            fontSize: '14px'
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label>Username</label>
                            <input
                                type="email"
                                placeholder="Email"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>

                        <button type="submit" className="auth-button" disabled={loading}>
                            {loading ? 'Logging in...' : 'Log in'}
                        </button>
                    </form>

                    <p className="auth-footer-text">
                        Don't have an account? <a href="/signup">Sign up</a>
                    </p>

                    <p className="auth-disclaimer">
                        This site is protected by reCAPTCHA and the Google Privacy Policy and Terms of Service apply.
                    </p>
                </div>
            </div>

            <div className="auth-image-section"> 
                <img src="/images/Frame.png" alt="Background" />
            </div>
        </div>
    );
};

export default Login;