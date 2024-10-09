import Array "mo:base/Array";
import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Nat "mo:base/Nat";

actor UnderwritingSystem {

    // Types
    type UserId = Principal;
    type DocumentId = Text;

    type Document = {
        id: DocumentId;
        docType: DocumentType;
        content: Blob;
        timestamp: Int;
    };

    type DocumentType = {
        #FinancialAudit;
        #ScannedForm;
        #OperationLicense;
    };

    type UnderwritingStatus = {
        #Pending;
        #Approved;
        #Denied;
    };

    type UnderwritingResult = {
        status: UnderwritingStatus;
        quotation: ?Float;
        reason: ?Text;
    };

    // State
    private stable var nextDocId: Nat = 0;
    private let users = HashMap.HashMap<UserId, [DocumentId]>(0, Principal.equal, Principal.hash);
    private let documents = HashMap.HashMap<DocumentId, Document>(0, Text.equal, Text.hash);
    private let underwritingResults = HashMap.HashMap<UserId, UnderwritingResult>(0, Principal.equal, Principal.hash);

    // Helper functions
    private func generateDocId() : DocumentId {
        nextDocId += 1;
        Nat.toText(nextDocId)
    };

    // Main functions
    public shared(msg) func createAccount() : async Result.Result<(), Text> {
        let userId = msg.caller;
        switch (users.get(userId)) {
            case (?_) { #err("Account already exists") };
            case null {
                users.put(userId, []);
                #ok()
            };
        }
    };

    public shared(msg) func submitDocument(docType: DocumentType, content: Blob) : async Result.Result<DocumentId, Text> {
        let userId = msg.caller;
        switch (users.get(userId)) {
            case null { #err("User not found") };
            case (?userDocs) {
                let docId = generateDocId();
                let newDoc: Document = {
                    id = docId;
                    docType = docType;
                    content = content;
                    timestamp = Time.now();
                };
                documents.put(docId, newDoc);
                users.put(userId, Array.append(userDocs, [docId]));
                #ok(docId)
            };
        };
    };

    public shared(msg) func getDocuments() : async [Document] {
        let userId = msg.caller;
        switch (users.get(userId)) {
            case null { [] };
            case (?userDocs) {
                Array.mapFilter<DocumentId, Document>(userDocs, func (docId) {
                    documents.get(docId)
                })
            };
        };
    };

    public func processUnderwriting(userId: UserId) : async () {
        // This function would typically call out to an external AI service
        // For now, we'll implement a simple mock
        let result: UnderwritingResult = {
            status = #Approved;
            quotation = ?1000.00;
            reason = ?"All documents verified successfully";
        };
        underwritingResults.put(userId, result);
    };

    public shared(msg) func getUnderwritingResult() : async Result.Result<UnderwritingResult, Text> {
        let userId = msg.caller;
        switch (underwritingResults.get(userId)) {
            case null { #err("No underwriting result found") };
            case (?result) { #ok(result) };
        };
    };

    // Internet Identity integration
    public shared(msg) func whoami() : async Principal {
        msg.caller
    };
};