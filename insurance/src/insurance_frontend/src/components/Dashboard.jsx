import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaUpload, FaFileAlt, FaCheckCircle, FaTimesCircle, FaUser, FaWallet } from 'react-icons/fa';
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

  const onDrop = useCallback((acceptedFiles, fileRejections, event) => {
    const fileType = event.target.name;
    if (acceptedFiles.length > 0) {
      setUploadedFiles(prevFiles => ({ ...prevFiles, [fileType]: acceptedFiles[0] }));
      setErrors(prevErrors => ({ ...prevErrors, [fileType]: null }));
    }
  }, []);

  const handleFileUpload = async (docType) => {
    setIsLoading(true);
    const file = uploadedFiles[docType];
    if (!file) {
      setErrors(prevErrors => ({ ...prevErrors, [docType]: 'File is required' }));
      setIsLoading(false);
      return;
    }

    const reader = new FileReader();

    reader.onloadend = async () => {
      const content = new Uint8Array(reader.result);
      try {
        await actor.submitDocument({ [docType]: null }, content);
        await fetchDocuments();
        setIsLoading(false);
      } catch (error) {
        console.error('Error uploading document:', error);
        setErrors(prevErrors => ({ ...prevErrors, [docType]: 'Error uploading document' }));
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
      setIsLoading(false);
    } catch (error) {
      console.error('Error processing underwriting:', error);
      setIsLoading(false);
    }
  };

  const Dropzone = ({ docType }) => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop: (acceptedFiles) => onDrop(acceptedFiles, [], { target: { name: docType } }),
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
                setUploadedFiles((prevFiles) => ({ ...prevFiles, [docType]: null }));
              }}
              className="ml-2 text-red-500 hover:text-red-700 transition duration-300"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="text-center">
            <FaUpload className="mx-auto text-3xl text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">
              Drag &amp; drop or click to select a file
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <img className="h-8 w-auto" src="/logo.png" alt="Logo" />
              </div>
              <div className="ml-6 flex space-x-8">
                <Link to="/dashboard" className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-blue-500 text-sm font-medium">
                  Dashboard
                </Link>
                <Link to="/profile" className="text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium">
                  Profile
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <button onClick={onLogout} className="ml-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-300">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-md p-6 mb-8"
        >
          <h2 className="text-2xl font-semibold mb-4">Upload Documents</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['FinancialAudit', 'ScannedForm', 'OperationLicense'].map((docType) => (
              <div key={docType} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {docType.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <Dropzone docType={docType} />
                {errors[docType] && (
                  <p className="text-red-500 text-xs">{errors[docType]}</p>
                )}
                <button
                  onClick={() => handleFileUpload(docType)}
                  disabled={isLoading || !uploadedFiles[docType]}
                  className="w-full mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 disabled:opacity-50"
                >
                  Upload {docType.replace(/([A-Z])/g, ' $1').trim()}
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-lg shadow-md p-6 mb-8"
        >
          <h2 className="text-2xl font-semibold mb-4">Uploaded Documents</h2>
          <ul className="space-y-2">
            {documents.map((doc, index) => (
              <motion.li
                key={doc.id}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center text-gray-700"
              >
                <FaFileAlt className="mr-2 text-blue-500" />
                <span>{doc.docType} - {new Date(doc.timestamp / 1000000).toLocaleString()}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <h2 className="text-2xl font-semibold mb-4">Underwriting Result</h2>
          {underwritingResult ? (
            <div className="space-y-2">
              <p className="flex items-center">
                Status:{' '}
                {underwritingResult.status === 'Approved' ? (
                  <span className="ml-2 flex items-center text-green-500">
                    <FaCheckCircle className="mr-1" /> Approved
                  </span>
                ) : (
                  <span className="ml-2 flex items-center text-red-500">
                    <FaTimesCircle className="mr-1" /> Denied
                  </span>
                )}
              </p>
              {underwritingResult.quotation && (
                <p>Quotation: ${underwritingResult.quotation.toFixed(2)}</p>
              )}
              {underwritingResult.reason && <p>Reason: {underwritingResult.reason}</p>}
            </div>
          ) : (
            <p className="text-gray-600">No underwriting result available</p>
          )}
          <button
            onClick={processUnderwriting}
            disabled={isLoading}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Process Underwriting'}
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;