const jwt = require('jsonwebtoken');
const { User } = require('../models');

exports.getAdmins = async (req, res) => {
  try {
    const admins = await User.find({}).select('-password');
    res.status(200).json(admins);
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des administrateurs', error: error.message });
  }
};

// Create a new admin user
exports.createAdmin = async (req, res) => {
  try {
    const { firstName, lastName, email, password, permissions, status } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'Tous les champs requis doivent être remplis' });
    }
    
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Un utilisateur avec cet email existe déjà' });
    }
    
    // Create the new admin user
    const newAdmin = new User({
      firstName,
      lastName,
      email,
      password, // Will be hashed by the model's pre-save hook
      role: 'admin', // Always set role to admin for this endpoint
      permissions: permissions || ['view'],
      status: status || 'active',
    });
    
    await newAdmin.save();
    
    // Don't return the password
    const adminToReturn = { ...newAdmin._doc };
    delete adminToReturn.password;
    
    res.status(201).json({ message: 'Administrateur créé avec succès', user: adminToReturn });
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ message: 'Erreur lors de la création de l\'administrateur', error: error.message });
  }
};

// Update an existing user (admin)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Updating user ${id} with data:`, req.body); // Log the incoming data
    
    // Find the user to update
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Log the user before changes
    console.log("User before update:", user);
    
    // Update user fields - explicitly set each field
    if (req.body.firstName) user.firstName = req.body.firstName;
    if (req.body.lastName) user.lastName = req.body.lastName;
    if (req.body.email) user.email = req.body.email;
    if (req.body.permissions) user.permissions = req.body.permissions;
    if (req.body.status) user.status = req.body.status;
    
    // Explicitly update the role
    if (req.body.role && ['user', 'admin', 'superadmin'].includes(req.body.role)) {
      console.log(`Changing role from ${user.role} to ${req.body.role}`);
      user.role = req.body.role;
    }
    
    // Only update password if provided
    if (req.body.password) {
      user.password = req.body.password; // Will be hashed by the model's pre-save hook
    }
    
    // Save the updated user
    await user.save();
    
    // Log the user after changes
    console.log("User after update:", user);
    
    // Don't return the password
    const userToReturn = user.toObject();
    delete userToReturn.password;
    
    res.status(200).json({ 
      message: 'Utilisateur mis à jour avec succès', 
      user: userToReturn 
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la mise à jour de l\'utilisateur', 
      error: error.message 
    });
  }
};

// Delete a user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the user to delete
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Don't allow deleting self
    if (req.user.id === id) {
      return res.status(400).json({ message: 'Vous ne pouvez pas supprimer votre propre compte' });
    }
    
    await User.findByIdAndDelete(id);
    
    res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'utilisateur', error: error.message });
  }
};

exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        message: 'Aucun fichier n\'a été téléchargé' 
      });
    }

    // Get file path (relative to server)
    const filePath = `${req.file.path}`.replace(/\\/g, '/');
    
    // Create full URL
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const avatarUrl = `${baseUrl}/${filePath}`;
    
    // Update user with avatar URL using findByIdAndUpdate
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarUrl },
      { 
        new: true,        // Return updated document
        runValidators: false // Skip validation since we're only updating avatar
      }
    );
    
    if (!updatedUser) {
      return res.status(404).json({ 
        message: 'Utilisateur non trouvé'
      });
    }

    res.status(200).json({
      message: 'Avatar mis à jour avec succès',
      avatar: updatedUser.avatar
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({
      message: 'Erreur lors du téléchargement de l\'avatar',
      error: error.message
    });
  }
};