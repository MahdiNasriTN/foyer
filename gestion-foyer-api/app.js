// app.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./config/swagger');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Import routes
const authRoutes = require('./routes/authRoutes');
const stagiaireRoutes = require('./routes/stagiaireRoutes');
const chambreRoutes = require('./routes/chambreRoutes');
const dashboardRoutes = require('./routes/dashboard');
const personnelRoutes = require('./routes/personnelRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const userRoutes = require('./routes/userRoutes');
// Initialize express app
const app = express();

/**
 * @swagger
 * components:
 *   schemas:
 *     Error:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: error
 *         message:
 *           type: string
 *           example: Error message
 */

// Middlewares
app.use(cors({
  origin: process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000' 
    : process.env.FRONTEND_URL,
  credentials: true
}));

// Increase the limit for JSON and URL encoded data
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Swagger docs route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, { 
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "API Gestion de Foyer"
}));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/stagiaires', stagiaireRoutes);
app.use('/api/v1/chambres', chambreRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/personnel', personnelRoutes);
app.use('/api/v1/schedules', scheduleRoutes);
app.use('/api/v1/users', userRoutes);

/**
 * @swagger
 * /:
 *   get:
 *     summary: Vérifier si l'API fonctionne
 *     description: Route de base pour vérifier que l'API est opérationnelle
 *     responses:
 *       200:
 *         description: Confirmation que l'API est en cours d'exécution
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: API is running
 */
// Root route
app.get('/', (req, res) => {
  res.send('API is running');
});

// Make the uploads directory available publicly
app.use('/uploads', express.static('uploads'));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Create avatars subdirectory if it doesn't exist
const avatarsDir = path.join(uploadsDir, 'avatars');
if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir);
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

module.exports = app;