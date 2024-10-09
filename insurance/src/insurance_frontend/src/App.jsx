import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthClient } from '@dfinity/auth-client';
import { HttpAgent } from '@dfinity/agent';
import { canisterId, createActor } from '../../declarations/insurance_backend';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import Preloader from './components/Preloader';
import Profile from './components/Profile';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authClient, setAuthClient] = useState(null);
  const [actor, setActor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const client = await AuthClient.create();
      const isLoggedIn = await client.isAuthenticated();

      setAuthClient(client);
      setIsAuthenticated(isLoggedIn);

      if (isLoggedIn) {
        initActor(client);
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  const initActor = async (client) => {
    const identity = client.getIdentity();
    const agent = new HttpAgent({ identity });
    const newActor = createActor(canisterId, { agent });
    setActor(newActor);
  };

  const login = async () => {
    if (authClient) {
      await authClient.login({
        identityProvider: 'https://identity.ic0.app',
        onSuccess: () => {
          setIsAuthenticated(true);
          initActor(authClient);
        },
      });
    }
  };

  const logout = async () => {
    if (authClient) {
      await authClient.logout();
      setIsAuthenticated(false);
      setActor(null);
    }
  };

  if (isLoading) {
    return <Preloader />;
  }

  return (
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
  );
};

export default App;