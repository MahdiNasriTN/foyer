import React, { useState, useEffect } from 'react';
import { 
  DownloadIcon, 
  DocumentTextIcon,
  XIcon,
  FilterIcon
} from '@heroicons/react/outline';
import { exportPersonnel, getUniquePostes } from '../../services/personnelService';

const PersonnelExport = ({ isOpen, onClose, currentFilters }) => {
  const [exportFilters, setExportFilters] = useState({
    poste: 'all',
    search: ''
  });
  const [loading, setLoading] = useState(false);
  const [postes, setPostes] = useState([]);
  const [previewData, setPreviewData] = useState(null);

  // Load unique postes on component mount
  useEffect(() => {
    if (isOpen) {
      loadPostes();
      // Initialize with current filters - only keep poste and search
      setExportFilters({
        poste: currentFilters?.poste || 'all',
        search: currentFilters?.search || ''
      });
    }
  }, [isOpen, currentFilters]);

  const loadPostes = async () => {
    try {
      const response = await getUniquePostes();
      setPostes(response.data.postes || []);
    } catch (error) {
      console.error('Error loading postes:', error);
    }
  };

  const handleFilterChange = (field, value) => {
    setExportFilters(prev => ({ ...prev, [field]: value }));
  };

  const handlePreview = async () => {
    setLoading(true);
    try {
      const response = await exportPersonnel(exportFilters, 'json');
      setPreviewData(response.data.data);
    } catch (error) {
      console.error('Error generating preview:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      const response = await exportPersonnel(exportFilters, 'excel');
      
      // Create and download Excel file
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `personnel_par_poste_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      onClose();
    } catch (error) {
      console.error('Error exporting:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 my-8">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-lg">
          <h3 className="text-lg font-medium text-white flex items-center">
            <DownloadIcon className="h-5 w-5 mr-2" />
            Exporter le Personnel par Poste
          </h3>
          <button onClick={onClose} className="text-white hover:text-blue-100">
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6">
          {/* Export Filters */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <FilterIcon className="h-4 w-4 mr-2" />
              Filtres d'export
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                  Poste
                </label>
                <select
                  value={exportFilters.poste}
                  onChange={(e) => handleFilterChange('poste', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">Tous les postes</option>
                  {postes.map(poste => (
                    <option key={poste} value={poste}>{poste}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                  Recherche
                </label>
                <input
                  type="text"
                  placeholder="Rechercher par nom, email..."
                  value={exportFilters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handlePreview}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
            >
              <DocumentTextIcon className="h-4 w-4 mr-2" />
              Aperçu
            </button>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Annuler
              </button>
              <button
                onClick={handleExport}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                    Export en cours...
                  </>
                ) : (
                  <>
                    <DownloadIcon className="h-4 w-4 mr-2" />
                    Exporter Excel
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Preview */}
          {previewData && (
            <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-auto">
              <h5 className="font-medium text-gray-800 mb-3">
                Aperçu - Personnel groupé par poste ({previewData.totalCount} employés)
              </h5>
              
              {Object.keys(previewData.personnelByPoste).map(poste => (
                <div key={poste} className="mb-4">
                  <h6 className="font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-md mb-2">
                    {poste} ({previewData.personnelByPoste[poste].length} employé{previewData.personnelByPoste[poste].length > 1 ? 's' : ''})
                  </h6>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-4">
                    {previewData.personnelByPoste[poste].slice(0, 3).map((emp, index) => (
                      <div key={index} className="text-sm text-gray-600 bg-white p-2 rounded border">
                        <div className="font-medium">{emp.nom}</div>
                        <div className="text-xs text-gray-500">
                          {emp.email} • {emp.poste}
                        </div>
                      </div>
                    ))}
                    
                    {previewData.personnelByPoste[poste].length > 3 && (
                      <div className="text-sm text-gray-500 italic p-2">
                        ... et {previewData.personnelByPoste[poste].length - 3} autre(s)
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonnelExport;