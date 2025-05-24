import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const SuperAdminRoute = ({ children }) => {
  const { userData, loading } = useUser();

  // While checking user data, show loading or nothing
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // If user is not superadmin, redirect to home
  if (!userData || userData.role !== 'superadmin') {
    return <Navigate to="/" replace />;
  }

  // If user is superadmin, render the children
  return children;
};

export default SuperAdminRoute;