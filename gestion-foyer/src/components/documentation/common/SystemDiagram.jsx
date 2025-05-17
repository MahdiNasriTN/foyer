import React from 'react';

const SystemDiagram = ({ 
  layers, 
  description, 
  colorMode 
}) => {
  return (
    <div className={`p-6 rounded-lg ${
      colorMode === 'dark' ? 'bg-gray-800' : 'bg-white'
    } border border-gray-200 mb-8`}>
      <div className="flex flex-col items-center">
        <div className="w-full max-w-3xl">
          {layers.map((layer, index) => {
            // Déterminer si c'est le premier ou le dernier élément pour les coins arrondis
            const isFirst = index === 0;
            const isLast = index === layers.length - 1;
            const roundedClass = isFirst 
              ? 'rounded-t-lg' 
              : isLast 
                ? 'rounded-b-lg' 
                : '';
            
            // Déterminer si c'est une couche principale ou une couche de transition
            const isMainLayer = index % 2 === 0;
            
            return (
              <div 
                key={layer.name}
                className={`w-full ${
                  isMainLayer 
                    ? `h-12 flex items-center justify-center ${roundedClass} ${
                        colorMode === 'dark' ? layer.darkBg : layer.lightBg
                      } text-white font-medium`
                    : `h-10 flex items-center justify-center ${
                        colorMode === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                      } font-medium`
                }`}
              >
                {layer.name}
              </div>
            );
          })}
        </div>
        
        {description && (
          <div className="mt-8 text-sm text-center max-w-2xl">
            <p>{description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemDiagram;