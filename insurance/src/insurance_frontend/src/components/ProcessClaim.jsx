import React, { useState } from 'react';
import { createActor } from '../utils/icpActor';

const ProcessClaim = ({ claimId, identity }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  const handleProcess = async () => {
    setLoading(true);
    setError(null);

    try {
      const actor = createActor(identity); // Create the ICP actor
      const result = await actor.processClaim(claimId); // Process the claim using ICP backend
      setStatus(result);
    } catch (error) {
      setError('Error processing claim: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-md mt-4">
      {status && (
        <p className="text-green-500 text-center mb-2">Claim processed: {status}</p>
      )}
      {error && <p className="text-red-500 text-center mb-2">{error}</p>}
      <button
        onClick={handleProcess}
        className="bg-blue-500 text-white p-2 rounded-md w-full"
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Process Claim'}
      </button>
    </div>
  );
};

export default ProcessClaim;
