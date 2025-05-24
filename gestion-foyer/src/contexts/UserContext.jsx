import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// API base URL from environment
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

// Create the context
const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch user data
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.status === 'success') {
        setUserData(response.data.data.user);
      } else {
        throw new Error('Failed to fetch user data');
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError(err);
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchUserData();
  }, []);

  // Function to refresh user data when needed
  const refreshUserData = () => {
    fetchUserData();
  };

  // Calculate user initials
  const getUserInitials = () => {
    if (!userData) return '';
    
    return `${userData.firstName?.charAt(0) || ''}${userData.lastName?.charAt(0) || ''}`;
  };

  // Generate avatar color based on email
  const getAvatarColor = () => {
    if (!userData?.email) return '#4f46e5'; // Default color
    
    let hash = 0;
    for (let i = 0; i < userData.email.length; i++) {
      hash = userData.email.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xFF;
      color += ('00' + value.toString(16)).substr(-2);
    }
    
    return color;
  };

  // Value object to be provided by the context
  const value = {
    userData,
    loading,
    error,
    refreshUserData,
    userInitials: getUserInitials(),
    avatarColor: getAvatarColor(),
    isAuthenticated: !!userData,
    userRole: userData?.role || 'user',
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

// Custom hook to use the user context
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined || context === null) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};