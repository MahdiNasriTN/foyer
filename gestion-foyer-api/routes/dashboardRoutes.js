const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const dashboardController = require('../controllers/dashboardController');

// All dashboard routes are protected
router.use(protect);

// Get all dashboard statistics
router.get('/stats', dashboardController.getDashboardStats);

module.exports = router;