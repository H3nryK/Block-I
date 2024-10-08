import React, { useState } from 'react';
import { createActor } from '../utils/icpActor'; // Import ICP actor creation utility

const SubmitClaimForm = ({ identity }) => {
  const [description, setDescription] = useState('');
  const [claimId, setClaimId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Get the actor to call the backend method
      const actor = createActor(identity);
      const claimId = await actor.submitClaim(description); // Call the ICP actor's submitClaim method
      setClaimId(claimId);
    } catch (error) {
      setError('Failed to submit claim: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 shadow-md rounded-md mt-8">
      <h2 className="text-xl font-semibold text-center mb-4">Submit a New Claim</h2>
      {claimId && (
        <div className="text-green-500 text-center mb-4">
          Claim Submitted Successfully! Your Claim ID is {claimId}.
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Claim Description
          </label>
          <textarea
            className="w-full p-2 border border-gray-300 rounded-md"
            rows={4}
            placeholder="Describe your claim..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>
        </div>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Claim'}
        </button>
      </form>
    </div>
  );
};

export default SubmitClaimForm;
