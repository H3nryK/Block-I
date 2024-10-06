import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthClient } from '@dfinity/auth-client';
import { Actor, HttpAgent } from '@dfinity/agent';

import { idlFactory } from '../../declarations/insurance_frontend';

const InsuranceApp = () => {
  const [authClient, setAuthClient] = useState(null);
  const [actor, setActor] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [principal, setPrincipal] = useState(null);
  const [claimDescription, setClaimDescription] = useState('');
  const [claims, setClaims] = useState([]);

  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    const client = await AuthClient.create();
    setAuthClient(client);

    if (await client.isAuthenticated()) {
      handleAuthenticated(client);
    }
  };

  const handleAuthenticated = async (client) => {
    const identity = client.getIdentity();
    const agent = new HttpAgent({ identity });
    const backendActor = Actor.createActor(idlFactory, {
      agent,
      canisterId: process.env.INSURANCE_DAPP_BACKEND_CANISTER_ID,
    });
    setActor(backendActor);
    const principal = await backendActor.getPrincipal();
    setPrincipal(principal.toText());
    setIsAuthenticated(true);
    fetchClaims();
  };

  const login = async () => {
    await authClient.login({
      identityProvider: process.env.II_URL,
      onSuccess: () => handleAuthenticated(authClient),
    });
  };

  const submitClaim = async () => {
    if (actor && claimDescription) {
      try {
        const claimId = await actor.submitClaim(claimDescription);
        console.log('Claim submitted with ID:', claimId);
        setClaimDescription('');
        fetchClaims();
      } catch (error) {
        console.error('Error submitting claim:', error);
      }
    }
  };

  const fetchClaims = async () => {
    if (actor && principal) {
      try {
        const userClaims = await actor.getUserClaims(principal);
        const claimDetails = await Promise.all(
          userClaims.map(async (claimId) => {
            const claim = await actor.getClaim(claimId);
            return { id: claimId, ...claim[0] };
          })
        );
        setClaims(claimDetails);
      } catch (error) {
        console.error('Error fetching claims:', error);
      }
    }
  };

  const processClaim = async (claimId) => {
    if (actor) {
      try {
        const result = await actor.processClaim(claimId);
        console.log('Claim processed:', result);
        fetchClaims();
      } catch (error) {
        console.error('Error processing claim:', error);
      }
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Insurance dApp</h1>
      {!isAuthenticated ? (
        <button onClick={login} className="bg-blue-500 text-white px-4 py-2 rounded">
          Login with Internet Identity
        </button>
      ) : (
        <div>
          <p className="mb-4">Logged in as: {principal}</p>
          <h2 className="text-xl font-semibold mb-2">Submit a Claim</h2>
          <textarea
            value={claimDescription}
            onChange={(e) => setClaimDescription(e.target.value)}
            className="w-full p-2 border rounded mb-2"
            placeholder="Describe your claim..."
          />
          <button onClick={submitClaim} className="bg-green-500 text-white px-4 py-2 rounded">
            Submit Claim
          </button>
          <h2 className="text-xl font-semibold mt-4 mb-2">Your Claims</h2>
          <ul>
            {claims.map((claim) => (
              <li key={claim.id} className="mb-2">
                Claim ID: {claim.id.toString()}, Status: {Object.keys(claim.status)[0]}
                {claim.status.Submitted && (
                  <button
                    onClick={() => processClaim(claim.id)}
                    className="ml-2 bg-yellow-500 text-white px-2 py-1 rounded text-sm"
                  >
                    Process Claim
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};


export default InsuranceApp;