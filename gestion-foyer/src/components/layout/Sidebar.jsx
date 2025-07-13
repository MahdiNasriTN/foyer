import React, { useState, useEffect, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  UsersIcon, 
  OfficeBuildingIcon, 
  UserGroupIcon, 
  CakeIcon,
  ChartPieIcon,
  CogIcon,
  LogoutIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardListIcon,
  DocumentTextIcon,
  BriefcaseIcon,
  UserIcon,
  AdjustmentsIcon
} from '@heroicons/react/outline';

import { 
  HomeIcon as HomeIconSolid,
  UsersIcon as UsersIconSolid,
  OfficeBuildingIcon as OfficeBuildingIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  CakeIcon as CakeIconSolid,
  ChartPieIcon as ChartPieIconSolid,
  ClipboardListIcon as ClipboardListIconSolid,
  DocumentTextIcon as DocumentTextIconSolid,
  BriefcaseIcon as BriefcaseIconSolid,
  UserIcon as UserIconSolid
} from '@heroicons/react/solid';
import { useUser } from '../../contexts/UserContext';

const Sidebar = ({ onLogout, onNavigateToEtudiants }) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [hoveredPath, setHoveredPath] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [hoverDelay, setHoverDelay] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Use the global user context instead of local state
  const { userData, loading, userInitials, avatarColor, userRole } = useUser();
  
  // Animation helpers
  const handleCollapse = () => {
    setAnimating(true);
    setCollapsed(!collapsed);
    setTimeout(() => setAnimating(false), 300);
  };
  
  // Update time
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      
      // Update date only if the day changes
      if (now.getDate() !== currentDate.getDate() || 
          now.getMonth() !== currentDate.getMonth() ||
          now.getFullYear() !== currentDate.getFullYear()) {
        setCurrentDate(now);
      }
    }, 10000); // update every 10 seconds
    
    return () => clearInterval(timer);
  }, [currentDate]);
  
  // Formatted time & date
  const timeString = useMemo(() => 
    currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    [currentTime]
  );
  
  const dateString = useMemo(() => 
    currentDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }),
    [currentDate]
  );
  
  // Hover effect for menu items with delay
  useEffect(() => {
    if (hoveredPath) {
      const timer = setTimeout(() => {
        setHoverDelay(true);
      }, 300);
      return () => {
        clearTimeout(timer);
        setHoverDelay(false);
      };
    }
  }, [hoveredPath]);

  // Définition des éléments de navigation - Ajout des dotColor pour tous les éléments
  // The complete updated navItems array
const navItems = [
  { 
    name: 'Tableau de Bord', 
    path: '/', 
    icon: <HomeIcon className="h-5 w-5" />,
    activeIcon: <HomeIconSolid className="h-5 w-5" />,
    dotColor: 'blue',
    description: 'Vue d\'ensemble et statistiques',
    color: '#3B82F6',
    hoverColor: '#60A5FA',
    lightColor: '#EFF6FF',
    category: 'main',
    roles: ['user', 'admin', 'superadmin'] // All roles can see this
  },
  
  { 
    name: 'Gestion des Stagiaires', 
    path: '/stagiaires', 
    icon: <BriefcaseIcon className="h-5 w-5" />,
    activeIcon: <BriefcaseIconSolid className="h-5 w-5" />,
    dotColor: 'blue',
    description: 'Gestion des stagiaires hébergés',
    color: '#8B5CF6',
    hoverColor: '#A78BFA',
    lightColor: '#F5F3FF',
    category: 'gestion',
    roles: ['admin', 'superadmin'] // Admin and superadmin only
  },
  
  { 
    name: 'Gestion des Chambres', 
    path: '/chambres', 
    icon: <OfficeBuildingIcon className="h-5 w-5" />,
    activeIcon: <OfficeBuildingIconSolid className="h-5 w-5" />,
    dotColor: 'green',
    description: 'Gestion des chambres et occupations',
    color: '#10B981',
    hoverColor: '#34D399',
    lightColor: '#ECFDF5',
    category: 'gestion',
    roles: ['admin', 'superadmin'] // Admin and superadmin only
  },
  { 
    name: 'Gestion du Personnel', 
    path: '/personnel', 
    icon: <UserIcon className="h-5 w-5" />,
    activeIcon: <UserIconSolid className="h-5 w-5" />,
    dotColor: 'indigo',
    description: 'Gestion du personnel',
    color: '#6366F1',
    hoverColor: '#818CF8',
    lightColor: '#EEF2FF',
    category: 'gestion',
    roles: ['admin', 'superadmin'] // Admin and superadmin only
  },
  { 
    name: 'Planning du Personnel', 
    path: '/schedule', 
    icon: <ClipboardListIcon className="h-5 w-5" />,
    activeIcon: <ClipboardListIconSolid className="h-5 w-5" />,
    dotColor: 'purple',
    description: 'Planning général du personnel',
    color: '#8B5CF6',
    hoverColor: '#A78BFA',
    lightColor: '#F5F3FF',
    category: 'gestion',
    roles: ['superadmin', 'admin'] // Superadmin only
  },
  { 
    name: 'Gestion de la Cuisine', 
    path: '/cuisine', 
    icon: <CakeIcon className="h-5 w-5" />,
    activeIcon: <CakeIconSolid className="h-5 w-5" />,
    dotColor: 'amber',
    description: 'Aperçu de la restauration',
    color: '#F59E0B',
    hoverColor: '#FBBF24',
    lightColor: '#FFFBEB',
    category: 'gestion',
    roles: ['admin', 'superadmin'] // Admin and superadmin only
  },
  
  { 
    name: 'Paramètres', 
    path: '/settings', 
    icon: <AdjustmentsIcon className="h-5 w-5" />,
    activeIcon: <AdjustmentsIcon className="h-5 w-5" />,
    dotColor: 'gray',
    description: 'Configuration du profil et du système',
    color: '#6B7280',
    hoverColor: '#9CA3AF',
    lightColor: '#F9FAFB',
    category: 'system',
    roles: ['superadmin'] // Superadmin only
  },
  // { 
  //   name: 'Documentation', 
  //   path: '/documentation', 
  //   icon: <DocumentTextIcon className="h-5 w-5" />,
  //   activeIcon: <DocumentTextIconSolid className="h-5 w-5" />,
  //   dotColor: 'blue',
  //   description: 'Guide d\'utilisation complet',
  //   color: '#3B82F6',
  //   hoverColor: '#60A5FA',
  //   lightColor: '#EFF6FF',
  //   category: 'support',
  //   roles: ['user', 'admin', 'superadmin'] // All roles can see this
  // },
];

  // Filter items based on user role from context
  const filteredNavItems = useMemo(() => {
    return navItems.filter(item => 
      item.roles && item.roles.includes(userRole)
    );
  }, [navItems, userRole]);

  // Grouper les éléments par catégorie
  const groupedNavItems = useMemo(() => {
    const groups = {};
    filteredNavItems.forEach(item => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    return groups;
  }, [filteredNavItems]);

  // Déterminer si un chemin est actif, même partiellement
  const isActivePath = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  // Obtenir la couleur du point en fonction de la valeur dotColor
  const getDotColor = (dotColor) => {
    switch(dotColor) {
      case 'blue': return 'bg-blue-600';
      case 'green': return 'bg-green-600';
      case 'amber': return 'bg-amber-500';
      case 'indigo': return 'bg-indigo-600';
      case 'gray': return 'bg-gray-500';
      default: return 'bg-blue-600';
    }
  };

  return (
    <div 
      className={`
        relative flex flex-col h-full transition-all duration-300 ease-in-out
        ${collapsed ? 'w-20' : 'w-72'} z-30
      `}
      style={{
        backgroundColor: '#111827',
        boxShadow: '0 0 20px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Collapse button - professionally styled */}
      <button 
        onClick={handleCollapse}
        className={`
          absolute -right-3 top-20 w-6 h-12 rounded-md z-50 
          bg-white shadow-lg flex items-center justify-center 
          transition-all duration-200 ease-in-out
          ${animating ? 'scale-95' : 'scale-100'}
          focus:outline-none
        `}
      >
        {collapsed ? 
          <ChevronRightIcon className="h-3.5 w-3.5 text-gray-700" /> : 
          <ChevronLeftIcon className="h-3.5 w-3.5 text-gray-700" />
        }
      </button>
    
      {/* Header section with logo */}
      <div 
        className={`flex items-center py-3 px-3 border-b border-gray-800 ${collapsed ? 'justify-center' : ''}`}
      >
        {collapsed ? (
          <div className="w-12 h-12 flex items-center justify-center">
            <img 
              src="logocenter.png" 
              alt="Logo" 
              className="w-12 h-12"
              style={{ 
                maxWidth: '100%',
                height: 'auto',
                filter: 'contrast(1.1) brightness(1.1)'
              }}
            />
          </div>
        ) : (
          <div className="flex items-center w-full space-x-3">
            <div className="flex-shrink-0">
              <img 
                src="logocenter.png" 
                alt="Logo" 
                className="w-24 h-24 rounded-full"
                style={{ 
                  maxWidth: '100%',
                  height: 'auto',
                  filter: 'contrast(1.1) brightness(1.1)'
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-white text-sm font-semibold leading-tight">
                CSFCC Sfax
              </h1>
            </div>
          </div>
        )}
      </div>
      
      {/* Date & time - professional styling */}
      {!collapsed && (
        <div className="px-5 py-4 border-b border-gray-800/50 flex items-center justify-between">
          <div className="flex items-center">
            <div className="text-sm font-medium text-gray-300">
              {dateString}
            </div>
          </div>
          <div className="px-2 py-1 rounded bg-gray-800 text-gray-300 text-xs font-medium">
            {timeString}
          </div>
        </div>
      )}
      
      {/* Navigation - professional styling */}
      <div className="flex-grow overflow-y-auto custom-scrollbar py-4">
        {Object.entries(groupedNavItems).map(([category, items], groupIndex) => (
          <div key={category} className={`mb-5 ${collapsed ? 'px-3' : 'px-4'}`}>
            {/* Category heading */}
            {!collapsed && (
              <div className="px-2 mb-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {category === 'main' ? 'Principal' : 
                   category === 'gestion' ? 'Gestion' : 
                   category === 'system' ? 'Système' : category}
                </h3>
              </div>
            )}
            
            {/* Items in this category */}
            <div className={`space-y-1 ${collapsed ? 'pt-2' : ''}`}>
              {items.map((item) => {
                const isActive = isActivePath(item.path);
                const isHovered = hoveredPath === item.path;
                const dotColorClass = getDotColor(item.dotColor);
                
                return (
                  <NavLink 
                    key={item.path} 
                    to={item.path}
                    className={`
                      group relative flex items-center rounded-lg transition-all duration-200
                      ${collapsed 
                        ? 'justify-center h-10 w-10 mx-auto' 
                        : 'mx-1 px-3 py-2.5'
                      }
                      ${isActive 
                        ? 'text-white' 
                        : 'text-gray-400 hover:text-white'}
                    `}
                    onMouseEnter={() => setHoveredPath(item.path)}
                    onMouseLeave={() => setHoveredPath(null)}
                  >
                    {({ isActive }) => (
                      <>
                        {/* Active indicator - subtle and professional */}
                        {isActive && (
                          <div 
                            className="absolute inset-0 rounded-lg opacity-10"
                            style={{ backgroundColor: item.color }}
                          ></div>
                        )}
                        
                        {/* Left border indicator */}
                        {isActive && !collapsed && (
                          <div 
                            className="absolute left-0 top-1/2 transform -translate-y-1/2 h-5 w-0.5 rounded-full"
                            style={{ backgroundColor: item.color }}
                          ></div>
                        )}
                        
                        {/* Icon container */}
                        <div 
                          className={`
                            flex items-center justify-center transition-all duration-200
                            ${collapsed ? 'w-6 h-6' : 'w-6 h-6 mr-3'}
                          `}
                          style={{ 
                            color: isActive ? item.color : 'currentColor'
                          }}
                        >
                          {isActive ? item.activeIcon : item.icon}
                        </div>
                        
                        {/* Text and additional elements - only in expanded mode */}
                        {!collapsed && (
                          <div className="flex-1 flex items-center min-w-0">
                            <span 
                              className="truncate text-sm font-medium"
                              style={{ 
                                color: isActive ? item.color : 'currentColor'
                              }}
                            >
                              {item.name}
                            </span>
                            
                            {/* Indicator dot only when active */}
                            {isActive && (
                              <div className={`ml-auto w-2.5 h-2.5 rounded-full flex-shrink-0 ${dotColorClass}`}></div>
                            )}
                          </div>
                        )}
                        
                        {/* Indicator dot in collapsed mode - only when active */}
                        {collapsed && isActive && (
                          <div className="absolute -top-1 -right-1">
                            <div className={`w-2.5 h-2.5 rounded-full ${dotColorClass}`}></div>
                          </div>
                        )}
                        
                        {/* Hover tooltip for collapsed menu - refined style */}
                        {collapsed && isHovered && hoverDelay && (
                          <div className="absolute left-full ml-2 px-3 py-2 min-w-[180px] rounded-md bg-gray-900 shadow-xl z-50 text-white text-xs font-medium">
                            <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-8 border-transparent border-r-gray-900"></div>
                            
                            <div className="font-semibold mb-1">{item.name}</div>
                            <div className="text-xs text-gray-400">{item.description}</div>
                            
                            {/* Display dot indicator in tooltip only when active */}
                            {isActive && (
                              <div className="mt-2 flex items-center text-xs text-gray-400">
                                <div className={`w-2 h-2 rounded-full mr-1.5 ${dotColorClass}`}></div>
                                Actif
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      {/* User profile section - professional design */}
      <div className={`p-4 border-t border-gray-800 ${collapsed ? 'flex justify-center pb-6' : ''}`}>
        {collapsed ? (
          <button 
            onClick={onLogout}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 text-red-500"
            title="Déconnexion"
          >
            <LogoutIcon className="h-4 w-4" />
          </button>
        ) : (
          <div className="flex items-center space-x-3">
            <div className="relative">
              {userData?.avatar ? (
                <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-700">
                  <img 
                    src={userData.avatar} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 border border-gray-700">
                  <span className="text-sm font-bold text-white">{userInitials}</span>
                </div>
              )}
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-gray-900"></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white truncate capitalize">
                {loading ? 'Chargement...' : userRole}
              </div>
              <div className="text-xs text-gray-400 flex items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></div>
                Connecté
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="p-1.5 rounded-full bg-gray-800 hover:bg-gray-700 text-red-500"
              title="Déconnexion"
            >
              <LogoutIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      
      {/* Custom styles for professional look */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(107, 114, 128, 0.5);
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(107, 114, 128, 0.7);
        }
      `}</style>
    </div>
  );
};

export default Sidebar;