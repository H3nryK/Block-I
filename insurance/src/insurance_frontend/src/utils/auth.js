import { HttpAgent } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";

// Function to authenticate with Internet Identity
export const authenticateUser = async () => {
  const authClient = await AuthClient.create();

  return new Promise((resolve, reject) => {
    authClient.login({
      identityProvider: "https://identity.ic0.app/",
      onSuccess: () => {
        const identity = authClient.getIdentity();
        resolve(identity);
      },
      onError: reject,
    });
  });
};

// Function to create an agent with the authenticated user's identity
export const createAgent = async (identity) => {
  const agent = new HttpAgent({ identity });
  // Optionally, point to the boundary node to ensure connection with the network
  agent.fetchRootKey(); // Only in development environments, remove in production
  return agent;
};
