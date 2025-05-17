import React from 'react';
import { BookOpenIcon } from '@heroicons/react/outline';

const DocHeader = ({ colorMode, mobileMenuOpen, setMobileMenuOpen }) => {
  return (
    <div className={`lg:hidden flex items-center justify-between p-4 ${
      colorMode === 'dark' ? 'bg-gray-800' : 'bg-white'
    } shadow-md z-30 sticky top-0`}>
      <div className="flex items-center">
        <BookOpenIcon className="h-6 w-6 text-blue-600 mr-2" />
        <h1 className="text-xl font-bold">Documentation Foyer</h1>
      </div>
      <button 
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="p-2 rounded-md hover:bg-gray-100 focus:outline-none"
      >
        {mobileMenuOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default DocHeader;