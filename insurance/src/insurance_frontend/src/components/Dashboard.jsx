import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaUpload, FaFileAlt, FaCheckCircle, FaTimesCircle, FaSignOutAlt } from 'react-icons/fa';
import { useDropzone } from 'react-dropzone';

const Dashboard = ({ actor, onLogout }) => {
  const [documents, setDocuments] = useState([]);
  const [underwritingResult, setUnderwritingResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchDocuments();
    fetchUnderwritingResult();
  }, []);

  const fetchDocuments = async () => {
    try {
      const docs = await actor.getDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const fetchUnderwritingResult = async () => {
    try {
      const result = await actor.getUnderwritingResult();
      if (result.ok) {
        setUnderwritingResult(result.ok);
      }
    } catch (error) {
      console.error('Error fetching underwriting result:', error);
    }
  };

  const onDrop = useCallback((acceptedFiles, { name }) => {
    if (acceptedFiles.length > 0) {
      setUploadedFiles(prev => ({ ...prev, [name]: acceptedFiles[0] }));
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  }, []);

  const handleFileUpload = async (docType) => {
    setIsLoading(true);
    const file = uploadedFiles[docType];
    if (!file) {
      setErrors(prev => ({ ...prev, [docType]: 'File is required' }));
      setIsLoading(false);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const content = new Uint8Array(reader.result);
      try {
        await actor.submitDocument({ [docType]: null }, content);
        await fetchDocuments();
      } catch (error) {
        console.error('Error uploading document:', error);
        setErrors(prev => ({ ...prev, [docType]: 'Error uploading document' }));
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const processUnderwriting = async () => {
    setIsLoading(true);
    try {
      await actor.processUnderwriting();
      await fetchUnderwritingResult();
    } catch (error) {
      console.error('Error processing underwriting:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const Dropzone = ({ docType }) => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop: (acceptedFiles) => onDrop(acceptedFiles, { name: docType }),
    });

    return (
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-4 cursor-pointer transition duration-300 ${
          isDragActive ? 'bg-blue-50 border-blue-300' : 'border-gray-300 hover:border-blue-300'
        }`}
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
                <Link to="/dashboard" className="text-white hover:bg-purple-700 px-3 py-2 rounded-md text-sm font-medium">
                  Dashboard
                </Link>
                <Link to="/profile" className="text-white hover:bg-purple-700 px-3 py-2 rounded-md text-sm font-medium">
                  Profile
                </Link>
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
                {errors[docType] && <p className="text-red-500 text-xs mt-1">{errors[docType]}</p>}
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
            {documents.map((doc, index) => (
              <motion.li key={doc.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center text-gray-700">
                <FaFileAlt className="mr-3 text-blue-500" />
                <span>{doc.docType} - {new Date(doc.timestamp / 1000000).toLocaleString()}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Underwriting Result Section */}
        <motion.div className="bg-white rounded-lg shadow-lg p-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <h2 className="text-3xl font-semibold mb-6">Underwriting Result</h2>
          {underwritingResult ? (
            <div className="flex items-center text-green-500">
              <FaCheckCircle className="mr-3" />
              <p className="text-lg">{underwritingResult.message}</p>
            </div>
          ) : (
            <div className="flex items-center text-red-500">
              <FaTimesCircle className="mr-3" />
              <p className="text-lg">No result available.</p>
            </div>
          )}
          <button
            onClick={processUnderwriting}
            disabled={isLoading}
            className="mt-6 w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition"
          >
            Process Underwriting
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
