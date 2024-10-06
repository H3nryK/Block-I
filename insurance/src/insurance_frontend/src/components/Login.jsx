import React from 'react';
import { Actor, HttpAgent } from '@dfinity/agent';
import { ethers } from 'ethers';
import { idlFactory } from '../../../declarations/insurance_frontend'; // Import your idlFactory here
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

// Function to log in using Plug Wallet
const loginWithPlugWallet = async () => {
  try {
    const wallet = await window.plug.requestConnect();
    const identity = wallet.getIdentity();
    const agent = new HttpAgent({ identity });
    const actor = Actor.createActor(idlFactory, {
      agent,
      canisterId: process.env.INSURANCE_DAPP_BACKEND_CANISTER_ID,
    });
    const principal = await actor.getPrincipal();
    console.log('Logged in with Plug Wallet:', principal.toText());
    // Redirect to dashboard after successful login
    navigate('/dashboard'); // Navigate to dashboard after login
  } catch (error) {
    console.error('Plug Wallet login failed:', error);
  }
};

// Function to log in using Internet Identity
// const loginWithInternetIdentity = async (navigate) => {
//     try {
//       const client = await AuthClient.create();
//       await client.login({
//         identityProvider: process.env.REACT_APP_II_URL, // Ensure this is set correctly
//         onSuccess: async () => {
//           const identity = client.getIdentity();
//           const agent = new HttpAgent({ identity });
//           const actor = Actor.createActor(idlFactory, {
//             agent,
//             canisterId: process.env.REACT_APP_INSURANCE_DAPP_BACKEND_CANISTER_ID, // Updated variable name
//           });
//           const principal = await actor.getPrincipal();
//           console.log('Logged in with Internet Identity:', principal.toText());
  
//           // Redirect to dashboard after successful login
//           navigate('/dashboard'); // Use navigate function to redirect
//         },
//         onError: (error) => {
//           console.error('Internet Identity login error:', error);
//         },
//       });
//     } catch (error) {
//       console.error('Error initializing AuthClient or during login:', error);
//     }
// };  

// Function to log in using MetaMask
const loginWithMetaMask = async () => {
  try {
    if (window.ethereum) {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      console.log('Logged in with MetaMask:', address);
      // Redirect to dashboard after successful login
      navigate('/dashboard'); // Navigate to dashboard after login
    } else {
      console.error('MetaMask is not installed');
    }
  } catch (error) {
    console.error('MetaMask login failed:', error);
  }
};

const LoginPage = () => {
  const navigate = useNavigate();
  const authClient = useAuth();

  const handleSignin = async (event) => {
    event.preventDefault();

    if (authClient) {
        try {
            let identityProvider = 'https://identity.ic0.app';
            authClient.login({
                identityProvider,
                onSuccess: async () => {
                    console.log("Logged In!");

                    const identity = authClient.getIdentity();
                    console.log(identity.getPrincipal().toText());
                    window.location.href = './dashboard';
                },
                onError: (error) => {
                    console.error("Login failed:", error);
                },
            });
        } catch (error) {
            console.error("AuthClient login failed:", error);
        }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-opacity-80 bg-gray-200 p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-2xl font-bold mb-4">Welcome to Insurance dApp</h1>
        <div className="flex justify-between">
          <button onClick={() => loginWithPlugWallet(navigate)} className="bg-blue-500 text-white px-4 py-2 rounded mb-2 hover:bg-blue-600 transition">
            Login with Plug Wallet
          </button>
          <button onClick={(event) => handleSignin(event)} className="bg-green-500 text-white px-4 py-2 rounded mb-2 hover:bg-green-600 transition">
            Login with Internet Identity
          </button>
          <button onClick={() => loginWithMetaMask(navigate)} className="bg-orange-500 text-white px-4 py-2 rounded mb-2 hover:bg-orange-600 transition">
            Login with MetaMask
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
