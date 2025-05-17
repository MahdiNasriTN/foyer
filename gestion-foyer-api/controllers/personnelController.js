const Personnel = require('../models/personnel');

// Obtenir tous les membres du personnel avec filtrage
exports.getAllPersonnel = async (req, res) => {
  try {
    const query = {};
    
    // Filtrage par statut
    if (req.query.status && req.query.status !== 'all') {
      query.statut = req.query.status;
    }
    
    // Filtrage par département
    if (req.query.department && req.query.department !== 'all') {
      query.departement = req.query.department;
    }
    
    // Filtrage par rôle
    if (req.query.role && req.query.role !== 'all') {
      query.role = req.query.role;
    }
    
    // Filtrage par date d'embauche
    if (req.query.startDate && req.query.endDate) {
      query.dateEmbauche = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    } else if (req.query.startDate) {
      query.dateEmbauche = { $gte: new Date(req.query.startDate) };
    } else if (req.query.endDate) {
      query.dateEmbauche = { $lte: new Date(req.query.endDate) };
    }
    
    // Recherche par texte
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { poste: searchRegex },
        { departement: searchRegex }
      ];
    }
    
    const personnel = await Personnel.find(query).sort({ createdAt: -1 });
    
    res.status(200).json({
      status: 'success',
      results: personnel.length,
      data: personnel
    });
  } catch (error) {
    console.error('Error fetching personnel:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
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