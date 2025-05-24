import React from 'react';
import GeneralSchedule from '../components/schedule/GeneralSchedule';

const Schedule = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Premium Header with gradient background - more compact */}
      <div className="bg-gradient-to-br from-slate-900 to-blue-900 py-8 px-6 relative">
        <div className="absolute inset-0 bg-grid-white/[0.1] bg-[length:20px_20px]"></div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/20 to-transparent"></div>
        <div className="relative max-w-full mx-auto">
          <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Gestion du Planning</h1>
          <p className="text-blue-200 text-sm">
            Planifiez les activités, visualisez les disponibilités et gérez l'emploi du temps du foyer
          </p>
        </div>
      </div>
      
      {/* Schedule component directly in the page layout - no nested containers */}
      <div className="flex-1 p-4">
        <GeneralSchedule />
      </div>
    </div>
  );
};

export default Schedule;