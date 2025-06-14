const Personnel = require('../models/personnel');
const mongoose = require('mongoose'); // Add this import at the top

// Obtenir tous les membres du personnel avec filtrage
exports.getAllPersonnel = async (req, res) => {
  try {
    const { 
      search = '', 
      status = 'all', 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      page = 1,
      limit = 50
    } = req.query;

    // Build query
    let query = {};

    // Search functionality
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query = {
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { nom: searchRegex },
          { email: searchRegex },
          { identifier: searchRegex },
          { poste: searchRegex },
          { departement: searchRegex }
        ]
      };
    }

    // Status filter
    if (status !== 'all') {
      query.statut = status;
    }

    // Sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const personnel = await Personnel.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Personnel.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      status: 'success',
      results: personnel.length,
      totalPages,
      currentPage: parseInt(page),
      data: {
        personnel
      }
    });
  } catch (error) {
    console.error('Error getting personnel:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la récupération du personnel'
    });
  }
};

// GET personnel by ID (improved with ObjectId validation)
exports.getPersonnelById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'ID de format invalide'
      });
    }
    
    const personnel = await Personnel.findById(id);
    if (!personnel) {
      return res.status(404).json({
        status: 'error',
        message: 'Employé non trouvé'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        personnel
      }
    });
  } catch (error) {
    console.error('Error getting personnel by ID:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la récupération de l\'employé'
    });
  }
};

// Add a new function to search by identifier:
exports.getPersonnelByIdentifier = async (req, res) => {
  try {
    const { identifier } = req.params;
    
    const personnel = await Personnel.findOne({ identifier });
    if (!personnel) {
      return res.status(404).json({
        status: 'error',
        message: 'Employé non trouvé avec cet identifiant'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        personnel
      }
    });
  } catch (error) {
    console.error('Error getting personnel by identifier:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la recherche de l\'employé'
    });
  }
};

// Créer un nouveau membre du personnel
exports.createPersonnel = async (req, res) => {
  try {
    const {
      identifier,
      firstName,
      lastName,
      email,
      telephone,
      poste,
      departement,
      dateEmbauche,
      statut,
      adresse
      // Removed permissions
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !telephone || !poste || !departement || !dateEmbauche) {
      return res.status(400).json({
        status: 'error',
        message: 'Tous les champs obligatoires doivent être remplis'
      });
    }

    // Check if email already exists
    const existingEmail = await Personnel.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({
        status: 'error',
        message: 'Un employé avec cet email existe déjà'
      });
    }

    // Check if identifier already exists (if provided)
    if (identifier) {
      const existingIdentifier = await Personnel.findOne({ identifier });
      if (existingIdentifier) {
        return res.status(400).json({
          status: 'error',
          message: 'Un employé avec cet identifiant existe déjà'
        });
      }
    }

    // Create new personnel
    const personnel = new Personnel({
      identifier,
      firstName,
      lastName,
      email: email.toLowerCase(),
      telephone,
      poste,
      departement,
      dateEmbauche,
      statut: statut || 'actif',
      adresse
      // Removed permissions
    });

    const savedPersonnel = await personnel.save();

    res.status(201).json({
      status: 'success',
      message: 'Employé créé avec succès',
      data: {
        personnel: savedPersonnel
      }
    });
  } catch (error) {
    console.error('Error creating personnel:', error);
    
    if (error.code === 11000) {
      // Handle duplicate key error
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        status: 'error',
        message: `Un employé avec cet ${field === 'email' ? 'email' : 'identifiant'} existe déjà`
      });
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        status: 'error',
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la création de l\'employé'
    });
  }
};

// Mettre à jour un membre du personnel
exports.updatePersonnel = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'ID de format invalide'
      });
    }
    
    const {
      identifier,
      firstName,
      lastName,
      email,
      telephone,
      poste,
      departement,
      dateEmbauche,
      statut,
      adresse
      // Removed permissions
    } = req.body;

    // Find the personnel
    const personnel = await Personnel.findById(id);
    if (!personnel) {
      return res.status(404).json({
        status: 'error',
        message: 'Employé non trouvé'
      });
    }

    // Check if email is being changed and if it already exists
    if (email && email.toLowerCase() !== personnel.email) {
      const existingEmail = await Personnel.findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: id }
      });
      if (existingEmail) {
        return res.status(400).json({
          status: 'error',
          message: 'Un employé avec cet email existe déjà'
        });
      }
    }

    // Check if identifier is being changed and if it already exists
    if (identifier && identifier !== personnel.identifier) {
      const existingIdentifier = await Personnel.findOne({ 
        identifier: identifier,
        _id: { $ne: id }
      });
      if (existingIdentifier) {
        return res.status(400).json({
          status: 'error',
          message: 'Un employé avec cet identifiant existe déjà'
        });
      }
    }

    // Update personnel (removed permissions)
    const updatedPersonnel = await Personnel.findByIdAndUpdate(
      id,
      {
        identifier: identifier || personnel.identifier,
        firstName,
        lastName,
        email: email ? email.toLowerCase() : personnel.email,
        telephone,
        poste,
        departement,
        dateEmbauche,
        statut,
        adresse
        // Removed permissions
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'Employé mis à jour avec succès',
      data: {
        personnel: updatedPersonnel
      }
    });
  } catch (error) {
    console.error('Error updating personnel:', error);
    
    if (error.code === 11000) {
      // Handle duplicate key error for both email and identifier
      const field = Object.keys(error.keyPattern)[0];
      const fieldName = field === 'email' ? 'email' : 
                       field === 'identifier' ? 'identifiant' : field;
      return res.status(400).json({
        status: 'error',
        message: `Un employé avec cet ${fieldName} existe déjà`
      });
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        status: 'error',
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la mise à jour de l\'employé'
    });
  }
};

// Obtenir des statistiques sur le personnel
exports.getPersonnelStats = async (req, res) => {
  try {
    // Get total count
    const totalPersonnel = await Personnel.countDocuments();
    
    // Get active count
    const activePersonnel = await Personnel.countDocuments({ statut: 'actif' });
    
    // Get inactive count
    const inactivePersonnel = await Personnel.countDocuments({ statut: 'inactif' });
    
    // Get count by department
    const departmentStats = await Personnel.aggregate([
      {
        $group: {
          _id: '$departement',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // Get count by position
    const positionStats = await Personnel.aggregate([
      {
        $group: {
          _id: '$poste',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // Get recent hires (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentHires = await Personnel.countDocuments({
      dateEmbauche: { $gte: thirtyDaysAgo }
    });

    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          total: totalPersonnel,
          active: activePersonnel,
          inactive: inactivePersonnel,
          recentHires,
          departmentBreakdown: departmentStats,
          positionBreakdown: positionStats
        }
      }
    });
  } catch (error) {
    console.error('Error getting personnel stats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la récupération des statistiques du personnel'
    });
  }
};

// Obtenir le planning d'un membre du personnel
exports.getPersonnelSchedule = async (req, res) => {
  try {
    const personnel = await Personnel.findById(req.params.id);
    
    if (!personnel) {
      return res.status(404).json({
        status: 'fail',
        message: 'Personnel not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        schedule: personnel.schedule || {}
      }
    });
  } catch (error) {
    console.error('Error getting personnel schedule:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Mettre à jour le planning d'un membre du personnel
exports.updatePersonnelSchedule = async (req, res) => {
  try {
    const personnel = await Personnel.findById(req.params.id);
    
    if (!personnel) {
      return res.status(404).json({
        status: 'fail',
        message: 'Personnel not found'
      });
    }
    
    // Mettre à jour le planning
    personnel.schedule = req.body.schedule;
    await personnel.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        schedule: personnel.schedule
      }
    });
  } catch (error) {
    console.error('Error updating personnel schedule:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// DELETE personnel
exports.deletePersonnel = async (req, res) => {
  try {
    const { id } = req.params;
    
    const personnel = await Personnel.findById(id);
    if (!personnel) {
      return res.status(404).json({
        status: 'error',
        message: 'Employé non trouvé'
      });
    }

    await Personnel.findByIdAndDelete(id);

    res.status(200).json({
      status: 'success',
      message: 'Employé supprimé avec succès'
    });
  } catch (error) {
    console.error('Error deleting personnel:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la suppression de l\'employé'
    });
  }
};