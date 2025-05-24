const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, restrictTo } = require('../middlewares/auth');
const multer = require('multer');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/avatars/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = file.originalname.split('.').pop();
    cb(null, `avatar-${req.user._id}-${uniqueSuffix}.${extension}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB max file size
  },
  fileFilter: fileFilter
});

// Avatar upload route
router.post('/avatar', protect, upload.single('avatar'), userController.uploadAvatar);

// Admin routes - all protected by authentication and admin authorization
router.get('/admins', protect, restrictTo('superadmin'), userController.getAdmins);
router.post('/admin', protect, restrictTo('superadmin'), userController.createAdmin);
router.put('/:id', protect, restrictTo('superadmin'), userController.updateUser);
router.delete('/:id', protect, restrictTo('superadmin'), userController.deleteUser);

module.exports = router;