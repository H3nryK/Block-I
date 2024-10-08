import React, { createContext, useContext, useState } from 'react';
import { HttpAgent } from '@dfinity/agent';
import { InternetIdentity } from '@dfinity/identity';

// Create a context for managing identity
const IdentityContext = createContext();

// Custom hook to use the IdentityContext
export const useIdentity = () => {
  return useContext(IdentityContext);
};

// Identity Provider component
export const IdentityProvider = ({ children }) => {
  const [identity, setIdentity] = useState(null);
  const agent = new HttpAgent();

  const login = async () => {
    const identity = await InternetIdentity.create();
    setIdentity(identity);
    // Optionally: Save identity to local storage or perform further actions
  };

  const logout = () => {
    setIdentity(null);
    // Optionally: Remove identity from local storage or perform cleanup actions
  };

  return (
    <IdentityContext.Provider value={{ identity, login, logout }}>
      {children}
    </IdentityContext.Provider>
  );
};
