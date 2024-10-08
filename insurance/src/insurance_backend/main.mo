import Array "mo:base/Array";
import HashMap "mo:base/HashMap";
import Hash "mo:base/Hash";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Time "mo:base/Time";

actor {
  type ClaimStatus = {
    #Submitted;
    #UnderReview;
    #Approved;
    #Rejected;
  };

  type Claim = {
    id: Nat;
    user: Principal;
    description: Text;
    status: ClaimStatus;
    submissionTime: Time.Time;
    processingTime: ?Time.Time;
  };

  type User = {
    principal: Principal;
    claims: [Nat];
    totalApprovedClaims: Nat;
  };

  private let claims = HashMap.HashMap<Nat, Claim>(0, Nat.equal, Hash.hash);
  private let users = HashMap.HashMap<Principal, User>(0, Principal.equal, Principal.hash);
  private var nextClaimId : Nat = 0;

  // Function to submit a new claim
  public shared(msg) func submitClaim(description: Text) : async Nat {
    let caller = msg.caller;
    let claimId = nextClaimId;
    nextClaimId += 1;

    let newClaim : Claim = {
      id = claimId;
      user = caller;
      description = description;
      status = #Submitted;
      submissionTime = Time.now();
      processingTime = null;
    };

    claims.put(claimId, newClaim);

    switch (users.get(caller)) {
      case (null) {
        users.put(caller, { principal = caller; claims = [claimId]; totalApprovedClaims = 0 });
      };
      case (?user) {
        let updatedClaims = Array.append<Nat>(user.claims, [claimId]);
        users.put(caller, { principal = caller; claims = updatedClaims; totalApprovedClaims = user.totalApprovedClaims });
      };
    };

    claimId
  };

  // Function to get a specific claim
  public query func getClaim(claimId: Nat) : async ?Claim {
    claims.get(claimId)
  };

  // Function to get all claims for a user
  public query func getUserClaims(user: Principal) : async [Nat] {
    switch (users.get(user)) {
      case (null) { [] };
      case (?user) { user.claims };
    }
  };

  // Function to process a claim
  public shared(msg) func processClaim(claimId: Nat) : async Text {
    switch (claims.get(claimId)) {
      case (null) { "Claim not found" };
      case (?claim) {
        if (claim.status != #Submitted) {
          return "Claim has already been processed";
        };

        let aiResponse = await simulateAiClaimProcessing(claim.description);
        let updatedStatus = if (Text.contains(aiResponse, #text "approved")) {
          #Approved
        } else {
          #Rejected
        };

        let updatedClaim : Claim = {
          id = claim.id;
          user = claim.user;
          description = claim.description;
          status = updatedStatus;
          submissionTime = claim.submissionTime;
          processingTime = ?Time.now();
        };

        claims.put(claimId, updatedClaim);

        if (updatedStatus == #Approved) {
          switch (users.get(claim.user)) {
            case (?user) {
              users.put(claim.user, {
                principal = user.principal;
                claims = user.claims;
                totalApprovedClaims = user.totalApprovedClaims + 1;
              });
            };
            case (null) {
              // This shouldn't happen, but we handle it just in case
            };
          };
        };

        aiResponse
      };
    }
  };

  // Simulated AI claim processing
  public func simulateAiClaimProcessing(description: Text) : async Text {
    if (Text.contains(Text.toLowercase(description), #text "accident")) {
      "Claim approved based on initial AI assessment"
    } else {
      "Claim requires further review"
    }
  };

  // Function to get the caller's principal
  public query(msg) func getPrincipal() : async Principal {
    msg.caller
  };

  // New function to get user statistics
  public query func getUserStats(user: Principal) : async ?{totalClaims: Nat; approvedClaims: Nat} {
    switch (users.get(user)) {
      case (null) { null };
      case (?user) {
        ?{
          totalClaims = user.claims.size();
          approvedClaims = user.totalApprovedClaims;
        }
      };
    }
  };

  // New function to get all claims (admin only)
  public shared(msg) func getAllClaims() : async [Claim] {
    // In a real system, you'd want to check if msg.caller is an admin
    Iter.toArray(claims.vals())
  };
}