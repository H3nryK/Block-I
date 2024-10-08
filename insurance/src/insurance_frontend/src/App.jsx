import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import IdentityPage from './components/IdentityPage';
import ClaimList from './components/ClaimList';
import { IdentityProvider } from './utils/icpIdentity'; // Assuming you have this context provider

const App = () => {
  return (
    <IdentityProvider>
      <Router>
        <Routes>
          <Route path="/" exact component={IdentityPage} />
          <Route path="/claims" component={ClaimList} />
        </Routes>
      </Router>
    </IdentityProvider>
  );
};

export default App;
