import React from 'react';
import CodeBlock from '../common/CodeBlock';
import AlertBox from '../common/AlertBox';

const Installation = ({ colorMode }) => {
  return (
    <section id="installation" className="mb-16">
      <h2 className={`text-2xl font-bold mb-6 pb-2 border-b ${
        colorMode === 'dark' ? 'border-gray-700' : 'border-gray-200'
      }`}>Installation</h2>
      
      <h3 id="prerequis" className="text-xl font-semibold mb-4">Prérequis</h3>
      
      <ul className={`list-disc pl-6 mb-6 ${
        colorMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
      }`}>
        <li className="mb-2">Node.js (v14.0.0 ou supérieur)</li>
        <li className="mb-2">npm (v6.0.0 ou supérieur) ou yarn (v1.22.0 ou supérieur)</li>
        <li className="mb-2">MongoDB (v4.4 ou supérieur)</li>
        <li>Git</li>
      </ul>
      
      <AlertBox
        type="info"
        title="Note pour Windows"
        colorMode={colorMode}
      >
        <p>
          Sur Windows, nous recommandons l'utilisation de WSL2 (Windows Subsystem for Linux) ou 
          Git Bash pour une meilleure compatibilité avec les commandes bash.
        </p>
      </AlertBox>
      
      <h3 id="instructions-installation" className="text-xl font-semibold mb-4">Instructions d'Installation</h3>
      
      <CodeBlock
        language="bash"
        title="Terminal"
        colorMode={colorMode}
      >{`# Cloner le dépôt
git clone https://github.com/sawsen/foyer

# Naviguer vers le répertoire du projet
cd ges_foyer

# Installer les dépendances frontend
cd ges_foyer
npm install

# Installer les dépendances backend
cd ../gestion_foyer_api
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer le fichier .env avec votre configuration

# Démarrer le serveur backend
nodemon server

# Dans un nouveau terminal, démarrer le frontend
cd ../ges_foyer
npm start`}</CodeBlock>
      
      <h3 id="options-configuration" className="text-xl font-semibold mb-4">Options de Configuration</h3>
      
      <p className="mb-4">
        L'application peut être configurée via des variables d'environnement. Créez un fichier <code>.env</code>
        dans les répertoires frontend et backend avec les variables suivantes:
      </p>
      
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div>
          <h4 className={`font-medium mb-2 pb-1 border-b ${
            colorMode === 'dark' ? 'border-gray-700' : 'border-gray-300'
          }`}>Backend (.env)</h4>
          <CodeBlock
            language="env"
            colorMode={colorMode}
          >{`PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/ges_foyer
JWT_SECRET=votre_secret_jwt
JWT_EXPIRE=30d`}</CodeBlock>
        </div>
        
        <div>
          <h4 className={`font-medium mb-2 pb-1 border-b ${
            colorMode === 'dark' ? 'border-gray-700' : 'border-gray-300'
          }`}>Frontend (.env)</h4>
          <CodeBlock
            language="env"
            colorMode={colorMode}
          >{`REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_DOMAIN=localhost:3000
REACT_APP_NAME=Gestionnaire de Foyer
REACT_APP_ENV=development`}</CodeBlock>
        </div>
      </div>
      
      <h3 className="text-xl font-semibold mb-4">Installation avec Docker</h3>
      
      <p className="mb-4">
        Si vous préférez utiliser Docker, nous fournissons également des fichiers Docker et Docker Compose:
      </p>
      
      <CodeBlock
        language="bash"
        title="Installation avec Docker"
        colorMode={colorMode}
      >{`# Cloner le dépôt
git clone https://github.com/yourusername/ges_foyer.git
cd ges_foyer

# Configurer les variables d'environnement
cp .env.example .env
# Éditer le fichier .env avec votre configuration

# Construire et démarrer les conteneurs
docker-compose up -d

# L'application sera disponible à l'adresse http://localhost:3000`}</CodeBlock>
      
      <AlertBox
        type="warning"
        title="Important"
        colorMode={colorMode}
      >
        <p>
          Pour les environnements de production, assurez-vous de modifier tous les mots de passe par défaut 
          et secrets JWT dans les fichiers .env. Utilisez des valeurs fortes et uniques.
        </p>
      </AlertBox>
      
      <h3 className="text-xl font-semibold mb-4">Vérification de l'installation</h3>
      
      <p className="mb-4">
        Après avoir terminé l'installation, vous pouvez vérifier que tout fonctionne correctement:
      </p>
      
      <ol className={`list-decimal pl-6 mb-6 ${
        colorMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
      }`}>
        <li className="mb-2">Ouvrez votre navigateur et accédez à <code>http://localhost:3000</code></li>
        <li className="mb-2">Vous devriez voir la page de connexion de l'application</li>
        <li className="mb-2">Vérifiez que l'API backend est accessible à <code>http://localhost:5000/api/status</code></li>
        <li>Connectez-vous avec les identifiants par défaut (voir section Démarrage Rapide)</li>
      </ol>
      
      <AlertBox
        type="success"
        title="Félicitations!"
        colorMode={colorMode}
      >
        <p>
          Si vous voyez la page de connexion et que l'API répond correctement, votre installation est réussie! 
          Vous pouvez maintenant passer au Guide de Démarrage Rapide pour commencer à utiliser l'application.
        </p>
      </AlertBox>
    </section>
  );
};

export default Installation;