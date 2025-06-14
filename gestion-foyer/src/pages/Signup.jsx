// Create src/pages/Signup.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LockClosedIcon, 
  ExclamationCircleIcon, 
  UserCircleIcon,
  HomeIcon,
  ChevronRightIcon,
  EyeIcon,
  EyeOffIcon,
  CheckCircleIcon,
  UserAddIcon
} from '@heroicons/react/outline';

const Signup = ({ onSignup }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Password strength checker
  useEffect(() => {
    if (formData.password) {
      let strength = 0;
      const feedback = [];
      
      if (formData.password.length >= 8) {
        strength += 1;
      } else {
        feedback.push('Au moins 8 caractères');
      }
      
      if (/[A-Z]/.test(formData.password)) {
        strength += 1;
      } else {
        feedback.push('Au moins une majuscule');
      }
      
      if (/[a-z]/.test(formData.password)) {
        strength += 1;
      } else {
        feedback.push('Au moins une minuscule');
      }
      
      if (/[0-9]/.test(formData.password)) {
        strength += 1;
      } else {
        feedback.push('Au moins un chiffre');
      }
      
      if (/[^A-Za-z0-9]/.test(formData.password)) {
        strength += 1;
      } else {
        feedback.push('Au moins un caractère spécial');
      }
      
      setPasswordStrength(strength);
      setPasswordFeedback(feedback.join(' • '));
    } else {
      setPasswordStrength(0);
      setPasswordFeedback('');
    }
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError('Le prénom est requis');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('Le nom est requis');
      return false;
    }
    if (!formData.email.trim()) {
      setError('L\'email est requis');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Email invalide');
      return false;
    }
    if (!formData.password) {
      setError('Le mot de passe est requis');
      return false;
    }
    if (passwordStrength < 3) {
      setError('Le mot de passe n\'est pas assez fort');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Call the signup API
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1'}/auth/setup-superadmin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          role: 'superadmin'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Une erreur s\'est produite');
      }

      // Call the onSignup function to handle login
      onSignup(data.data.user, data.token);
      
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
      <div className="hidden md:flex md:w-1/2 relative bg-gradient-to-br from-emerald-800 to-teal-900 text-white overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-800/80 to-teal-900/80"></div>
        
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
                <HomeIcon className="h-6 w-6 text-emerald-700" />
              </div>
              <h1 className="text-2xl font-bold">Foyer Manager</h1>
            </div>
          </div>
          
          {/* Middle area - setup info */}
          <div className="my-auto space-y-8">
            <div 
              className={`transition-all delay-300 duration-1000 ease-out transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
            >
              <h2 className="text-3xl font-bold mb-8 mt-12">Configuration Initiale</h2>
              <p className="text-emerald-100 max-w-xs mb-12">
                Créez le premier compte super administrateur pour commencer à utiliser Foyer Manager
              </p>
            </div>
            
            <div 
              className={`space-y-6 transition-all delay-500 duration-1000 ease-out transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
            >
              {[
                { title: "Accès complet", desc: "Gérez tous les aspects du système" },
                { title: "Gestion des utilisateurs", desc: "Créez et gérez d'autres administrateurs" },
                { title: "Configuration système", desc: "Personnalisez les paramètres globaux" }
              ].map((feature, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0 p-2 bg-white/10 rounded-lg">
                    <CheckCircleIcon className="h-5 w-5 text-emerald-200" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium">{feature.title}</h3>
                    <p className="text-sm text-emerald-200">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Bottom area */}
          <div 
            className={`transition-all delay-700 duration-1000 ease-out transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
          >
            <div className="pt-6 text-sm border-t border-emerald-800/50">
              <p className="text-emerald-200">
                © 2025 Foyer Manager. Configuration initiale sécurisée.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - Signup form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16 bg-gray-50">
        <div 
          className={`max-w-md w-full space-y-8 transition-all duration-1000 ease-out transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
        >
          {/* Mobile logo */}
          <div className="md:hidden flex items-center justify-center space-x-3 mb-10">
            <div className="bg-emerald-700 rounded-xl p-2.5 shadow-lg">
              <HomeIcon className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-emerald-700">Foyer Manager</h1>
          </div>
          
          <div>
            <div className="flex items-center justify-center mb-4">
              <div className="bg-emerald-100 rounded-full p-3">
                <UserAddIcon className="h-8 w-8 text-emerald-600" />
              </div>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-1 text-center">Configuration Initiale</h2>
            <p className="text-base text-gray-600 text-center">
              Créez le premier compte super administrateur
            </p>
          </div>
          
          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm flex items-start" role="alert">
              <ExclamationCircleIcon className="h-5 w-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
              <span className="text-red-800">{error}</span>
            </div>
          )}
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* First Name */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  Prénom <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-all"
                    placeholder="Entrez votre prénom"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Nom <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-all"
                    placeholder="Entrez votre nom"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email <span className="text-red-500">*</span>
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
                    className="appearance-none block w-full pl-10 px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-all"
                    placeholder="admin@exemple.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Mot de passe <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    className="appearance-none block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-all"
                    placeholder="Créez un mot de passe sécurisé"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-600 focus:outline-none"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                
                {/* Password strength indicator */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className={`h-2.5 rounded-full transition-all duration-300 ${
                          passwordStrength < 2 ? 'bg-red-500' :
                          passwordStrength < 4 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`} style={{ width: `${passwordStrength * 20}%` }}></div>
                      </div>
                      <span className="ml-2 text-xs font-medium text-gray-500">
                        {passwordStrength < 2 ? 'Faible' :
                         passwordStrength < 4 ? 'Moyen' :
                         'Fort'}
                      </span>
                    </div>
                    {passwordFeedback && (
                      <p className="mt-1 text-xs text-gray-500">
                        {passwordFeedback}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirmer le mot de passe <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    className="appearance-none block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-all"
                    placeholder="Confirmez votre mot de passe"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-600 focus:outline-none"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white ${
                  isLoading ? 'bg-emerald-400' : 'bg-emerald-600 hover:bg-emerald-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-150 ease-out shadow-sm hover:shadow`}
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  'Créer le compte Super Administrateur'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;