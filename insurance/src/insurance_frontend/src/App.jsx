import React, { useState, useEffect } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory } from '../../declarations/insurance_frontend';
import Header from './components/Header';
import LoginButton from './components/LoginButton';
import ClaimForm from './components/ClaimForm';
import ClaimList from './components/ClaimList';
import UserStats from './components/UserStats';

const App = () => {
  const [authClient, setAuthClient] = useState(null);
  const [actor, setActor] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [principal, setPrincipal] = useState(null);
  const [claims, setClaims] = useState([]);
  const [userStats, setUserStats] = useState(null);

  useEffect(() => {
    initializeAuthClient();
  }, []);

  const initializeAuthClient = async () => {
    const client = await AuthClient.create();
    setAuthClient(client);

    if (await client.isAuthenticated()) {
      handleAuthenticated(client);
    }
  };

  const login = async () => {
    await authClient.login({
      identityProvider: process.env.II_URL,
      onSuccess: () => {
        handleAuthenticated(authClient);
      },
    });
  };

  const handleAuthenticated = async (client) => {
    const identity = client.getIdentity();
    const agent = new HttpAgent({ identity });
    const newActor = Actor.createActor(idlFactory, {
      agent,
      canisterId: process.env.CANISTER_ID,
    });
    setActor(newActor);
    setIsAuthenticated(true);
    const userPrincipal = await newActor.getPrincipal();
    setPrincipal(userPrincipal.toString());
    fetchClaims(newActor, userPrincipal);
    fetchUserStats(newActor, userPrincipal);
  };

  const fetchClaims = async (actorInstance, userPrincipal) => {
    const claimIds = await actorInstance.getUserClaims(userPrincipal);
    const claimDetails = await Promise.all(
      claimIds.map((id) => actorInstance.getClaim(id))
    );
    setClaims(claimDetails.filter((claim) => claim !== null));
  };

  const fetchUserStats = async (actorInstance, userPrincipal) => {
    const stats = await actorInstance.getUserStats(userPrincipal);
    setUserStats(stats);
  };

  const submitClaim = async (description) => {
    await actor.submitClaim(description);
    fetchClaims(actor, principal);
    fetchUserStats(actor, principal);
  };

  const processClaim = async (claimId) => {
    await actor.processClaim(claimId);
    fetchClaims(actor, principal);
    fetchUserStats(actor, principal);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto p-4">
        {!isAuthenticated ? (
          <LoginButton onLogin={login} />
        ) : (
          <div className="space-y-6">
            <UserStats principal={principal} stats={userStats} />
            <ClaimForm onSubmit={submitClaim} />
            <ClaimList claims={claims} onProcess={processClaim} />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;