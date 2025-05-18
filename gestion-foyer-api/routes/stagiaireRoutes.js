// routes/stagiaireRoutes.js
const express = require('express');
const stagiaireController = require('../controllers/stagiaireController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

// Appliquer middleware d'authentification à toutes les routes
router.use(protect);

/**
 * @swagger
 * /api/stagiaires:
 *   get:
 *     tags:
 *       - Stagiaires
 *     summary: Récupérer tous les stagiaires
 *     description: Récupère la liste des stagiaires avec filtres
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, all]
 *         description: Filtrer par statut d'activité
 *       - in: query
 *         name: room
 *         schema:
 *           type: string
 *           enum: [withRoom, withoutRoom, all]
 *         description: Filtrer par attribution de chambre
 *       - in: query
 *         name: gender
 *         schema:
 *           type: string
 *           enum: [garcon, fille, all]
 *         description: Filtrer par genre
 *       - in: query
 *         name: specificRoom
 *         schema:
 *           type: string
 *         description: ID d'une chambre spécifique
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Champ pour le tri
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Ordre de tri
 *     responses:
 *       200:
 *         description: Liste des stagiaires récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: integer
 *                   example: 10
 *                 data:
 *                   type: object
 *                   properties:
 *                     stagiaires:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Stagiaire'
 *       401:
 *         description: Non authentifié
 *       500:
 *         description: Erreur serveur
 */
router.route('/').get(stagiaireController.getAllStagiaires);

/**
 * @swagger
 * /api/stagiaires:
 *   post:
 *     tags:
 *       - Stagiaires
 *     summary: Créer un nouveau stagiaire
 *     description: Crée un nouveau stagiaire dans la base de données
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Stagiaire'
 *     responses:
 *       201:
 *         description: Stagiaire créé avec succès
 *       400:
 *         description: Erreur de validation
 *       401:
 *         description: Non authentifié
 */
router.route('/').post(stagiaireController.createStagiaire);

// ALL SPECIFIC ROUTES WITH FIXED PATHS MUST COME BEFORE /:id ROUTES
// Routes spécifiques pour le type de stagiaire
router.post('/intern', stagiaireController.createInternStagiaire);
router.post('/extern', stagiaireController.createExternStagiaire);

// Ajouter cette route
router.get('/available', stagiaireController.getAvailableStagiaires);

// Route de recherche - MUST COME BEFORE /:id routes!
router.get('/search/:query', stagiaireController.searchStagiaires);

// EXPORT ROUTES - MUST COME BEFORE /:id routes!
router.get('/export', stagiaireController.exportStagiaires);

// ONLY AFTER all other routes, define the /:id routes
router
  .route('/:id')
  .get(stagiaireController.getStagiaire)
  .put(stagiaireController.updateStagiaire)
  .delete(stagiaireController.deleteStagiaire);

// Route with :id that has additional path - comes after basic /:id routes
router.get('/:id/export', stagiaireController.exportStagiaire);

module.exports = router;