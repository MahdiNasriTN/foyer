import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Chambres from './pages/Chambres';
import Stagiaires from './pages/Stagiaires';
// import Cuisine from './pages/Cuisine';
import Layout from './components/layout/Layout';
import Personnel from './pages/Personnel';
import ProtectedRoute from './components/ProtectedRoute';
import Documentation from './pages/Documentation';

// API base URL from environment
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
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
          setUser(response.data.data.user);
          setIsAuthenticated(true);
        } else {
          // Token is invalid - clear localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth verification error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
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
        
        { <Route path="/" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Layout user={user} onLogout={handleLogout}>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } /> }

        
        <Route path="/chambres" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Layout user={user} onLogout={handleLogout}>
              <Chambres />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/stagiaires" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Layout user={user} onLogout={handleLogout}>
              <Stagiaires />
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* <Route path="/cuisine" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Layout user={user} onLogout={handleLogout}>
              <Cuisine />
            </Layout>
          </ProtectedRoute>
        } /> */}
        { <Route path="/personnel" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Layout user={user} onLogout={handleLogout}>
              <Personnel />
            </Layout>
          </ProtectedRoute>
        } /> }
        <Route path="/documentation" element={<Documentation />} />
        <Route path="/documentation/:sectionId" element={<Documentation />} />
        <Route path="/documentation/:sectionId/:subsectionId" element={<Documentation />} />
        
        {/* Redirect any unknown routes to the dashboard */}
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;