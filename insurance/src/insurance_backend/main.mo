import Array "mo:base/Array";
import HashMap "mo:base/HashMap";
import Hash "mo:base/Hash";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Text "mo:base/Text";

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
  };

  type User = {
    principal: Principal;
    claims: [Nat];
  };

  let claims = HashMap.HashMap<Nat, Claim>(0, Nat.equal, Hash.hash);
  let users = HashMap.HashMap<Principal, User>(0, Principal.equal, Principal.hash);
  var nextClaimId : Nat = 0;

  public shared(msg) func submitClaim(description: Text) : async Nat {
    let caller = msg.caller;
    let claimId = nextClaimId;
    nextClaimId += 1;

    let newClaim : Claim = {
      id = claimId;
      user = caller;
      description = description;
      status = #Submitted;
    };

    claims.put(claimId, newClaim);

    switch (users.get(caller)) {
      case (null) {
        users.put(caller, { principal = caller; claims = [claimId] });
      };
      case (?user) {
        let updatedClaims = Array.append<Nat>(user.claims, [claimId]);
        users.put(caller, { principal = caller; claims = updatedClaims });
      };
    };

    claimId
  };

  public query func getClaim(claimId: Nat) : async ?Claim {
    claims.get(claimId)
  };

  public query func getUserClaims(user: Principal) : async [Nat] {
    switch (users.get(user)) {
      case (null) { [] };
      case (?user) { user.claims };
    }
  };

  public shared(msg) func processClaim(claimId: Nat) : async Text {
    switch (claims.get(claimId)) {
      case (null) { "Claim not found" };
      case (?claim) {
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
        };

        claims.put(claimId, updatedClaim);
        aiResponse
      };
    }
  };

  public func simulateAiClaimProcessing(description: Text) : async Text {
    if (Text.contains(Text.toLowercase(description), #text "accident")) {
      "Claim approved based on initial AI assessment"
    } else {
      "Claim requires further review"
    }
  };

  public query(msg) func getPrincipal() : async Principal {
    msg.caller
  };
};