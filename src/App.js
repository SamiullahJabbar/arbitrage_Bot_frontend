import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';  // Use Routes instead of Switch
import Dashboard from './pages/Dashboard';
import Layout from './pages/Layout';  // Import Layout component
import Register from './pages/Register';  // Import Register component
import Login from './pages/Login';  // Import Login component

const App = () => {
  return (
    <Router>
      <div className="App">
          <Routes>  {/* Replace Switch with Routes */}
            {/* Route for Dashboard */}
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Route for Register */}
            <Route path="/register" element={<Register />} />
            
            {/* Route for Login */}
            <Route path="/login" element={<Login />} />
            
            {/* Default route or fallback */}
            <Route path="/" exact element={<Login />} /> {/* Redirect to login by default */}
          </Routes>
      </div>
    </Router>
  );
};

export default App;
