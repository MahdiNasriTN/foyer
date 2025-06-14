const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
// Make sure this path is correct - update if needed
const { protect } = require('../middlewares/auth');

// All routes require authentication
router.use(protect);

// General schedule routes
router.get('/general', scheduleController.getGeneralSchedule);
router.post('/general', scheduleController.saveGeneralSchedule);

// Summary route
router.get('/summary', scheduleController.getPersonnelScheduleSummary);

module.exports = router;