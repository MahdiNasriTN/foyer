import React from 'react';

const FeatureCard = ({ 
  icon, 
  title, 
  description, 
  colorMode,
  iconBgColor = colorMode === 'dark' ? 'bg-blue-900/50' : 'bg-blue-100',
  iconTextColor = colorMode === 'dark' ? 'text-blue-400' : 'text-blue-600'
}) => {
  return (
    <div className={`p-4 rounded-lg ${
      colorMode === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
    }`}>
      <div className="flex items-start">
        <div className={`p-2 rounded-md ${iconBgColor} ${iconTextColor}`}>
          {icon}
        </div>
        <div className="ml-4">
          <h4 className="text-lg font-medium">{title}</h4>
          <p className="mt-1 text-sm">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default FeatureCard;