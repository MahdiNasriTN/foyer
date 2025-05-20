import React, { useState, useEffect } from 'react';
import { PlusIcon, XIcon } from '@heroicons/react/outline';
import { getPersonnelSchedule, updatePersonnelSchedule } from '../../services/api';

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const TIME_SLOTS = Array.from({ length: 10 }, (_, i) => ({
  start: 8 + i,
  end: 9 + i,
  label: `${8 + i}:00 - ${9 + i}:00`
}));

const PersonnelSchedule = ({ employeeId, initialSchedule = {}, onSave, onClose }) => {
  const [schedule, setSchedule] = useState({});
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedHour, setSelectedHour] = useState(null);
  const [isAddingShift, setIsAddingShift] = useState(false);
  const [shiftDetails, setShiftDetails] = useState({
    startTime: '',
    endTime: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load schedule data
  useEffect(() => {
    const loadSchedule = async () => {
      if (!employeeId) return;
      
      try {
        setLoading(true);
        // First check if we have initial data
        if (Object.keys(initialSchedule).length > 0) {
          setSchedule(initialSchedule);
        } else {
          // Otherwise fetch from API
          const response = await getPersonnelSchedule(employeeId);
          setSchedule(response.data.schedule || {});
        }
      } catch (err) {
        console.error('Error loading schedule:', err);
        setError('Impossible de charger le planning');
      } finally {
        setLoading(false);
      }
    };

    loadSchedule();
  }, [employeeId, initialSchedule]);

  const getShiftForTimeSlot = (day, hour) => {
    if (!schedule[day]) return null;
    
    return schedule[day].find(shift => {
      const startHour = parseInt(shift.startTime.split(':')[0]);
      const endHour = parseInt(shift.endTime.split(':')[0]);
      return hour >= startHour && hour < endHour;
    });
  };

  const handleCellClick = (day, hour) => {
    // If there's already a shift at this time, don't do anything
    if (getShiftForTimeSlot(day, hour)) return;

    setSelectedDay(day);
    setSelectedHour(hour);
    setShiftDetails({
      startTime: `${hour}:00`,
      endTime: `${hour + 1}:00`,
      notes: ''
    });
    setIsAddingShift(true);
  };

  const handleSaveShift = () => {
    const newSchedule = { ...schedule };
    
    if (!newSchedule[selectedDay]) {
      newSchedule[selectedDay] = [];
    }
    
    newSchedule[selectedDay].push(shiftDetails);
    
    setSchedule(newSchedule);
    setIsAddingShift(false);
    setSelectedDay(null);
    setSelectedHour(null);
  };

  const handleDeleteShift = (day, shift) => {
    const newSchedule = { ...schedule };
    newSchedule[day] = newSchedule[day].filter(s => 
      s.startTime !== shift.startTime || s.endTime !== shift.endTime
    );
    
    if (newSchedule[day].length === 0) {
      delete newSchedule[day];
    }
    
    setSchedule(newSchedule);
  };

  const handleSaveSchedule = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Save to backend
      await updatePersonnelSchedule(employeeId, schedule);
      
      // Notify parent component
      onSave(employeeId, schedule);
    } catch (err) {
      console.error('Error saving schedule:', err);
      setError("Une erreur s'est produite lors de l'enregistrement du planning");
    } finally {
      setLoading(false);
    }
  };

  if (loading && Object.keys(schedule).length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-7xl mx-auto flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  if (error && Object.keys(schedule).length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur de chargement</h3>
          <p className="text-gray-500">{error}</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-xl p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Planning de l'employé</h2>
        <div className="flex space-x-3">
          <button
            onClick={handleSaveSchedule}
            disabled={loading}
            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <>
                <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                Enregistrement...
              </>
            ) : 'Enregistrer'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Fermer
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
          <p className="font-medium">Erreur</p>
          <p>{error}</p>
        </div>
      )}

      {/* Schedule grid */}
      <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-36 border-r border-gray-200">
                  Horaire
                </th>
                {DAYS.map(day => (
                  <th key={day} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {TIME_SLOTS.map((timeSlot, index) => {
                // Format the hour display for better readability
                const startHour = timeSlot.start < 10 ? `0${timeSlot.start}` : timeSlot.start;
                const endHour = timeSlot.end < 10 ? `0${timeSlot.end}` : timeSlot.end;
                const formattedLabel = `${startHour}:00 - ${endHour}:00`;
                
                return (
                  <tr key={timeSlot.start} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200">
                      {formattedLabel}
                    </td>
                    {DAYS.map(day => {
                      const shift = getShiftForTimeSlot(day, timeSlot.start);
                      
                      return (
                        <td 
                          key={`${day}-${timeSlot.start}`} 
                          className={`px-1 py-1 text-sm text-center border border-gray-100 relative cursor-pointer h-12`}
                          onClick={() => !shift && handleCellClick(day, timeSlot.start)}
                        >
                          {shift ? (
                            <div className="flex flex-col h-full relative group">
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-indigo-50 rounded shadow-sm"></div>
                              <div className="relative p-1.5 flex flex-col h-full z-10">
                                <div className="text-xs font-medium text-blue-700 mb-0.5 truncate">
                                  {timeSlot.label}
                                </div>
                                <div className="text-xs text-gray-600 flex-1 overflow-hidden text-left leading-tight">
                                  {shift.notes || "Tâche assignée"}
                                </div>
                                <button
                                  className="absolute top-0.5 right-0.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteShift(day, shift);
                                  }}
                                >
                                  <XIcon className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-full group">
                              <div className="h-7 w-7 rounded-full bg-gray-50 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200 group-hover:bg-gray-100 group-hover:shadow-sm">
                                <PlusIcon className="h-4 w-4 text-gray-400 group-hover:text-blue-500" />
                              </div>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-sm text-gray-500 mt-3 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Cliquez sur une cellule pour ajouter un créneau de travail
      </p>

      {/* Add Shift Modal */}
      {isAddingShift && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-lg">
              <h3 className="text-lg font-medium text-white">
                Ajouter une tâche
              </h3>
              <div className="text-sm text-blue-100">
                {selectedDay} • {selectedHour}:00 - {selectedHour + 1}:00
              </div>
              <button 
                onClick={() => setIsAddingShift(false)}
                className="text-white hover:text-blue-100"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Description de la tâche
                </label>
                <textarea
                  id="notes"
                  rows="5"
                  value={shiftDetails.notes}
                  onChange={(e) => setShiftDetails({...shiftDetails, notes: e.target.value})}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-3 px-4 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Saisir les détails de cette tâche..."
                ></textarea>
              </div>
            </div>
            
            <div className="p-5 border-t border-gray-200 flex justify-end space-x-3 bg-gray-50 rounded-b-lg">
              <button
                onClick={() => setIsAddingShift(false)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveShift}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonnelSchedule;