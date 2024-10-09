import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaUpload, FaFileAlt, FaCheckCircle, FaTimesCircle, FaSignOutAlt } from 'react-icons/fa';
import { useDropzone } from 'react-dropzone';
import { insurance_backend } from '../../../declarations/insurance_backend';
import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory } from '../../../declarations/insurance_backend';
import { useAuth } from './AuthContext';

const Dashboard = ({ actor, onLogout }) => {
  const [authenticatedActor, setAuthenticatedActor] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [docMap, setDocMap] = useState(new Map());
  const [underwritingResult, setUnderwritingResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  
  const { isAuthenticated, userId } = useAuth(); // Assuming userId comes from auth

  // Initialize the actor
  const createActor = async () => {
    const agent = new HttpAgent({ host: "https://ic0.app" });

    // For local development, fetch root key
    if (process.env.NODE_ENV === 'development') {
      agent.fetchRootKey();
    }

    // Create the actor with the insurance_backend canister ID
    const actor = Actor.createActor(idlFactory, {
      agent,
      canisterId: process.env.REACT_APP_INSURANCE_BACKEND_CANISTER_ID, // Use environment variable
    });

    return actor;
  };

  // Authenticate and create the actor
  const getAuthenticatedActor = async () => {
    try {
      const actor = await createActor();
      if (actor) {
        setAuthenticatedActor(actor);
        return actor; // Return actor for immediate use
      } else {
        console.error("Actor creation failed.");
      }
    } catch (error) {
      console.error("Error creating actor:", error);
    }
  };

  // Fetch documents
  const fetchDocuments = async () => {
    if (!authenticatedActor) return;
    try {
      const fetchedDocs = await authenticatedActor.getDocuments(userId);
      setDocuments(fetchedDocs);

      // Create a map of document IDs to document data
      const fileMap = new Map(fetchedDocs.map(doc => [doc.id, doc.docData]));
      setDocMap(fileMap);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  // Fetch underwriting result
  const fetchUnderwritingResult = async () => {
    if (!authenticatedActor) return;
    try {
      const result = await authenticatedActor.getUnderwritingResult();
      if (result.ok) {
        setUnderwritingResult(result.ok);
      }
    } catch (error) {
      console.error("Error fetching underwriting result:", error);
    }
  };

  // Process underwriting
  const processUnderwriting = async () => {
    if (!authenticatedActor) return;
    setIsLoading(true);
    try {
      await authenticatedActor.processUnderwriting();
      await fetchUnderwritingResult();
    } catch (error) {
      console.error("Error processing underwriting:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger actor setup on mount and after authentication
  useEffect(() => {
    if (isAuthenticated) {
      getAuthenticatedActor();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (authenticatedActor) {
      fetchDocuments();
    }
  }, [authenticatedActor]);

  useEffect(() => {
    // Simulate fetching data or handling errors
    const fetchErrors = async () => {
      try {
        // Your logic to fetch data
        // Simulate an error response
        const responseErrors = [
          { message: "Error 1: Something went wrong" },
          { message: "Error 2: Unable to fetch data" }
        ];
        setErrors(responseErrors); // Set errors from the response
      } catch (e) {
        setErrors([{ message: "An unexpected error occurred." }]);
      }
    };
    fetchErrors();
  }, []);

  const Dropzone = ({ docType }) => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop: (acceptedFiles) => onDrop(acceptedFiles, { name: docType }),
    });

    return (
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-4 cursor-pointer transition duration-300 ${isDragActive ? 'bg-blue-50 border-blue-300' : 'border-gray-300 hover:border-blue-300'}`}
      >
        <input {...getInputProps({ name: docType })} />
        {uploadedFiles[docType] ? (
          <div className="flex justify-between items-center">
            <span className="text-sm truncate">{uploadedFiles[docType].name}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setUploadedFiles((prev) => ({ ...prev, [docType]: null }));
              }}
              className="ml-2 text-red-500 hover:text-red-700 transition duration-300"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="text-center">
            <FaUpload className="mx-auto text-3xl text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">Drag &amp; drop or click to select a file</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200">
      <nav className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <img className="h-8 w-auto" src="/icon.webp" alt="Logo" />
              <div className="ml-6 flex space-x-8">
                <Link to="/dashboard" className="text-white hover:bg-purple-700 px-3 py-2 rounded-md text-sm font-medium">Dashboard</Link>
                <Link to="/profile" className="text-white hover:bg-purple-700 px-3 py-2 rounded-md text-sm font-medium">Profile</Link>
              </div>
            </div>
            <div className="flex items-center">
              <button onClick={onLogout} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md">
                <FaSignOutAlt className="inline-block mr-2" /> Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Document Upload Section */}
        <motion.div className="bg-white rounded-lg shadow-lg p-8 mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2 className="text-3xl font-semibold mb-6">Upload Documents</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['FinancialAudit', 'ScannedForm', 'OperationLicense'].map((docType) => (
              <div key={docType} className="space-y-2">
                <label className="block text-md font-medium text-gray-700">{docType.replace(/([A-Z])/g, ' $1').trim()}</label>
                <Dropzone docType={docType} />
                {errors && errors.length > 0 && errors.map((error, index) => ( <p key={index} className="text-red-500 text-xs mt-1">{error.message}</p>))}
                <button
                  onClick={() => handleFileUpload(docType)}
                  disabled={isLoading || !uploadedFiles[docType]}
                  className="w-full mt-3 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition"
                >
                  Upload {docType.replace(/([A-Z])/g, ' $1').trim()}
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Uploaded Documents Section */}
        <motion.div className="bg-white rounded-lg shadow-lg p-8 mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <h2 className="text-3xl font-semibold mb-6">Uploaded Documents</h2>
          <ul className="space-y-4">
            {documents.map((doc) => (
              <motion.li key={doc.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center text-gray-700">
                <FaFileAlt className="mr-3 text-blue-500" />
                <span>{doc.name} - {new Date(doc.timestamp / 1000000).toLocaleString()}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Underwriting Result Section */}
        <motion.div className="bg-white rounded-lg shadow-lg p-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <h2 className="text-3xl font-semibold mb-6">Underwriting Result</h2>
          {underwritingResult ? (
            <div className="text-lg text-gray-800">
              <p>Status: {underwritingResult.status}</p>
              <p>Quotation: ${underwritingResult.quotation}</p>
              <p>Comments: {underwritingResult.comments || 'N/A'}</p>
            </div>
          ) : (
            <p className="text-gray-500">No underwriting result available.</p>
          )}
          <button
            onClick={processUnderwriting}
            disabled={isLoading}
            className="mt-4 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition"
          >
            {isLoading ? 'Processing...' : 'Process Underwriting'}
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
