import React from 'react';

const DocTableOfContents = ({ colorMode, tocVisible, activeSectionData }) => {
  return (
    <div 
      className={`hidden xl:block fixed right-4 top-10 w-64 rounded-lg overflow-hidden transition-all duration-300 ${
        tocVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10 pointer-events-none'
      } ${colorMode === 'dark' ? 'bg-gray-800 shadow-xl' : 'bg-white shadow-lg'} border border-gray-200`}
    >
      <div className="p-4 font-medium border-b border-gray-200">
        Sur cette page
      </div>
      <div className="p-4 max-h-[calc(100vh-20rem)] overflow-y-auto text-sm">
        {activeSectionData.subsections.map((subsection) => (
          <a 
            key={subsection.id}
            href={`#${subsection.id}`}
            className={`block py-1.5 hover:text-blue-600 ${
              colorMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            {subsection.title}
          </a>
        ))}
      </div>
    </div>
  );
};

export default DocTableOfContents;