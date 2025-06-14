// Create src/components/AuthHandler.jsx

import React, { useState, useEffect } from 'react';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import { checkSuperAdminExists } from '../services/api';

const AuthHandler = ({ onLogin }) => {
  const [superAdminExists, setSuperAdminExists] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkSetup = async () => {
      try {
        setLoading(true);
        const response = await checkSuperAdminExists();
        setSuperAdminExists(response.data.exists);
      } catch (err) {
        console.error('Error checking superadmin:', err);
        // If API call fails, assume setup is needed
        setSuperAdminExists(false);
        setError('Erreur de connexion au serveur');
      } finally {
        setLoading(false);
      }
    };

    checkSetup();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Vérification de la configuration...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <div className="text-red-500 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur de connexion</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // If no superadmin exists, show signup page
  if (superAdminExists === false) {
    return <Signup onSignup={onLogin} />;
  }

  // If superadmin exists, show login page
  return <Login onLogin={onLogin} />;
};

export default AuthHandler;