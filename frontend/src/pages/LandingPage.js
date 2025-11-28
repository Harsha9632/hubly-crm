import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LandingPage.css';
import ChatWidget from '../components/ChatWidget';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="landing-page">
            
            <header className="header">
                <div className="container">
                    <div className="header-content">
                        <div className="logo">
                            <img src="/images/hubly-logo.png" alt="Hubly" />
                        </div>
                        <div className="nav-buttons">
                            <button className="btn-login" onClick={() => navigate('/login')}>
                                Login
                            </button>
                            <button className="btn-signup" onClick={() => navigate('/signup')}>
                                Sign up
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            
            <section className="hero-section">
                <div className="container">
                    <div className="hero-content">
                        <div className="hero-text">
                            <h1 className="hero-title">
                                <span style={{ whiteSpace: 'nowrap' }}>Grow Your Business Faster</span><br />
                                with Hubly CRM
                            </h1>
                            <p className="hero-subtitle">
                                Manage leads, automate workflows, and close deals effortlessly—all in one powerful platform.
                            </p>
                            <div className="hero-buttons">
                                <button className="btn-get-started">
                                    Get started →
                                </button>
                                <button className="btn-watch-video">
                                    <span className="play-icon">▶</span>
                                    Watch Video
                                </button>
                            </div>
                        </div>

                        <div className="hero-image">
                            <img src="/images/hero-image.png" alt="Hubly Dashboard" className="main-hero-img" />

                            
                            <div className="floating-card notification-card">
                                <img src="/images/notification-card.png" alt="Jerry Calzoni joined Swimming" />
                            </div>

                            
                            <div className="floating-card sales-chart">
                                <img src="/images/net-sales-chart.png" alt="Net Sales Chart" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            
            <section className="companies-section">
                <div className="container">
                    <img src="/images/company-logos.png" alt="Company Logos" className="company-logos-img" />
                </div>
            </section>



            
            <section className="features-section">
                <div className="container">
                    <img src="/images/features-funnel.png" alt="Multiple Platforms Together" className="features-img" />
                </div>
            </section>

           
            <section className="pricing-section">
                <div className="container">
                    <h2 className="section-title">We have plans for everyone!</h2>
                    <p className="section-subtitle">
                        Simple, transparent pricing that grows with you. Try any plan free for 30 days.
                    </p>
                    <div className="pricing-cards">
                        <div className="pricing-card">
                            <h3>STARTER</h3>
                            <p className="plan-desc">Great for all businesses. Good starting point for teams looking for collaboration space.</p>
                            <div className="price">$199 <span>/month</span></div>
                            <p className="billed">Billed Annually</p>
                            <ul>
                                <li>✓ Unlimited Users</li>
                                <li>✓ Unlimited Clients</li>
                                <li>✓ Client Relationship Management</li>
                                <li>✓ Team Chat with Video Meetings</li>
                                <li>✓ 50GB Cloud Storage</li>
                            </ul>
                            <button className="btn-plan">Sign Up for starter</button>
                        </div>

                        <div className="pricing-card featured">
                            <h3>GROW</h3>
                            <p className="plan-desc">Great for all businesses. Best value for teams looking for higher cloud storage.</p>
                            <div className="price">$399 <span>/month</span></div>
                            <p className="billed">Billed Annually</p>
                            <ul>
                                <li>✓ Financial Forecasting</li>
                                <li>✓ Project Management</li>
                                <li>✓ Email Campaigns</li>
                                <li>✓ Client Support</li>
                                <li>✓ Workflow Setup</li>
                                <li>✓ Executive Admin Support</li>
                            </ul>
                            <button className="btn-plan">Sign Up for starter</button>
                        </div>
                    </div>
                </div>
            </section>

            
            <footer className="footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-main">
                            <div className="footer-logo-section">
                                <div className="footer-logo">
                                    <img src="/images/hubly-logo.png" alt="Hubly" />
                                </div>
                            </div>

                            <div className="footer-links">
                                <div className="footer-col">
                                    <h4>Product</h4>
                                    <ul>
                                        <li><a href="#universal">Universal checkout</a></li>
                                        <li><a href="#payment">Payment workflows</a></li>
                                        <li><a href="#observability">Observability</a></li>
                                        <li><a href="#uplift">UpliftAI</a></li>
                                        <li><a href="#apps">Apps & integrations</a></li>
                                    </ul>
                                </div>

                                <div className="footer-col">
                                    <h4>Why Primer</h4>
                                    <ul>
                                        <li><a href="#markets">Expand to new markets</a></li>
                                        <li><a href="#success">Boost payment success</a></li>
                                        <li><a href="#conversion">Improve conversion rates</a></li>
                                        <li><a href="#fraud">Reduce payments fraud</a></li>
                                        <li><a href="#revenue">Recover revenue</a></li>
                                    </ul>
                                </div>

                                <div className="footer-col">
                                    <h4>Developers</h4>
                                    <ul>
                                        <li><a href="#docs">Primer Docs</a></li>
                                        <li><a href="#api">API Reference</a></li>
                                        <li><a href="#methods">Payment methods guide</a></li>
                                        <li><a href="#status">Service status</a></li>
                                        <li><a href="#community">Community</a></li>
                                    </ul>
                                </div>

                                <div className="footer-col">
                                    <h4>Resources</h4>
                                    <ul>
                                        <li><a href="#blog">Blog</a></li>
                                        <li><a href="#success">Success stories</a></li>
                                        <li><a href="#news">News room</a></li>
                                        <li><a href="#terms">Terms</a></li>
                                        <li><a href="#privacy">Privacy</a></li>
                                    </ul>
                                </div>

                                <div className="footer-col">
                                    <h4>Company</h4>
                                    <ul>
                                        <li><a href="#careers">Careers</a></li>
                                    </ul>
                                    <div className="footer-social">
                                        <a href="#email">✉</a>
                                        <a href="#linkedin">in</a>
                                        <a href="#twitter">🐦</a>
                                        <a href="#youtube">▶</a>
                                        <a href="#discord">💬</a>
                                        <a href="#podcast">🎙</a>
                                        <a href="#instagram">📷</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
            
            <ChatWidget />
        </div>
    );
};

export default LandingPage;