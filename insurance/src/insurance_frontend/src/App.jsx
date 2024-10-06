import * as React from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import LoginPage from "./components/Login";
import NotFound from "./components/NotFound";
import Dashboard from "./components/Dashboard";
import ClaimSubmission from "./components/ClaimSubmission";
import Navbar from "./components/Navbar";

const App = () => {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <Routes>
          <Route exact path="/" element={<LoginPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/submit-claim" element={<ClaimSubmission />} />
          <Route element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App;