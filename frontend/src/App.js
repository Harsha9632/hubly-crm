import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ChatCenter from './pages/ChatCenter';
import Analytics from './pages/Analytics';
import ChatbotCustomization from './pages/ChatbotCustomization';
import Team from './pages/Team';
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/chat-center" element={<ChatCenter />} />
        <Route path="/admin/analytics" element={<Analytics />} />
        <Route path="/admin/chatbot" element={<ChatbotCustomization />} />
        <Route path="/admin/teams" element={<Team />} />
        <Route path="/admin/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
}

export default App;