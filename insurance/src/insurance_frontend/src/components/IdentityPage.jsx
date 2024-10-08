import React from 'react';
import { useIdentity } from '../utils/icpIdentity'; // Hook to manage Internet Identity
import './IdentityPage.css'; // Import custom styles

const IdentityPage = () => {
  const { identity, login, logout } = useIdentity(); // Manage identity with a custom hook

  return (
    <div className="identity-page">
      <div className="content">
        <h1 className="title">Welcome to Our Claims Management System!</h1>
        <p className="description">
          Our platform allows users to submit claims easily and track their statuses in real-time.
          Experience a streamlined process powered by cutting-edge technology and user-friendly design.
        </p>
        <p className="description">
          Use your Internet Identity to log in and start managing your claims today!
        </p>
        <button
          onClick={identity ? logout : login}
          className={`identity-button ${identity ? 'logout' : 'login'}`}
        >
          {identity ? 'Logout' : 'Login with Internet Identity'}
        </button>
      </div>
    </div>
  );
};

export default IdentityPage;
