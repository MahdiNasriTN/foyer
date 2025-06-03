import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Composants de layout
import DocHeader from '../components/documentation/layout/DocHeader';
import DocSidebar from '../components/documentation/layout/DocSidebar';
import DocTableOfContents from '../components/documentation/layout/DocTableOfContents';
import DocFooter from '../components/documentation/layout/DocFooter';

// Sections
import Introduction from '../components/documentation/sections/Introduction';
import Installation from '../components/documentation/sections/Installation';
import DemarrageRapide from '../components/documentation/sections/DemarrageRapide';
import GuideUtilisateur from '../components/documentation/sections/GuideUtilisateur';
import ReferenceAPI from '../components/documentation/sections/ReferenceAPI';
import Developpement from '../components/documentation/sections/Developpement';
import Securite from '../components/documentation/sections/Securite';
import Deploiement from '../components/documentation/sections/Deploiement';
import Support from '../components/documentation/sections/Support';
// Importer d'autres sections au besoin

// Structure de la documentation
import { docSections } from '../data/documentationData';

const Documentation = () => {
  const { sectionId, subsectionId } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('commencer');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tocVisible, setTocVisible] = useState(false);
  const [colorMode, setColorMode] = useState('light'); // 'light' ou 'dark'
  
  // Définir la section active à partir des paramètres d'URL
  useEffect(() => {
    if (sectionId) {
      // Vérifier si la section existe dans nos données
      const validSection = docSections.some(s => s.id === sectionId);
      if (validSection) {
        setActiveSection(sectionId);
      } else {
        // Rediriger vers une section par défaut si la section n'existe pas
        navigate('/documentation/commencer', { replace: true });
      }
    }
  }, [sectionId, navigate]);

  // Gérer le défilement et la visibilité de la table des matières
  useEffect(() => {
    const handleScroll = () => {
      setTocVisible(window.scrollY > 150);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Filtrer les sections par requête de recherche
  const filteredSections = !searchQuery 
    ? docSections 
    : docSections.map(section => ({
        ...section,
        subsections: section.subsections.filter(subsection => 
          subsection.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(section => 
        section.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        section.subsections.length > 0
      );

  // Trouver la section active
  const activeSectionData = docSections.find(section => section.id === activeSection) || docSections[0];

  // Fonction pour basculer le mode de couleur
  const toggleColorMode = () => {
    setColorMode(colorMode === 'light' ? 'dark' : 'light');
  };

  // Afficher la section de contenu correspondante
  const renderContent = () => {
    
    // Normaliser l'ID (enlever les accents)
    const normalizedId = sectionId?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    
    switch (normalizedId) {
      case 'commencer':
        return <Introduction colorMode={colorMode} />;
      case 'installation':
        return <Installation colorMode={colorMode} />;
      case 'demarrage-rapide':
        return <DemarrageRapide colorMode={colorMode} />;
      case 'guide-utilisateur':
        return <GuideUtilisateur colorMode={colorMode} />;
      case 'reference-api':
        return <ReferenceAPI colorMode={colorMode} />;
      case 'developpement':
        return <Developpement colorMode={colorMode} />;
      case 'securite':
        return <Securite colorMode={colorMode} />;
      case 'deploiement':
        return <Deploiement colorMode={colorMode} />;
      case 'support':
        return <Support colorMode={colorMode} />;
      default:
        return <Introduction colorMode={colorMode} />;
    }
  };

  return (
    <div className={`min-h-screen ${colorMode === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
      {/* En-tête Mobile */}
      <DocHeader 
        colorMode={colorMode}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Disposition Principale */}
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar */}
        <DocSidebar 
          colorMode={colorMode}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          filteredSections={filteredSections}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          toggleColorMode={toggleColorMode}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        {/* Contenu Principal */}
        <div className="flex-1">
          {/* Table des matières fixe pour les grands écrans */}
          <DocTableOfContents 
            colorMode={colorMode}
            tocVisible={tocVisible}
            activeSectionData={activeSectionData}
          />

          {/* En-tête du Contenu */}
          <div className={`sticky top-0 z-10 px-6 py-4 border-b border-gray-200 ${
            colorMode === 'dark' ? 'bg-gray-900/80' : 'bg-white/80'
          } backdrop-blur-sm`}>
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              <div>
                <h1 className="text-3xl font-bold flex items-center">
                  {activeSectionData.icon && (
                    <span className={`mr-3 ${colorMode === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                      {activeSectionData.icon}
                    </span>
                  )}
                  {activeSectionData.title}
                </h1>
              </div>
              <div className="flex items-center space-x-2">
                <a 
                  href={`https://github.com/yourusername/ges_foyer/edit/main/docs/${activeSection}.md`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center text-sm ${
                    colorMode === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Modifier cette page
                </a>
              </div>
            </div>
          </div>

          {/* Contenu Principal de la Documentation */}
          <div className="mx-auto max-w-4xl px-6 py-10">
            {renderContent()}
            
            {/* Pied de page avec navigation */}
            <DocFooter 
              colorMode={colorMode}
              activeSection={activeSection}
              docSections={docSections}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documentation;