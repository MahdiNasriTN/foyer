const express = require('express');
const personnelController = require('../controllers/personnelController');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

// Protéger toutes les routes
router.use(authMiddleware.protect);

/**
 * @swagger
 * /api/personnel/stats:
 *   get:
 *     tags:
 *       - Personnel
 *     summary: Statistiques du personnel
 *     description: Récupère les statistiques globales du personnel
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques récupérées avec succès
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
 *                     stats:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           fonction:
 *                             type: string
 *                             example: "surveillant"
 *                           count:
 *                             type: integer
 *                             example: 5
 *                           percentage:
 *                             type: number
 *                             example: 33.3
 *       401:
 *         description: Non authentifié
 *       500:
 *         description: Erreur serveur
 */
router.get('/stats', personnelController.getPersonnelStats);

/**
 * @swagger
 * /api/personnel:
 *   get:
 *     tags:
 *       - Personnel
 *     summary: Récupérer tout le personnel
 *     description: Récupère la liste complète du personnel avec possibilité de filtres
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
 *         name: fonction
 *         schema:
 *           type: string
 *         description: Filtrer par fonction
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Rechercher par nom ou prénom
 *     responses:
 *       200:
 *         description: Liste du personnel récupérée avec succès
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
 *                   example: 15
 *                 data:
 *                   type: object
 *                   properties:
 *                     personnel:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Personnel'
 *       401:
 *         description: Non authentifié
 *       500:
 *         description: Erreur serveur
 */
/**
 * @swagger
 * /api/personnel:
 *   post:
 *     tags:
 *       - Personnel
 *     summary: Créer un nouveau membre du personnel
 *     description: Ajoute un nouveau membre du personnel dans la base de données
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Personnel'
 *     responses:
 *       201:
 *         description: Membre du personnel créé avec succès
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
 *                     personnel:
 *                       $ref: '#/components/schemas/Personnel'
 *       400:
 *         description: Erreur de validation
 *       401:
 *         description: Non authentifié
 *       500:
 *         description: Erreur serveur
 */
router.route('/')
  .get(personnelController.getAllPersonnel)
  .post(personnelController.createPersonnel);

/**
 * @swagger
 * /api/personnel/{id}:
 *   get:
 *     tags:
 *       - Personnel
 *     summary: Récupérer un membre du personnel par ID
 *     description: Récupère les détails d'un membre du personnel spécifique
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du membre du personnel
 *     responses:
 *       200:
 *         description: Membre du personnel récupéré avec succès
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
 *                     personnel:
 *                       $ref: '#/components/schemas/Personnel'
 *       404:
 *         description: Membre du personnel non trouvé
 *       401:
 *         description: Non authentifié
 *       500:
 *         description: Erreur serveur
 */
/**
 * @swagger
 * /api/personnel/{id}:
 *   put:
 *     tags:
 *       - Personnel
 *     summary: Mettre à jour un membre du personnel
 *     description: Met à jour les détails d'un membre du personnel existant
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du membre du personnel
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Personnel'
 *     responses:
 *       200:
 *         description: Membre du personnel mis à jour avec succès
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
 *                     personnel:
 *                       $ref: '#/components/schemas/Personnel'
 *       400:
 *         description: Erreur de validation
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Membre du personnel non trouvé
 *       500:
 *         description: Erreur serveur
 */
/**
 * @swagger
 * /api/personnel/{id}:
 *   delete:
 *     tags:
 *       - Personnel
 *     summary: Supprimer un membre du personnel
 *     description: Supprime un membre du personnel de la base de données
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du membre du personnel
 *     responses:
 *       204:
 *         description: Membre du personnel supprimé avec succès
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Membre du personnel non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.route('/:id')
  .get(personnelController.getPersonnelById)
  .put(personnelController.updatePersonnel)
  .delete(personnelController.deletePersonnel);

module.exports = router;