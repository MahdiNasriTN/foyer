const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const { protect } = require('../middlewares/auth');

// All routes require authentication
router.use(protect);

// General schedule routes
router.get('/general', scheduleController.getGeneralSchedule);
router.post('/general', scheduleController.saveGeneralSchedule);

// Delete specific shift
router.delete('/shift/:personnelId/:day', scheduleController.deleteShift);

// Summary route
router.get('/summary', scheduleController.getPersonnelScheduleSummary);

module.exports = router;