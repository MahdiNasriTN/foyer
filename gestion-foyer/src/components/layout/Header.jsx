import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  BellIcon,
  SearchIcon,
  LogoutIcon,
  MenuIcon,
  UserCircleIcon,
  ChevronDownIcon
} from '@heroicons/react/outline';
import { BellIcon as BellIconSolid } from '@heroicons/react/solid';
import { useUser } from '../../contexts/UserContext';

const Header = ({ onLogout }) => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const { userData, loading, userInitials, avatarColor } = useUser();

  // Notifications fictives pour la démo
  const notifications = [
  ];

  // Effet pour détecter le scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Mettre à jour l'heure toutes les minutes
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Format de l'heure actuelle
  const timeString = currentTime.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const dateString = currentTime.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  // Notification non lues
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Fonction pour obtenir les informations de page en fonction du chemin actuel
  const getPageInfo = () => {
    const path = location.pathname;

    // Correspondance des chemins aux titres de page
    const routeMap = {
      '/': 'Tableau de bord',
      '/stagiaires': 'Gestion des Stagiaires',
      '/personnel': 'Gestion du Personnel',
      '/chambres': 'Gestion des Chambres',
      '/cuisine': 'Gestion de la Cuisine',
      '/parametres': 'Paramètres'
    };

    // Si le chemin exact correspond à une entrée dans routeMap
    if (routeMap[path]) {
      return {
        title: routeMap[path],
        path: path
      };
    }

    // Pour les sous-pages ou les pages dynamiques (ex: /stagiaires/123)
    for (const [route, title] of Object.entries(routeMap)) {
      if (path.startsWith(route) && route !== '/') {
        const subPath = path.substring(route.length);
        // Si c'est un ID ou un sous-chemin
        if (subPath.startsWith('/')) {
          return {
            title: title,
            path: route,
            subTitle: 'Détails',
            subPath: path
          };
        }
      }
    }

    // Fallback pour les pages non trouvées
    return {
      title: 'Page',
      path: '/'
    };
  };

  const pageInfo = getPageInfo();
  const displayName = userData?.firstName && userData?.lastName
    ? `${userData.firstName} ${userData.lastName}`
    : userData?.email?.split('@')[0] || 'Utilisateur';

  return (
    <header
      className={`bg-white sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'shadow-md' : 'shadow-sm'
        }`}
    >
      <div className="h-16 px-6 flex items-center justify-between">
        {/* Partie gauche */}
        <div className="flex items-center space-x-4">
          <button className="lg:hidden">
            <MenuIcon className="h-6 w-6 text-gray-500" />
          </button>
          <h2 className="text-xl font-semibold text-primary hidden md:block">
            Administration du Foyer
          </h2>
          <h2 className="text-lg font-semibold text-primary md:hidden">
            Admin Foyer
          </h2>
        </div>

        {/* Partie droite */}
        <div className="flex items-center space-x-5">

          <button className="md:hidden">
            <SearchIcon className="h-6 w-6 text-gray-500" />
          </button>

          {/* Date et heure actuelles */}
          <div className="hidden md:flex flex-col items-end">
            <p className="text-sm font-medium text-gray-900">{timeString}</p>
            <p className="text-xs text-gray-500">{dateString}</p>
          </div>


          {/* Menu utilisateur avec dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 hover:bg-gray-100 p-2 rounded-lg transition-colors"
            >
              {/* Profile Image or Initials */}
              <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
                {userData?.avatar ? (
                  <img
                    src={userData.avatar}
                    alt={displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div
                    className="h-full w-full flex items-center justify-center"
                    style={{ backgroundColor: avatarColor }}
                  >
                    <span className="text-sm font-bold text-white">
                      {userInitials}
                    </span>
                  </div>
                )}
              </div>

              {/* User Name and Role */}
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900 leading-tight">
                  {loading ? 'Chargement...' : displayName}
                </p>
                <p className="text-xs text-gray-500 leading-tight capitalize">
                  {userData?.role || 'Utilisateur'}
                </p>
              </div>
              <ChevronDownIcon className="h-4 w-4 text-gray-500" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border border-gray-200 z-50">
                <div className="px-4 py-2 border-b border-gray-100 sm:hidden">
                  <p className="text-sm font-medium text-gray-900">{displayName}</p>
                  <p className="text-xs text-gray-500">{userData.email}</p>
                </div>

                {/* Show Settings link only for superadmin */}
                {userData && userData.role === 'superadmin' && (
                  <Link to="/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Paramètres</span>
                  </Link>
                )}

                {/* Show divider only if Settings is shown */}
                {userData && userData.role === 'superadmin' && (
                  <hr className="my-1 border-gray-200" />
                )}

                <button
                  onClick={onLogout}
                  className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogoutIcon className="h-4 w-4 mr-2" />
                  <span>Déconnexion</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Breadcrumb ou fil d'Ariane dynamique */}
      <div className="px-6 py-2 bg-gray-50 text-xs text-gray-500 hidden md:block">
        <div className="flex items-center space-x-1">
          <Link to="/" className="hover:text-primary">Accueil</Link>
          {pageInfo.path !== '/' && (
            <>
              <span>/</span>
              <Link to={pageInfo.path} className={`hover:text-primary ${!pageInfo.subTitle ? 'text-gray-700 font-medium' : ''}`}>
                {pageInfo.title}
              </Link>
            </>
          )}
          {pageInfo.subTitle && (
            <>
              <span>/</span>
              <Link to={pageInfo.subPath} className="text-gray-700 font-medium">
                {pageInfo.subTitle}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;