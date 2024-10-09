// AuthContext.jsx
import { useState, useEffect } from 'react';
import { AuthClient } from '@dfinity/auth-client';


export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userId, setUserId] = useState(null);
  
    useEffect(() => {
      // Assuming your authentication method uses authClient
      const initAuth = async () => {
        const isLoggedIn = await AuthClient.isAuthenticated();
        setIsAuthenticated(isLoggedIn);
        
        if (isLoggedIn) {
          const identity = authClient.getIdentity();
          setUserId(identity.getPrincipal().toText()); // Assuming userId is the principal
        }
      };
      initAuth();
    }, []);
  
    return { isAuthenticated, userId };
};
