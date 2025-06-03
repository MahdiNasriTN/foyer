const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect } = require('../middlewares/auth');

// Protect all dashboard routes
router.use(protect);

// Dashboard statistics routes
router.get('/stats', dashboardController.getDashboardStats);
router.get('/quick-stats', dashboardController.getQuickStats);

module.exports = router;