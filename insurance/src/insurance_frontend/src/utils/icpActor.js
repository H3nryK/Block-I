import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory as claimIdlFactory } from "../../../declarations/insurance_backend"; // Import IDL for claims actor

export const createActor = (identity) => {
  const agent = new HttpAgent({ identity });

  // In development environments, fetch root key (only for local deployments)
  if (process.env.NODE_ENV !== 'production') {
    agent.fetchRootKey();
  }

  // Create the actor using the IDL and agent
  const actor = Actor.createActor(claimIdlFactory, {
    agent,
    canisterId: "bkyz2-fmaaa-aaaaa-qaaaq-cai", // Replace with actual canister ID
  });

  return actor;
};
