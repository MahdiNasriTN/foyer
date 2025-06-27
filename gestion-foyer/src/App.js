import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { UserProvider } from './contexts/UserContext';
import Login from './pages/Login';
import Signup from './pages/Signup'; // NEW: Import Signup page
import Dashboard from './pages/Dashboard';
import Chambres from './pages/Chambres';
import Stagiaires from './pages/Stagiaires';
import Layout from './components/layout/Layout';
import Personnel from './pages/Personnel';
import ProtectedRoute from './components/ProtectedRoute';
import SuperAdminRoute from './components/SuperAdminRoute';
import Documentation from './pages/Documentation';
import Schedule from './pages/Schedule';
import UserSettings from './pages/UserSettings';

// API base URL from environment
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  // NEW: Add state to track if superadmin exists
  const [superAdminExists, setSuperAdminExists] = useState(null);
  const [checkingSetup, setCheckingSetup] = useState(true);

  // NEW: Function to check if superadmin exists
  const checkSuperAdminExists = async () => {
    try {
      // Make sure this request doesn't include any auth headers
      const response = await axios.get(`${API_URL}/auth/check-superadmin`, {
        // Explicitly remove any default headers that might include auth
        headers: {}
      });
      
      if (response.data.status === 'success') {
        return response.data.data.exists;
      } else {
        console.error('Unexpected response format:', response.data);
        return false;
      }
    } catch (error) {
      console.error('Error checking superadmin:', error.response?.data || error.message);
      
      // If it's a network error or server error, assume setup is needed
      if (error.response?.status === 500 || !error.response) {
        return false;
      }
      
      // For other errors, log them but still assume setup is needed
      return false;
    }
  };

  // Check authentication status on mount
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      try {
        // Make a request to verify the token
        const response = await axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.status === 'success') {
          setIsAuthenticated(true);
        } else {
          // Token is invalid - clear localStorage
          localStorage.removeItem('token');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth verification error:', error);
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  // NEW: Check superadmin status on mount
  useEffect(() => {
    const checkSetup = async () => {
      try {
        setCheckingSetup(true);
        const exists = await checkSuperAdminExists();
        setSuperAdminExists(exists);
      } catch (error) {
        console.error('Setup check error:', error);
        // If there's any error, assume no superadmin exists (safer for setup)
        setSuperAdminExists(false);
      } finally {
        setCheckingSetup(false);
      }
    };

    // Only check setup if we're not authenticated
    if (!isAuthenticated) {
      checkSetup();
    } else {
      // If already authenticated, we know superadmin exists
      setSuperAdminExists(true);
      setCheckingSetup(false);
    }
  }, [isAuthenticated]);

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
  };

  // NEW: Handle signup (same as login for superadmin)
  const handleSignup = (userData, token) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
    setSuperAdminExists(true); // Update state after successful signup
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  // Show a loading state while checking authentication and setup
  if (loading || checkingSetup) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">
            {checkingSetup ? 'Vérification de la configuration...' : 'Chargement de l\'application...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* NEW: Conditional login/signup route based on superadmin existence */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? 
              <Navigate to="/" replace /> : 
              // Show signup if no superadmin exists, otherwise show login
              superAdminExists === false ? 
                <Signup onSignup={handleSignup} /> :
                <Login onLogin={handleLogin} />
          } 
        />
        
        {/* NEW: Direct signup route (only accessible if no superadmin exists) */}
        <Route 
          path="/setup" 
          element={
            isAuthenticated ? 
              <Navigate to="/" replace /> :
              superAdminExists === false ?
                <Signup onSignup={handleSignup} /> :
                <Navigate to="/login" replace />
          } 
        />
        
        {/* Authenticated routes wrapped with UserProvider */}
        <Route path="/*" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            {/* The UserProvider should wrap only the authenticated part of the app */}
            <UserProvider>
              <Layout onLogout={handleLogout}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/chambres" element={<Chambres />} />
                  <Route path="/stagiaires" element={<Stagiaires />} />
                  <Route path="/personnel" element={<Personnel />} />
                  
                  {/* SuperAdmin only routes */}
                  <Route path="/schedule" element={
                      <Schedule />
                  } />
                  <Route path="/settings" element={
                    <SuperAdminRoute>
                      <UserSettings />
                    </SuperAdminRoute>
                  } />
                  
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            </UserProvider>
          </ProtectedRoute>
        } />
        
        {/* Documentation routes available to all */}
        {/* <Route path="/documentation" element={<Documentation />} />
        <Route path="/documentation/:sectionId" element={<Documentation />} />
        <Route path="/documentation/:sectionId/:subsectionId" element={<Documentation />} /> */}
      </Routes>
    </Router>
  );
}

export default App;