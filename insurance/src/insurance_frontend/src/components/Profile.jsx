import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaUser, FaWallet, FaPlug, FaEthereum, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const Profile = ({ actor, onLogout }) => {
  const [connectedWallets, setConnectedWallets] = useState([]);
  const [userInfo, setUserInfo] = useState({});
  const [rejectedQuotations, setRejectedQuotations] = useState([]);
  const [givenQuotations, setGivenQuotations] = useState([]);

  useEffect(() => {
    fetchUserInfo();
    fetchQuotations();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const info = await actor.getUserInfo();
      setUserInfo(info);
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const fetchQuotations = async () => {
    try {
      const rejected = await actor.getRejectedQuotations();
      const given = await actor.getGivenQuotations();
      setRejectedQuotations(rejected);
      setGivenQuotations(given);
    } catch (error) {
      console.error('Error fetching quotations:', error);
    }
  };

  const connectWallet = async (walletType) => {
    // This is a placeholder function. You'll need to implement the actual wallet connection logic.
    const newWallet = { type: walletType, address: `0x${Math.random().toString(16).substr(2, 40)}` };
    setConnectedWallets([...connectedWallets, newWallet]);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <img className="h-8 w-auto" src="/icon.webp" alt="Logo" />
              </div>
              <div className="ml-6 flex space-x-8">
                <Link to="/dashboard" className="text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium">
                  Dashboard
                </Link>
                <Link to="/profile" className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-blue-500 text-sm font-medium">
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
          className="bg-white shadow-lg rounded-lg overflow-hidden mb-8"
        >
          <div className="bg-blue-600 px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-white flex items-center">
              <FaUser className="mr-2" /> User Profile
            </h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-lg font-semibold mb-2">Personal Information</h4>
                <p><strong>Name:</strong> {userInfo.name}</p>
                <p><strong>Email:</strong> {userInfo.email}</p>
                <p><strong>Account Type:</strong> {userInfo.accountType}</p>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-2">Account Statistics</h4>
                <p><strong>Total Quotations:</strong> {givenQuotations.length + rejectedQuotations.length}</p>
                <p><strong>Approved Quotations:</strong> {givenQuotations.length}</p>
                <p><strong>Rejected Quotations:</strong> {rejectedQuotations.length}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white shadow-lg rounded-lg overflow-hidden mb-8"
        >
          <div className="bg-blue-600 px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-white flex items-center">
              <FaWallet className="mr-2" /> Connected Wallets
            </h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            {connectedWallets.length > 0 ? (
              <ul className="space-y-3 mb-4">
                {connectedWallets.map((wallet, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-md"
                  >
                    <span className="font-medium">{wallet.type}</span>
                    <span className="text-sm text-gray-500">{wallet.address}</span>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 mb-4">No wallets connected yet.</p>
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <button
                onClick={() => connectWallet('Plug')}
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <FaPlug className="mr-2" /> Connect Plug Wallet
              </button>
              <button
                onClick={() => connectWallet('MetaMask')}
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400"
              >
                <FaEthereum className="mr-2" /> Connect MetaMask
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white shadow-lg rounded-lg overflow-hidden mb-8"
        >
          <div className="bg-blue-600 px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-white flex items-center">
              <FaCheckCircle className="mr-2" /> Given Quotations
            </h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            {givenQuotations.length > 0 ? (
              <ul className="space-y-3">
                {givenQuotations.map((quote, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-md"
                  >
                    <span className="font-medium">Quotation #{quote.id}</span>
                    <span className="text-sm text-gray-500">${quote.amount}</span>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No given quotations yet.</p>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white shadow-lg rounded-lg overflow-hidden"
        >
          <div className="bg-blue-600 px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-white flex items-center">
              <FaTimesCircle className="mr-2" /> Rejected Quotations
            </h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            {rejectedQuotations.length > 0 ? (
              <ul className="space-y-3">
                {rejectedQuotations.map((quote, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-md"
                  >
                    <span className="font-medium">Quotation #{quote.id}</span>
                    <span className="text-sm text-red-500">Rejected: {quote.reason}</span>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No rejected quotations.</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;