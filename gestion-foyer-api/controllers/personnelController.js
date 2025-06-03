const Personnel = require('../models/personnel');

// Obtenir tous les membres du personnel avec filtrage
exports.getAllPersonnel = async (req, res) => {
  try {
    const { status, department, role, fonction, search, startDate, endDate } = req.query;
    
    console.log('Query parameters received:', req.query);
    
    // Start with empty conditions array
    let conditions = [];
    
    // Handle status filter
    if (status && status !== 'all') {
      if (status === 'active') {
        conditions.push({
          $or: [
            { status: 'active' },
            { statut: 'actif' },
            { isActive: true },
            { active: true }
          ]
        });
      } else if (status === 'inactive') {
        conditions.push({
          $or: [
            { status: 'inactive' },
            { statut: 'inactif' },
            { isActive: false },
            { active: false }
          ]
        });
      }
    }
    
    // Handle department filter - check your Personnel model for the correct field name
    if (department && department !== 'all') {
      conditions.push({ departement: department }); // or { department: department }
    }
    
    // Handle role filter
    if (role && role !== 'all') {
      conditions.push({ role: role });
    }
    
    // Handle fonction filter
    if (fonction && fonction !== 'all') {
      conditions.push({ fonction: fonction });
    }
    
    // Handle search filter
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      conditions.push({
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { prenom: searchRegex },
          { nom: searchRegex },
          { email: searchRegex }
        ]
      });
    }
    
    // Handle date range filter
    if (startDate || endDate) {
      const dateFilter = {};
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) dateFilter.$lte = new Date(endDate);
      
      conditions.push({
        $or: [
          { hireDate: dateFilter },
          { dateEmbauche: dateFilter },
          { createdAt: dateFilter }
        ]
      });
    }
    
    // Build final filter
    let filter = {};
    if (conditions.length > 0) {
      filter = { $and: conditions };
    }
    
    console.log('Final filter object:', JSON.stringify(filter, null, 2));
    
    // Execute the query
    const personnel = await Personnel.find(filter).sort({ createdAt: -1 });
    
    console.log(`Found ${personnel.length} personnel members`);
    
    res.status(200).json({
      status: 'success',
      results: personnel.length,
      data: personnel
    });
    
  } catch (error) {
    console.error('Error in getAllPersonnel:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la récupération du personnel',
      error: error.message
    });
  }
};

// Obtenir un membre du personnel par ID
exports.getPersonnelById = async (req, res) => {
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
      data: personnel
    });
  } catch (error) {
    console.error('Error fetching personnel by ID:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Créer un nouveau membre du personnel
exports.createPersonnel = async (req, res) => {
  try {
    // Vérifier si l'email existe déjà
    const existingPersonnel = await Personnel.findOne({ email: req.body.email });
    if (existingPersonnel) {
      return res.status(400).json({
        status: 'fail',
        message: 'Un employé avec cet email existe déjà'
      });
    }
    
    const newPersonnel = await Personnel.create(req.body);
    
    res.status(201).json({
      status: 'success',
      data: newPersonnel
    });
  } catch (error) {
    console.error('Error creating personnel:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Mettre à jour un membre du personnel
exports.updatePersonnel = async (req, res) => {
  try {
    // Vérifier si l'email existe déjà pour un autre employé
    if (req.body.email) {
      const existingPersonnel = await Personnel.findOne({ 
        email: req.body.email,
        _id: { $ne: req.params.id }
      });
      
      if (existingPersonnel) {
        return res.status(400).json({
          status: 'fail',
          message: 'Un employé avec cet email existe déjà'
        });
      }
    }
    
    const updatedPersonnel = await Personnel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedPersonnel) {
      return res.status(404).json({
        status: 'fail',
        message: 'Personnel not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: updatedPersonnel
    });
  } catch (error) {
    console.error('Error updating personnel:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Supprimer un membre du personnel
exports.deletePersonnel = async (req, res) => {
  try {
    const personnel = await Personnel.findByIdAndDelete(req.params.id);
    
    if (!personnel) {
      return res.status(404).json({
        status: 'fail',
        message: 'Personnel not found'
      });
    }
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    console.error('Error deleting personnel:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Obtenir des statistiques sur le personnel
exports.getPersonnelStats = async (req, res) => {
  try {
    const total = await Personnel.countDocuments();
    const active = await Personnel.countDocuments({ statut: 'actif' });
    const inactive = await Personnel.countDocuments({ statut: 'inactif' });
    
    // Répartition par département
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
    
    // Transformer le résultat en objet
    const departments = departmentStats.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});
    
    // Répartition par rôle
    const roleStats = await Personnel.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Transformer le résultat en objet
    const roles = roleStats.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});
    
    res.status(200).json({
      status: 'success',
      data: {
        total,
        active,
        inactive,
        activeRate: Math.round((active / total) * 100),
        departments,
        roles
      }
    });
  } catch (error) {
    console.error('Error fetching personnel stats:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
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