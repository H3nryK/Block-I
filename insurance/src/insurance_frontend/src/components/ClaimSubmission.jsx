// components/ClaimSubmission.js
import React, { useState } from 'react';

const ClaimSubmission = ({ actor, principal }) => {
  const [claimDescription, setClaimDescription] = useState('');

  const submitClaim = async () => {
    try {
      const claimId = await actor.submitClaim(claimDescription);
      console.log('Claim submitted with ID:', claimId);
      setClaimDescription('');
      // Optionally, redirect to dashboard or show success message
    } catch (error) {
      console.error('Error submitting claim:', error);
    }
  };

  return (
    <div className="claim-submission">
      <h1>Submit a Claim</h1>
      <textarea
        value={claimDescription}
        onChange={(e) => setClaimDescription(e.target.value)}
        className="w-full p-2 border rounded mb-2"
        placeholder="Describe your claim..."
      />
      <button 
        onClick={submitClaim} 
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Submit Claim
      </button>
    </div>
  );
};

export default ClaimSubmission;
