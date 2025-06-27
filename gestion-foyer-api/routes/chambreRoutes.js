const express = require('express');
const chambreController = require('../controllers/chambreController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

// Protéger toutes les routes avec l'authentification
router.use(protect);

/**
 * @swagger
 * /api/v1/chambres:
 *   get:
 *     tags:
 *       - Chambres
 *     summary: Récupérer toutes les chambres
 *     description: Récupère la liste complète des chambres avec possibilité de filtres
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [disponible, occupee, en_maintenance, all]
 *         description: Filtrer par statut de la chambre
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [garcon, fille, all]
 *         description: Filtrer par type de chambre
 *       - in: query
 *         name: batiment
 *         schema:
 *           type: string
 *         description: Filtrer par bâtiment
 *     responses:
 *       200:
 *         description: Liste des chambres récupérée avec succès
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
 *                   example: 50
 *                 data:
 *                   type: object
 *                   properties:
 *                     chambres:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Chambre'
 *       401:
 *         description: Non authentifié
 *       500:
 *         description: Erreur serveur
 */
/**
 * @swagger
 * /api/v1/chambres:
 *   post:
 *     tags:
 *       - Chambres
 *     summary: Créer une nouvelle chambre
 *     description: Ajoute une nouvelle chambre dans la base de données
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Chambre'
 *     responses:
 *       201:
 *         description: Chambre créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     chambre:
 *                       $ref: '#/components/schemas/Chambre'
 *       400:
 *         description: Erreur de validation
 *       401:
 *         description: Non authentifié
 *       500:
 *         description: Erreur serveur
 */
router
  .route('/')
  .get(chambreController.getAllChambres)
  .post(chambreController.createChambre);

/**
 * @swagger
 * /api/v1/chambres/{id}:
 *   get:
 *     tags:
 *       - Chambres
 *     summary: Récupérer une chambre par ID
 *     description: Récupère les détails d'une chambre spécifique
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la chambre
 *     responses:
 *       200:
 *         description: Chambre récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     chambre:
 *                       $ref: '#/components/schemas/Chambre'
 *       404:
 *         description: Chambre non trouvée
 *       401:
 *         description: Non authentifié
 *       500:
 *         description: Erreur serveur
 */
/**
 * @swagger
 * /api/v1/chambres/{id}:
 *   put:
 *     tags:
 *       - Chambres
 *     summary: Mettre à jour une chambre
 *     description: Met à jour les détails d'une chambre existante
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la chambre
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Chambre'
 *     responses:
 *       200:
 *         description: Chambre mise à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     chambre:
 *                       $ref: '#/components/schemas/Chambre'
 *       400:
 *         description: Erreur de validation
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Chambre non trouvée
 *       500:
 *         description: Erreur serveur
 */
/**
 * @swagger
 * /api/v1/chambres/{id}:
 *   delete:
 *     tags:
 *       - Chambres
 *     summary: Supprimer une chambre
 *     description: Supprime une chambre de la base de données
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la chambre
 *     responses:
 *       204:
 *         description: Chambre supprimée avec succès
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Chambre non trouvée
 *       500:
 *         description: Erreur serveur
 */
router
  .route('/:id')
  .get(chambreController.getChambre)
  .put(chambreController.updateChambre)
  .delete(chambreController.deleteChambre);

/**
 * @swagger
 * /api/v1/chambres/{id}/occupants:
 *   post:
 *     tags:
 *       - Chambres
 *     summary: Assigner des occupants à une chambre
 *     description: Assigne un ou plusieurs stagiaires à une chambre spécifique
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la chambre
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - stagiaires
 *             properties:
 *               stagiaires:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Liste des IDs des stagiaires à assigner
 *     responses:
 *       200:
 *         description: Occupants assignés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     chambre:
 *                       $ref: '#/components/schemas/Chambre'
 *       400:
 *         description: Erreur (chambre pleine, incompatibilité de genre, etc.)
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Chambre ou stagiaire non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.post('/:id/occupants', chambreController.assignOccupants);

/**
 * @swagger
 * /api/v1/chambres/{id}/occupants:
 *   get:
 *     tags:
 *       - Chambres
 *     summary: Récupérer les occupants d'une chambre
 *     description: Récupère la liste des stagiaires qui occupent une chambre spécifique
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la chambre
 *     responses:
 *       200:
 *         description: Occupants récupérés avec succès
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
 *                   example: 2
 *                 data:
 *                   type: object
 *                   properties:
 *                     occupants:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Stagiaire'
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Chambre non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.get('/:id/occupants', chambreController.getChambreOccupants);
router.post('/:id/check-occupants', chambreController.checkOccupantsAvailability);
router.post('/:id/assign', chambreController.assignOccupants);
router.get('/:id/available-stagiaires', chambreController.getAvailableStagiairesForRoom);
router.get('/statistics', chambreController.getRoomStatistics);

module.exports = router;