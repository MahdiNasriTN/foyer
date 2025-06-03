import { useState, useEffect } from 'react';
import { getUserProfile } from '../services/userService'; // Adjust import path to match your API service

const usePermissions = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const userData = await getUserProfile();
        setUser(userData.data.user);
        setError(null);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // If still loading or error, return default permissions (read-only)
  if (loading || error || !user) {
    return {
      canView: true,
      canEdit: false,
      canCreate: false,
      canDelete: false,
      canExport: true,
      canManageUsers: false,
      canManageSettings: false,
      isSuperAdmin: false,
      isAdmin: false,
      user: null,
      loading,
      error
    };
  }

  const isSuperAdmin = user?.role === 'superadmin';
  const isAdmin = user?.role === 'admin' || isSuperAdmin;
  const permissions = {
    canView: true, // Everyone can view
    canEdit: isSuperAdmin,
    canCreate: isSuperAdmin,
    canDelete: isSuperAdmin,
    canExport: true, // Everyone can export
    canManageUsers: isSuperAdmin,
    canManageSettings: isSuperAdmin
  };
  
  return {
    ...permissions,
    isSuperAdmin,
    isAdmin,
    user,
    loading,
    error
  };
};

export { usePermissions };