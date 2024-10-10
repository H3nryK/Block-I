import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUpload } from 'react-icons/fa';
import Navbar from './Navbar';
import Footer from './Footer';
import Preloader from './Preloader';
import { insurance_backend } from '../../../declarations/insurance_backend';

const Dashboard = ({ onLogout }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [financialAudit, setFinancialAudit] = useState(null);
  const [filledForm, setFilledForm] = useState(null);
  const [underwritingResult, setUnderwritingResult] = useState(null);

  const handleFileUpload = (event, setFile) => {
    const file = event.target.files[0];
    setFile(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      // Here you would typically upload the files to your backend
      // For this example, we'll simulate a backend call
      const result = await insurance_backend.processQuotation(financialAudit, filledForm);
      setUnderwritingResult(result);
    } catch (error) {
      console.error("Error processing quotation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar onLogout={onLogout} />
      {isLoading && <Preloader />}
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white shadow-lg rounded-lg p-6"
          >
            <h2 className="text-2xl font-semibold mb-4">Upload Documents</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Financial Audit</label>
                <input
                  type="file"
                  onChange={(e) => handleFileUpload(e, setFinancialAudit)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Filled Form</label>
                <input
                  type="file"
                  onChange={(e) => handleFileUpload(e, setFilledForm)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={!financialAudit || !filledForm || isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isLoading ? 'Processing...' : 'Submit for Quotation'}
              </button>
            </form>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white shadow-lg rounded-lg p-6"
          >
            <h2 className="text-2xl font-semibold mb-4">Quotation Result</h2>
            {underwritingResult ? (
              <div>
                <p><strong>Status:</strong> {underwritingResult.status}</p>
                <p><strong>Quotation:</strong> ${underwritingResult.quotation}</p>
                <p><strong>Comments:</strong> {underwritingResult.comments || 'N/A'}</p>
              </div>
            ) : (
              <p className="text-gray-500">No quotation result available. Please submit documents for processing.</p>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;