import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { 
  PlusIcon, 
  SearchIcon, 
  ChartPieIcon,
  ViewListIcon,
  ViewGridIcon,
  BriefcaseIcon,
  ChevronDownIcon
} from '@heroicons/react/outline';
import { usePermissions } from '../../hooks/usePermissions';

const StagiaireHeader = ({ 
  searchTerm, 
  onSearchChange, 
  onToggleStats, 
  isStatsOpen, 
  viewMode, 
  onViewModeChange,
  onAddNew,
  onAddExtern,
  totalCount = 0
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const permissions = usePermissions();

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Vérifier si l'élément cliqué est dans le dropdown du portail
      const portalElement = document.querySelector('#dropdown-portal');
      const clickedInPortal = portalElement && portalElement.contains(event.target);
      
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && !clickedInPortal) {
        setDropdownOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Effet de scroll pour animer le header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAddIntern = () => {
    onAddNew();
    setDropdownOpen(false);
  };

  const handleAddExtern = () => {
    onAddExtern();
    setDropdownOpen(false);
  };

  return (
    <div className={`relative z-30 transition-all duration-300 ${scrolled ? 'sticky top-0' : ''}`}>
      {/* Effet de flou en arrière-plan quand on scrolle */}
      {scrolled && (
        <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-lg shadow-xl -z-10 rounded-xl border border-white/5"></div>
      )}
      
      {/* Design ultra-premium avec effets visuels */}
      <div className={`relative overflow-hidden rounded-2xl transition-all duration-500 ${
        scrolled ? 'py-4' : 'py-8'
      }`}>
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-blue-900"></div>
        </div>

        <div className={`container mx-auto transition-all duration-500 px-4 ${scrolled ? 'max-w-7xl' : 'max-w-6xl'}`}>
          {/* Top section with title and count */}
          <div className={`flex justify-between items-center mb-6 transition-all ${scrolled ? 'opacity-0 h-0 mb-0 overflow-hidden' : 'opacity-100'}`}>
            <div className="flex items-center gap-3">
              <div className="bg-white/10 backdrop-blur-sm p-2.5 rounded-xl border border-white/10 shadow-inner shadow-white/5">
                <BriefcaseIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  Gestion des Stagiaires
                  <span className="text-sm font-normal text-blue-200/80 ml-3">
                    {totalCount} stagiaires
                  </span>
                </h1>
                <div className="mt-1 h-1 w-16 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full"></div>
              </div>
            </div>
          </div>
          
          {/* Search and actions bar */}
          <div className={`flex flex-col lg:flex-row lg:items-center gap-4 transition-all ${scrolled ? '-mt-2' : ''}`}>
            {/* Search input */}
            <div className={`relative flex-grow transition-all duration-300 ease-out`}>
              <div className={`flex items-center bg-white/5 backdrop-blur-sm rounded-lg border overflow-hidden transition-all duration-300 shadow-inner shadow-white/5 ${searchFocused ? 'border-cyan-500/40 ring-1 ring-cyan-500/20' : 'border-white/10'}`}>
                <div className={`p-3 flex items-center justify-center transition-colors ${searchFocused ? 'text-white' : 'text-blue-300'}`}>
                  <SearchIcon className="h-5 w-5" />
                </div>
                <input 
                  type="text" 
                  placeholder="Rechercher un stagiaire..." 
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className="bg-transparent text-white placeholder-blue-200/50 border-0 flex-grow focus:ring-0 focus:outline-none py-2.5 px-1"
                />
                {searchTerm && (
                  <button 
                    onClick={() => onSearchChange('')}
                    className="pr-4 text-blue-300/70 hover:text-white transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            
            {/* Actions container - right side */}
            <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3">
              {/* View modes with premium design */}
              <div className="inline-flex overflow-hidden rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 shadow-inner shadow-white/5">
                <button
                  onClick={() => onViewModeChange('list')}
                  className={`relative p-2.5 ${
                    viewMode === 'list' 
                      ? 'text-white' 
                      : 'text-blue-300 hover:text-white'
                  }`}
                  title="Vue en liste"
                >
                  {viewMode === 'list' && (
                    <span className="absolute inset-0 bg-white/10 border-y border-white/20"></span>
                  )}
                  <ViewListIcon className="relative z-10 h-5 w-5" />
                </button>
                
                <span className="w-px bg-white/10"></span>
                
                <button
                  onClick={() => onViewModeChange('grid')}
                  className={`relative p-2.5 ${
                    viewMode === 'grid' 
                      ? 'text-white' 
                      : 'text-blue-300 hover:text-white'
                  }`}
                  title="Vue en grille"
                >
                  {viewMode === 'grid' && (
                    <span className="absolute inset-0 bg-white/10 border-y border-white/20"></span>
                  )}
                  <ViewGridIcon className="relative z-10 h-5 w-5" />
                </button>
              </div>
              
              {/* Statistics button with animation */}
              <button
                onClick={onToggleStats}
                className={`
                  inline-flex items-center rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all
                  ${isStatsOpen 
                    ? 'text-white bg-blue-500 shadow-md' 
                    : 'bg-white/5 hover:bg-white/10 text-white border border-white/10 shadow-inner shadow-white/5'}
                `}
              >
                <ChartPieIcon className={`h-4 w-4 mr-2 ${isStatsOpen ? 'text-white' : 'text-blue-300'}`} aria-hidden="true" />
                {isStatsOpen ? 'Masquer' : 'Statistiques'}
              </button>

              {/* Dropdown pour choisir le type de stagiaire - Only show if user has permissions */}
              {(permissions.canCreate) && (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="inline-flex items-center rounded-lg px-3.5 py-2.5 text-sm font-medium shadow-sm bg-cyan-500 text-white hover:bg-cyan-600 transition-all"
                  >
                    <PlusIcon className="h-4 w-4 mr-1.5" aria-hidden="true" />
                    Ajouter
                    <ChevronDownIcon className="h-4 w-4 ml-1.5" aria-hidden="true" />
                  </button>
                  
                  {/* Menu déroulant pour choisir le type - UTILISE UN PORTAIL */}
                  {dropdownOpen && createPortal(
                    <div 
                      id="dropdown-portal"
                      style={{
                        position: 'fixed',
                        zIndex: 9999,
                        top: dropdownRef.current?.getBoundingClientRect().bottom + 'px',
                        left: dropdownRef.current?.getBoundingClientRect().right - 224 + 'px', // 224px = largeur du dropdown (w-56)
                      }}
                      className="w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
                    >
                      <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                        {/* Only show internal intern option if onAddNew is provided */}
                        {onAddNew && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddIntern();
                            }}
                            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left flex items-center"
                            role="menuitem"
                          >
                            <span className="mr-2 h-5 w-5 text-blue-500 flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                              </svg>
                            </span>
                            Stagiaire Interne
                          </button>
                        )}
                        
                        {/* Only show external intern option if onAddExtern is provided */}
                        {onAddExtern && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddExtern();
                            }}
                            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left flex items-center"
                            role="menuitem"
                          >
                            <span className="mr-2 h-5 w-5 text-green-500 flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                              </svg>
                            </span>
                            Stagiaire Externe
                          </button>
                        )}
                        
                        {/* If no options available, show a message */}
                        {!onAddNew && !onAddExtern && (
                          <div className="px-4 py-2 text-sm text-gray-500 text-center">
                            Aucune action disponible
                          </div>
                        )}
                      </div>
                    </div>,
                    document.body
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StagiaireHeader;