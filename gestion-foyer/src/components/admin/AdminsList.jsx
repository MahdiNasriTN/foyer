import React, { useState, useEffect } from 'react';
import { PencilAltIcon, TrashIcon, UserAddIcon, SearchIcon, ExclamationCircleIcon } from '@heroicons/react/outline';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getAllAdmins } from '../../services/adminService';

const AdminsList = ({ onEdit, onDelete, onAddNew }) => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        setLoading(true);
        const response = await getAllAdmins();
        
        // Transform the API response to match our component's expected format
        const adminUsers = Array.isArray(response.data) ? response.data.map(user => {
          // Split name into firstName and lastName if only name is provided
          let firstName = '', lastName = '';
          if (user.name && !user.firstName) {
            const nameParts = user.name.split(' ');
            firstName = nameParts[0] || '';
            lastName = nameParts.slice(1).join(' ') || '';
          } else {
            firstName = user.firstName || '';
            lastName = user.lastName || '';
          }

          return {
            id: user._id,
            firstName,
            lastName,
            name: user.name || `${firstName} ${lastName}`.trim(),
            email: user.email || '',
            role: user.role || 'Admin',
            permissions: user.permissions || ['view'],
            createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
            lastLogin: user.lastLogin ? new Date(user.lastLogin) : null,
            status: user.status || 'active'
          };
        }) : [];
        
        setAdmins(adminUsers);
        setError(null);
      } catch (error) {
        console.error("Error fetching admin accounts:", error);
        setError("Impossible de charger la liste des administrateurs.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAdmins();
  }, []);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedAdmins = [...admins].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Update the filter to handle potentially missing fields
  const filteredAdmins = sortedAdmins.filter(admin => {
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = admin.name && admin.name.toLowerCase().includes(searchLower);
    const firstNameMatch = admin.firstName && admin.firstName.toLowerCase().includes(searchLower);
    const lastNameMatch = admin.lastName && admin.lastName.toLowerCase().includes(searchLower);
    const emailMatch = admin.email && admin.email.toLowerCase().includes(searchLower);
    
    return nameMatch || firstNameMatch || lastNameMatch || emailMatch;
  });

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return format(date, 'dd MMMM yyyy', { locale: fr });
  };
  
  const formatDateTime = (date) => {
    if (!date) return 'N/A';
    return format(date, 'dd MMM yyyy à HH:mm', { locale: fr });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex flex-col items-center justify-center text-center">
          <ExclamationCircleIcon className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-gray-50 to-white px-8 py-4 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h3 className="text-base font-medium text-gray-900">Liste des comptes administrateurs</h3>
          <p className="text-sm text-gray-500 mt-1">
            {filteredAdmins.length} {filteredAdmins.length > 1 ? 'administrateurs' : 'administrateur'} au total
          </p>
        </div>
        
        <div className="flex space-x-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>
          
          <button 
            onClick={onAddNew}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-br from-slate-800 to-blue-800 hover:from-slate-900 hover:to-blue-900"
          >
            <UserAddIcon className="h-4 w-4 mr-2" />
            Ajouter un admin
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                onClick={() => handleSort('name')}
              >
                Administrateur
                <span className="ml-1">
                  {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </span>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                onClick={() => handleSort('email')}
              >
                Email
                <span className="ml-1">
                  {sortConfig.key === 'email' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </span>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Permissions
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                onClick={() => handleSort('createdAt')}
              >
                Créé le
                <span className="ml-1">
                  {sortConfig.key === 'createdAt' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </span>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                onClick={() => handleSort('status')}
              >
                Statut
                <span className="ml-1">
                  {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </span>
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAdmins.length > 0 ? (
              filteredAdmins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-gradient-to-br from-slate-800 to-blue-800 text-white font-semibold">
                        {admin.firstName.charAt(0) || ''}
                        {admin.lastName.charAt(0) || ''}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {admin.name || `${admin.firstName} ${admin.lastName}`.trim()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {admin.role}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{admin.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-1">
                      {admin.permissions && admin.permissions.includes('view') && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Lecture
                        </span>
                      )}
                      {admin.permissions && admin.permissions.includes('edit') && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Édition
                        </span>
                      )}
                      {admin.permissions && admin.permissions.includes('create') && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Création
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(admin.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      admin.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {admin.status === 'active' ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => onEdit(admin)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <PencilAltIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => onDelete(admin)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                  Aucun administrateur trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminsList;