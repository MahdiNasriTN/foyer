import React from 'react';

const ChambreStats = ({ stats }) => {
  return (
    <div className="space-y-6">
      {/* Statistiques générales existantes */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200/40 shadow-inner">
          <div className="text-xs font-medium text-blue-600/80 mb-1">Total des chambres</div>
          <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200/40 shadow-inner">
          <div className="text-xs font-medium text-green-600/80 mb-1">Chambres occupées</div>
          <div className="text-2xl font-bold text-green-900">{stats.occupees}</div>
        </div>
        
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4 border border-amber-200/40 shadow-inner">
          <div className="text-xs font-medium text-amber-600/80 mb-1">Chambres libres</div>
          <div className="text-2xl font-bold text-amber-900">{stats.libres}</div>
        </div>
        
        <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg p-4 border border-cyan-200/40 shadow-inner">
          <div className="text-xs font-medium text-cyan-600/80 mb-1">Taux d'occupation</div>
          <div className="text-2xl font-bold text-cyan-900">{stats.tauxOccupation}%</div>
          <div className="mt-2 bg-cyan-200/50 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full rounded-full" 
              style={{ width: `${stats.tauxOccupation}%` }}
            ></div>
          </div>
        </div>

        {/* Ajouter un statistique pour le ratio lits/chambres */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200/40 shadow-inner">
          <div className="text-xs font-medium text-purple-600/80 mb-1">Lits disponibles</div>
          <div className="text-2xl font-bold text-purple-900">
            {stats.totalLits || stats.total * 2} {/* Par défaut, estimer 2 lits par chambre */}
          </div>
          <div className="text-xs text-purple-600/60 mt-1">
            Moyenne de {((stats.totalLits || stats.total * 2) / stats.total).toFixed(1)} lits par chambre
          </div>
        </div>
      </div>
      
      {/* Nouvelle section: statistiques par étage */}
      {stats.parEtage && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-blue-800 mb-3 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Statistiques par étage
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {stats.parEtage.map((etageStats) => (
              <div key={etageStats.etage} className="bg-white/40 backdrop-blur-sm rounded-lg p-3 border border-white/40 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm font-medium text-blue-800">Étage {etageStats.etage}</div>
                  <span className="px-1.5 py-0.5 bg-blue-100/80 text-blue-800 text-xs rounded">
                    {etageStats.total} chambres
                  </span>
                </div>
                
                <div className="flex items-center text-xs">
                  <div className="flex items-center text-green-700 mr-3">
                    <span className="h-2 w-2 bg-green-500 rounded-full mr-1"></span>
                    <span>{etageStats.occupees} occupée{etageStats.occupees !== 1 ? 's' : ''}</span>
                  </div>
                  
                  <div className="flex items-center text-amber-700">
                    <span className="h-2 w-2 bg-amber-500 rounded-full mr-1"></span>
                    <span>{etageStats.total - etageStats.occupees} libre{(etageStats.total - etageStats.occupees) !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                
                <div className="mt-2 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full" 
                    style={{ width: `${etageStats.total > 0 ? (etageStats.occupees / etageStats.total) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChambreStats;