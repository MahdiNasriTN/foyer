import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { UserProvider } from './contexts/UserContext';
import Login from './pages/Login';
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

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  // Show a loading state while checking authentication
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement de l'application...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? 
              <Navigate to="/" replace /> : 
              <Login onLogin={handleLogin} />
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
                    <SuperAdminRoute>
                      <Schedule />
                    </SuperAdminRoute>
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