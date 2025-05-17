const swaggerJsDoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Gestion de Foyer',
      version: '1.0.0',
      description: 'API pour la gestion du foyer, des stagiaires, des chambres et du personnel',
      contact: {
        name: 'Admin'
      },
      servers: [
        {
          url: 'http://localhost:5000',
          description: 'Serveur de développement'
        }
      ]
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './routes/*.js',
    './models/*.js',
    './controllers/*.js',
    './app.js'
  ]
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = swaggerDocs;