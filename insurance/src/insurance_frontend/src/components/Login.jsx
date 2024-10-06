import React from 'react';Actor
import { Actor, HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { ethers } from 'ethers';

// Function to log in using Plug Wallet
const loginWithPlugWallet = async () => {
    try {
      const wallet = await window?.plug?.requestConnect();
      const identity = wallet?.getIdentity();
      const agent = new HttpAgent({ identity });
      const actor = Actor.createActor(idlFactory, {
        agent,
        canisterId: process.env.INSURANCE_DAPP_BACKEND_CANISTER_ID,
      });
      const principal = await actor.getPrincipal();
      console.log('Logged in with Plug Wallet:', principal.toText());
      // Continue with app logic...
    } catch (error) {
      console.error('Plug Wallet login failed:', error);
    }
};

const loginWithInternetIdentity = async () => {
    const client = await AuthClient.create();
    await client.login({
      identityProvider: process.env.II_URL,
      onSuccess: async () => {
        const identity = client.getIdentity();
        const agent = new HttpAgent({ identity });
        const actor = Actor.createActor(idlFactory, {
          agent,
          canisterId: process.env.INSURANCE_DAPP_BACKEND_CANISTER_ID,
        });
        const principal = await actor.getPrincipal();
        console.log('Logged in with Internet Identity:', principal.toText());
        // Continue with app logic...
      },
    });
};

// Function to log in using MetaMask
const loginWithMetaMask = async () => {
  try {
    if (window.ethereum) {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      console.log('Logged in with MetaMask:', address);
      // Continue with app logic...
    } else {
      console.error('MetaMask is not installed');
    }
  } catch (error) {
    console.error('MetaMask login failed:', error);
  }
};
  
const LoginPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-2xl font-bold mb-4">Welcome to Insurance dApp</h1>
        <button onClick={loginWithPlugWallet} className="w-full bg-blue-500 text-white px-4 py-2 rounded mb-2 hover:bg-blue-600 transition">
          Login with Plug Wallet
        </button>
        <button onClick={loginWithInternetIdentity} className="w-full bg-green-500 text-white px-4 py-2 rounded mb-2 hover:bg-green-600 transition">
          Login with Internet Identity
        </button>
        <button onClick={loginWithMetaMask} className="w-full bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition">
          Login with MetaMask
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
