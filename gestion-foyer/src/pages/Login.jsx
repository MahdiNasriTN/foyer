import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LockClosedIcon, 
  ExclamationCircleIcon, 
  UserCircleIcon,
  HomeIcon,
  ChevronRightIcon
} from '@heroicons/react/outline';
import { login } from '../services/api';

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  
  // Animation states
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Trigger entrance animations
    setIsVisible(true);
    
    // Preload background image
    const img = new Image();
    img.src = '/images/dormitory-bg.jpg';  // Make sure this image exists in your public folder
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing again
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await login(credentials);
      // Get the token and user data from the response
      const { token, data } = response;
      
      // Call the onLogin function from props instead of setAuthenticated
      onLogin(data.user, token);
      
      // Navigate to dashboard
      navigate('/');
    } catch (err) {
      setError(err.message || 'Une erreur s\'est produite. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Left side - Visual */}
      <div className="hidden md:flex md:w-1/2 relative bg-gradient-to-br from-blue-800 to-indigo-900 text-white overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[url('/images/dormitory-bg.jpg')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-800/80 to-indigo-900/80"></div>
        
        {/* Abstract shapes */}
        <div className="absolute -bottom-32 -left-40 w-80 h-80 border-4 border-opacity-30 border-t-8 border-white rounded-full"></div>
        <div className="absolute -bottom-40 -left-20 w-120 h-120 border-4 border-opacity-30 border-t-8 border-white rounded-full"></div>
        <div className="absolute top-10 right-20 w-28 h-28 border border-opacity-10 border-white rounded-full"></div>
        <div className="absolute top-0 -right-16 w-40 h-40 border border-opacity-10 border-white rounded-full"></div>
        
        {/* Content */}
        <div className="relative h-full flex flex-col justify-between px-12 py-16">
          {/* Logo area */}
          <div 
            className={`transition-all duration-1000 ease-out transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
          >
            <div className="flex items-center space-x-3">
              <div className="bg-white rounded-xl p-2.5 shadow-lg">
                <HomeIcon className="h-6 w-6 text-indigo-700" />
              </div>
              <h1 className="text-2xl font-bold">Foyer Manager</h1>
            </div>
          </div>
          
          {/* Middle area - feature highlights */}
          <div className="my-auto space-y-8">
            <div 
              className={`transition-all delay-300 duration-1000 ease-out transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
            >
              <h2 className="text-3xl font-bold mb-8 mt-12">Bienvenue dans votre espace de gestion</h2>
              <p className="text-blue-100 max-w-xs mb-12">
                Simplifiez la gestion quotidienne des stagiaires, des chambres, des repas et des activités
              </p>
            </div>
            
            <div 
              className={`space-y-6 transition-all delay-500 duration-1000 ease-out transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
            >
              {[
                { title: "Gestion des stagiaires", desc: "Suivez les informations et les paiements" },
                { title: "Planning des chambres", desc: "Optimisez l'occupation des espaces" },
                { title: "Organisation des cuisine", desc: "Planifiez les menus et les services" }
              ].map((feature, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0 p-2 bg-white/10 rounded-lg">
                    <ChevronRightIcon className="h-5 w-5 text-blue-200" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium">{feature.title}</h3>
                    <p className="text-sm text-blue-200">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Bottom area */}
          <div 
            className={`transition-all delay-700 duration-1000 ease-out transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
          >
            <div className="pt-6 text-sm border-t border-blue-800/50">
              <p className="text-blue-200">
                © 2025 Foyer Manager. Tous droits réservés.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - Login form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16 bg-gray-50">
        <div 
          className={`max-w-md w-full space-y-8 transition-all duration-1000 ease-out transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
        >
          {/* Mobile logo - only visible on mobile */}
          <div className="md:hidden flex items-center justify-center space-x-3 mb-10">
            <div className="bg-indigo-700 rounded-xl p-2.5 shadow-lg">
              <HomeIcon className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-indigo-700">Foyer Manager</h1>
          </div>
          
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-1">Administration du Foyer</h2>
            <p className="text-base text-gray-600">
              Connectez-vous pour accéder au panneau d'administration
            </p>
          </div>
          
          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm flex items-start" role="alert">
              <ExclamationCircleIcon className="h-5 w-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
              <span className="text-red-800">{error}</span>
            </div>
          )}
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserCircleIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    className="appearance-none block w-full pl-10 px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                    placeholder="Entrez votre email"
                    value={credentials.email}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Mot de passe
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    className="appearance-none block w-full pl-10 px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                    placeholder="Entrez votre mot de passe"
                    value={credentials.password}
                    onChange={handleChange}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-600 focus:outline-none"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Se souvenir de moi
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Mot de passe oublié ?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white ${
                  isLoading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-150 ease-out shadow-sm hover:shadow`}
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  'Se connecter'
                )}
              </button>
            </div>
          </form>
          
          <div className="border-t border-gray-200 pt-6 mt-10">
            <div className="text-sm text-center text-gray-500">
              <p>Pour la démonstration, laissez les champs vides et cliquez sur "Se connecter"</p>
              <p className="text-gray-400 mt-3 text-xs">(Cette instruction est à supprimer en production)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;