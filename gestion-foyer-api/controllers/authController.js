const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
};

// Register new user
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        status: 'fail',
        message: 'User already exists with that email'
      });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'staff'
    });

    // Generate token
    const token = generateToken(user._id);

    // Send response
    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error creating user'
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Veuillez fournir un email et un mot de passe'
      });
    }

    // 2. Check if user exists and get password (which is usually not selected)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Email ou mot de passe incorrect'
      });
    }

    // 3. DEBUG: Check if password exists in user object
    console.log('Password field exists:', !!user.password);
    
    // 4. Check if password is correct - USING DIRECT BCRYPT COMPARE
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    
    // Debug the comparison
    console.log('Provided password:', password);
    console.log('Stored password hash exists:', !!user.password);
    console.log('Password comparison result:', isPasswordCorrect);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        status: 'error',
        message: 'Email ou mot de passe incorrect'
      });
    }

    // 5. Record login information
    const userAgent = req.headers['user-agent'] || '';
    
    // Simple device detection
    let device = 'Unknown Device';
    if (/Windows/.test(userAgent)) device = 'Windows PC';
    else if (/Macintosh|Mac OS X/.test(userAgent)) device = 'Mac';
    else if (/iPhone|iPad|iPod/.test(userAgent)) device = 'iOS Device';
    else if (/Android/.test(userAgent)) device = 'Android Device';
    
    // Simple browser detection
    let browser = 'Unknown Browser';
    if (/Chrome/.test(userAgent)) browser = 'Chrome';
    else if (/Firefox/.test(userAgent)) browser = 'Firefox';
    else if (/Safari/.test(userAgent)) browser = 'Safari';
    else if (/Edge/.test(userAgent)) browser = 'Edge';
    else if (/Opera|OPR/.test(userAgent)) browser = 'Opera';
    
    // IP and basic geolocation
    const ip = req.headers['x-forwarded-for'] || 
              req.socket.remoteAddress || 
              req.connection.remoteAddress;
    
    const location = 'Rabat, Maroc';
    
    // Update user's lastLogin information
    user.lastLogin = {
      timestamp: new Date(),
      device,
      browser,
      location,
      ip
    };
    
    // 6. IMPORTANT: Use validateBeforeSave: false to prevent rehashing the password
    await user.save({ validateBeforeSave: false });

    // 7. Create token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'my-ultra-secure-secret',
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '90d'
      }
    );

    // 8. Send response
    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          avatar: user.avatar
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la connexion'
    });
  }
};

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'No user found with that ID'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          telephone: user.telephone,
          role: user.role,
          avatar: user.avatar,
          lastLogin: user.lastLogin // Include the lastLogin information
        }
      }
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const { firstName, lastName, email, telephone, currentPassword, newPassword } = req.body;

    // 1. Find the current user with password
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Utilisateur non trouvé'
      });
    }

    // 2. If changing password, check current password
    if (currentPassword && newPassword) {
      // Debug
      console.log('Password change requested');
      console.log('Current password field exists:', !!user.password);
      
      // DIRECT BCRYPT COMPARISON
      const isCorrectPassword = await bcrypt.compare(currentPassword, user.password);
      
      console.log('Password comparison result:', isCorrectPassword);

      if (!isCorrectPassword) {
        return res.status(400).json({
          status: 'error',
          message: 'Le mot de passe actuel est incorrect'
        });
      }

      // 3. Set new password - hash is handled in the pre-save hook
      user.password = newPassword;
      console.log('New password set, will be hashed by pre-save hook');
    }

    // 4. Update user info
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (telephone) user.telephone = telephone;

    // 5. Save the user
    await user.save();

    // 6. Return updated user without password
    res.status(200).json({
      status: 'success',
      message: 'Profil mis à jour avec succès',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          telephone: user.telephone,
          role: user.role,
          avatar: user.avatar
        }
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      status: 'error',
      message: `Erreur lors de la mise à jour du profil: ${error.message}`
    });
  }
};

// Get current user info
exports.getMe = async (req, res) => {
  try {
    // The user should be available from the protect middleware
    const userId = req.user.id;
    
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving user profile'
    });
  }
};