import React from 'react';
import { AuthProvider } from './components/AuthContext';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';

const App = () => {

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Routes>
            <Route path="/" element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage onLogin={login} />
            } />
            <Route path="/dashboard" element={
              isAuthenticated ? <Dashboard actor={actor} onLogout={logout} /> : <Navigate to="/" replace />
            } />
            <Route path="/profile" element={
              isAuthenticated ? <Profile actor={actor} onLogout={logout} /> : <Navigate to="/" replace />
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;