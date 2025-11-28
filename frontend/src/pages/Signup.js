import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Auth.css';

const Signup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreedToTerms: false
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!formData.agreedToTerms) {
            setError('Please agree to Terms of use and Privacy Policy');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${BACKEND_URL}/api/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName: `${formData.firstName} ${formData.lastName}`,
                    email: formData.email,
                    password: formData.password
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Account created successfully! Please login.');
                navigate('/login');
            } else {
                setError(data.error || 'Error creating account');
            }
        } catch (error) {
            console.error('Signup error:', error);
            setError('Error creating account. Please try again.');
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

                    <div className="auth-header">
                        <h1 className="auth-title">Create an account</h1>
                        <a href="/login" className="auth-link">Sign in instead</a>
                    </div>

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
                            <label>First name</label>
                            <input
                                type="text"
                                placeholder="First name"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Last name</label>
                            <input
                                type="text"
                                placeholder="Last name"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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

                        <div className="form-group">
                            <label>Confirm Password</label>
                            <input
                                type="password"
                                placeholder="Confirm Password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-checkbox">
                            <input
                                type="checkbox"
                                id="terms"
                                checked={formData.agreedToTerms}
                                onChange={(e) => setFormData({ ...formData, agreedToTerms: e.target.checked })}
                                required
                            />
                            <label htmlFor="terms">
                                By creating an account, I agree to our <span className="link-text">Terms of use</span> and <span className="link-text">Privacy Policy</span>
                            </label>
                        </div>
                        <button type="submit" className="auth-button" disabled={loading}>
                            {loading ? 'Creating account...' : 'Create an account'}
                        </button>
                    </form>
                    <p className="auth-disclaimer">
                        This site is protected by reCAPTCHA and the Google Privacy Policy and Terms of Service apply.
                    </p>

                </div>
            </div>

            
            <div className="auth-image-section">
                <img src="/images/frame.png" alt="Background" />
            </div>
              
            
        </div>
    );
};

export default Signup;