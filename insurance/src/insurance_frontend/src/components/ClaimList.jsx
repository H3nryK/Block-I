import React, { useState, useEffect } from 'react';
import { createActor } from '../utils/icpActor';
import ProcessClaim from './ProcessClaim'; // Import ProcessClaim component

const ClaimList = ({ identity }) => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false); // We'll assume you'll implement admin logic

  // Fetch user claims from the ICP backend
  const fetchClaims = async () => {
    try {
      const actor = createActor(identity);
      const userClaims = await actor.getUserClaims(identity.getPrincipal().toText());
      setClaims(userClaims);

      // Assuming you have an admin check function in the backend
      const adminStatus = await actor.isAdmin(identity.getPrincipal().toText());
      setIsAdmin(adminStatus);
    } catch (error) {
      setError('Error fetching claims: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [identity]);

  if (loading) {
    return <p className="text-center mt-4">Loading claims...</p>;
  }

  if (error) {
    return <p className="text-red-500 text-center mt-4">{error}</p>;
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <h2 className="text-xl font-semibold text-center mb-4">Your Claims</h2>
      <ul>
        {claims.map((claim) => (
          <li key={claim.id} className="bg-white p-4 mb-4 shadow-md rounded-md">
            <p><strong>Description:</strong> {claim.description}</p>
            <p><strong>Status:</strong> {claim.status}</p>
            <p><strong>Submitted On:</strong> {new Date(claim.submissionTime).toLocaleString()}</p>
            {claim.processingTime && (
              <p><strong>Processed On:</strong> {new Date(claim.processingTime).toLocaleString()}</p>
            )}
            {/* Only show process button if the user is an admin */}
            {isAdmin && claim.status === 'Submitted' && (
              <ProcessClaim claimId={claim.id} identity={identity} />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ClaimList;
