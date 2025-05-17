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

const Header = ({ onLogout }) => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Notifications fictives pour la démo
  const notifications = [
    { id: 1, message: "Nouvel étudiant enregistré", time: "Il y a 5 min", isRead: false },
    { id: 2, message: "Chambre 203 libérée", time: "Il y a 2h", isRead: false },
    { id: 3, message: "Tâche de cuisine assignée", time: "Hier, 18:45", isRead: true },
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

  return (
    <header 
      className={`bg-white sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'shadow-md' : 'shadow-sm'
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
          {/* Barre de recherche avec animation */}
          <div className="relative hidden md:block group">
            <input
              type="text"
              placeholder="Rechercher..."
              className="pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-48 transition-all duration-300 focus:w-64"
            />
            <SearchIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
          </div>
          
          <button className="md:hidden">
            <SearchIcon className="h-6 w-6 text-gray-500" />
          </button>
          
          {/* Date et heure actuelles */}
          <div className="hidden md:flex flex-col items-end">
            <p className="text-sm font-medium text-gray-900">{timeString}</p>
            <p className="text-xs text-gray-500">{dateString}</p>
          </div>

          {/* Notifications avec badge et menu déroulant */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Notifications"
            >
              {unreadCount > 0 ? (
                <>
                  <BellIconSolid className="h-6 w-6 text-primary" />
                  <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                </>
              ) : (
                <BellIcon className="h-6 w-6 text-gray-500" />
              )}
            </button>
            
            {/* Menu des notifications */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 border border-gray-200 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-gray-800">Notifications</h3>
                    <button className="text-xs text-primary hover:text-primary-dark">
                      Marquer tout comme lu
                    </button>
                  </div>
                </div>
                
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-start ${
                          notification.isRead ? 'opacity-70' : ''
                        }`}
                      >
                        <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${
                          notification.isRead ? 'bg-gray-300' : 'bg-primary'
                        }`}></div>
                        <div className="ml-3">
                          <p className="text-sm text-gray-800">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{notification.time}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center text-gray-500">
                      Aucune notification
                    </div>
                  )}
                </div>
                
                <div className="border-t border-gray-100 px-4 py-2">
                  <button className="text-sm text-primary hover:text-primary-dark w-full text-center">
                    Voir toutes les notifications
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Menu utilisateur avec dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-1 hover:bg-gray-100 p-2 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                <UserCircleIcon className="h-6 w-6" />
              </div>
              <span className="hidden sm:inline text-sm font-medium">Admin</span>
              <ChevronDownIcon className="h-4 w-4 text-gray-500" />
            </button>
            
            {/* Menu utilisateur */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border border-gray-200 z-50">
                <Link to="/profil" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <UserCircleIcon className="h-4 w-4 mr-2" />
                  <span>Mon profil</span>
                </Link>
                <Link to="/parametres" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Paramètres</span>
                </Link>
                <hr className="my-1 border-gray-200" />
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