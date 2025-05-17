import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookOpenIcon,
  SearchIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ArrowLeftIcon,
  HomeIcon
} from '@heroicons/react/outline';

const DocSidebar = ({ 
  colorMode, 
  activeSection, 
  setActiveSection, 
  filteredSections, 
  searchQuery, 
  setSearchQuery,
  toggleColorMode,
  mobileMenuOpen,
  setMobileMenuOpen
}) => {
  const navigate = useNavigate();
  
  const handleSectionClick = (sectionId) => {
    setActiveSection(sectionId);
    navigate(`/documentation/${sectionId}`);
    setMobileMenuOpen(false);
  };

  const handleSubsectionClick = (subsectionId) => {
    // Pour les sous-sections, on reste sur la même page mais on fait défiler vers l'ancre
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Navigation Drawer */}
      <div className={`fixed inset-0 z-20 transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 lg:hidden`}>
        <div className="relative h-full flex flex-col w-80 max-w-[80vw] shadow-xl bg-white">
          <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
            <div className="flex items-center mb-4">
              <BookOpenIcon className="h-8 w-8 mr-3" />
              <h2 className="text-2xl font-bold">Documentation</h2>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher dans la documentation..."
                className="w-full py-2 pl-10 pr-4 bg-white/20 backdrop-blur-sm rounded-lg placeholder-white/70 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <SearchIcon className="absolute left-3 top-2.5 h-5 w-5 text-white/70" />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {filteredSections.map((section) => (
              <div key={section.id} className="mb-4">
                <button
                  onClick={() => handleSectionClick(section.id)}
                  className={`flex items-center w-full px-3 py-2 rounded-lg text-left ${
                    activeSection === section.id 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-3">{section.icon}</span>
                  <span className="font-medium">{section.title}</span>
                  <ChevronRightIcon className="h-4 w-4 ml-auto" />
                </button>
                
                {activeSection === section.id && (
                  <div className="ml-8 mt-2 space-y-1">
                    {section.subsections.map((subsection) => (
                      <a
                        key={subsection.id}
                        href={`#${subsection.id}`}
                        onClick={() => handleSubsectionClick(subsection.id)}
                        className="block px-3 py-2 text-sm rounded-md hover:bg-gray-100"
                      >
                        {subsection.title}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="p-4 border-t border-gray-200">
            <Link to="/" className="flex items-center text-blue-600 hover:text-blue-800">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Retour à l'Application
            </Link>
          </div>
        </div>
        <div 
          className="absolute inset-0 -z-10 bg-gray-800/50 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      </div>

      {/* Desktop Sidebar */}
      <div className={`hidden lg:block w-72 h-screen sticky top-0 overflow-y-auto ${
        colorMode === 'dark' ? 'bg-gray-800' : 'bg-white'
      } border-r border-gray-200`}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-2 rounded-lg mr-3">
              <BookOpenIcon className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold">Documentation</h1>
          </div>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher dans la documentation..."
              className={`w-full py-2 pl-10 pr-4 rounded-lg border ${
                colorMode === 'dark' 
                  ? 'bg-gray-700 border-gray-600 placeholder-gray-400 text-white' 
                  : 'bg-gray-50 border-gray-300 placeholder-gray-500 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <SearchIcon className={`absolute left-3 top-2.5 h-5 w-5 ${
              colorMode === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`} />
          </div>
        </div>
        
        <nav className="p-6">
          {filteredSections.map((section) => (
            <div key={section.id} className="mb-6">
              <button
                onClick={() => handleSectionClick(section.id)}
                className={`flex items-center w-full mb-2 font-medium text-left group ${
                  activeSection === section.id 
                    ? colorMode === 'dark' 
                      ? 'text-blue-400' 
                      : 'text-blue-700' 
                    : colorMode === 'dark'
                      ? 'text-gray-300 hover:text-white'
                      : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                <span className="mr-3">{section.icon}</span>
                <span>{section.title}</span>
                <ChevronDownIcon className={`h-4 w-4 ml-auto transform transition-transform ${
                  activeSection === section.id ? 'rotate-180' : 'rotate-0'
                }`} />
              </button>
              
              <div className={`ml-8 space-y-1 transition-all duration-200 ${
                activeSection === section.id ? 'max-h-96' : 'max-h-0 overflow-hidden'
              }`}>
                {section.subsections.map((subsection) => (
                  <a
                    key={subsection.id}
                    href={`#${subsection.id}`}
                    onClick={() => handleSubsectionClick(subsection.id)}
                    className={`block py-1.5 text-sm rounded-md ${
                      colorMode === 'dark'
                        ? 'text-gray-400 hover:text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {subsection.title}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </nav>
        
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={toggleColorMode}
              className={`p-2 rounded-md ${
                colorMode === 'dark' 
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title={colorMode === 'light' ? 'Passer au mode sombre' : 'Passer au mode clair'}
            >
              {colorMode === 'light' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>
            
            <a 
              href="https://github.com/yourusername/ges_foyer" 
              target="_blank" 
              rel="noopener noreferrer"
              className={`p-2 rounded-md ${
                colorMode === 'dark' 
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title="Voir sur GitHub"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.167 6.839 9.489.5.092.682-.217.682-.48 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.137 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
            </a>
            
            <Link 
              to="/"
              className={`p-2 rounded-md ${
                colorMode === 'dark' 
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title="Retour à l'Application"
            >
              <HomeIcon className="h-5 w-5" />
            </Link>
          </div>
          
          <div className={`text-xs text-center ${
            colorMode === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}></div>
            Version 1.0.0 • Dernière mise à jour: 15 mai 2025
          </div>
        </div>
      
    </>
  );
};

export default DocSidebar;