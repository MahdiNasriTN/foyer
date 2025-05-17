const { Stagiaire, Chambre } = require('../models');

// Fonction pour récupérer tous les stagiaires avec filtres
exports.getAllStagiaires = async (req, res) => {
  try {
    // Construction de la requête MongoDB avec les filtres
    let query = {};
    
    // Filtrage par statut (actif/inactif)
    if (req.query.status === 'active') {
      const now = new Date();
      query = {
        $and: [
          { dateArrivee: { $lte: now } },
          { dateDepart: { $gte: now } }
        ]
      };
    } else if (req.query.status === 'inactive') {
      const now = new Date();
      query = {
        $or: [
          { dateArrivee: { $gt: now } },
          { dateDepart: { $lt: now } }
        ]
      };
    }
    
    // Filtrage par chambre
    if (req.query.room === 'withRoom') {
      query.chambre = { $ne: null };
      
      // Filtrage par numéro de chambre spécifique
      if (req.query.specificRoom) {
        query.chambre = req.query.specificRoom;
      }
    } else if (req.query.room === 'withoutRoom') {
      query.chambre = null;
    }
    
    // Filtrage par sexe
    if (req.query.gender && req.query.gender !== 'all') {
      query.sexe = req.query.gender;
    }
    
    // Filtrage par session
    if (req.query.session === 'septembre') {
      query.dateArrivee = { $gte: new Date('2023-09-01'), $lt: new Date('2023-10-01') };
    } else if (req.query.session === 'novembre') {
      query.dateArrivee = { $gte: new Date('2023-11-01'), $lt: new Date('2023-12-01') };
    } else if (req.query.session === 'fevrier') {
      query.dateArrivee = { $gte: new Date('2024-02-01'), $lt: new Date('2024-03-01') };
    }
    
    // Filtrage par dates
    if (req.query.startDate && req.query.endDate) {
      query.dateArrivee = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    } else if (req.query.startDate) {
      query.dateArrivee = { $gte: new Date(req.query.startDate) };
    } else if (req.query.endDate) {
      query.dateArrivee = { $lte: new Date(req.query.endDate) };
    }

    // Ajouter le tri dans la fonction getAllStagiaires
    const sortField = req.query.sortBy || 'nom';
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;

    // Exécution de la requête
    const stagiaires = await Stagiaire.find(query)
      .populate('chambre')
      .sort({ [sortField]: sortOrder });

    res.status(200).json({
      status: 'success',
      results: stagiaires.length,
      data: {
        stagiaires
      }
    });
  } catch (error) {
    console.error('Error getting stagiaires:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get a single stagiaire
exports.getStagiaire = async (req, res) => {
  try {
    const stagiaire = await Stagiaire.findById(req.params.id)
      .populate('chambre', 'numero capacite etage');
    
    if (!stagiaire) {
      return res.status(404).json({
        status: 'fail',
        message: 'Stagiaire not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { stagiaire }
    });
  } catch (error) {
    console.error('Error getting stagiaire:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving stagiaire'
    });
  }
};

// Ajouter cette fonction pour créer des stagiaires internes/externes sans distinction
exports.createStagiaire = async (req, res) => {
  try {
    // Vérifier si un stagiaire avec cet email existe déjà
    const existingStagiaire = await Stagiaire.findOne({ email: req.body.email });
    if (existingStagiaire) {
      return res.status(400).json({
        status: 'fail',
        message: 'Un stagiaire avec cet email existe déjà'
      });
    }
    
    // Si une chambre est fournie, vérifier qu'elle existe
    if (req.body.chambre) {
      const chambre = await Chambre.findById(req.body.chambre);
      if (!chambre) {
        return res.status(400).json({
          status: 'fail',
          message: 'ID de chambre invalide'
        });
      }
    }
    
    // Vérifier que le type est valide
    if (req.body.type && !['interne', 'externe'].includes(req.body.type)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Le type de stagiaire doit être "interne" ou "externe"'
      });
    }
    
    // Créer le nouveau stagiaire
    const stagiaire = await Stagiaire.create(req.body);

    res.status(201).json({
      status: 'success',
      data: { stagiaire }
    });
  } catch (error) {
    console.error('Erreur lors de la création du stagiaire:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Ajouter ces deux fonctions spécialisées
exports.createInternStagiaire = async (req, res) => {
  try {
    // S'assurer que le type est toujours 'interne'
    const stagiaireData = {
      ...req.body,
      type: 'interne'
    };
    
    // Vérifier si un stagiaire avec cet email existe déjà
    const existingStagiaire = await Stagiaire.findOne({ email: stagiaireData.email });
    if (existingStagiaire) {
      return res.status(400).json({
        status: 'fail',
        message: 'Un stagiaire avec cet email existe déjà'
      });
    }
    
    // Créer le nouveau stagiaire
    const stagiaire = await Stagiaire.create(stagiaireData);

    res.status(201).json({
      status: 'success',
      data: { stagiaire }
    });
  } catch (error) {
    console.error('Erreur lors de la création du stagiaire interne:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.createExternStagiaire = async (req, res) => {
  try {
    // S'assurer que le type est toujours 'externe'
    const stagiaireData = {
      ...req.body,
      type: 'externe'
    };
    
    // Vérifier si un stagiaire avec cet email existe déjà
    const existingStagiaire = await Stagiaire.findOne({ email: stagiaireData.email });
    if (existingStagiaire) {
      return res.status(400).json({
        status: 'fail',
        message: 'Un stagiaire avec cet email existe déjà'
      });
    }
    
    // Créer le nouveau stagiaire
    const stagiaire = await Stagiaire.create(stagiaireData);

    res.status(201).json({
      status: 'success',
      data: { stagiaire }
    });
  } catch (error) {
    console.error('Erreur lors de la création du stagiaire externe:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Update a stagiaire
exports.updateStagiaire = async (req, res) => {
  try {
    // If trying to update email, check if it already exists
    if (req.body.email) {
      const existingStagiaire = await Stagiaire.findOne({ 
        email: req.body.email,
        _id: { $ne: req.params.id }
      });
      
      if (existingStagiaire) {
        return res.status(400).json({
          status: 'fail',
          message: 'A stagiaire with this email already exists'
        });
      }
    }
    
    // If chambre is provided, verify it exists
    if (req.body.chambre) {
      const chambre = await Chambre.findById(req.body.chambre);
      if (!chambre) {
        return res.status(400).json({
          status: 'fail',
          message: 'Invalid chambre ID provided'
        });
      }
    }
    
    // Update stagiaire
    const stagiaire = await Stagiaire.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('chambre', 'numero capacite');
    
    if (!stagiaire) {
      return res.status(404).json({
        status: 'fail',
        message: 'Stagiaire not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { stagiaire }
    });
  } catch (error) {
    console.error('Error updating stagiaire:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Delete a stagiaire
exports.deleteStagiaire = async (req, res) => {
  try {
    const stagiaire = await Stagiaire.findByIdAndDelete(req.params.id);
    
    if (!stagiaire) {
      return res.status(404).json({
        status: 'fail',
        message: 'Stagiaire not found'
      });
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    console.error('Error deleting stagiaire:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting stagiaire'
    });
  }
};

// Search stagiaires
exports.searchStagiaires = async (req, res) => {
  try {
    const { query } = req.params;
    
    // Create search regex (case insensitive)
    const searchRegex = new RegExp(query, 'i');
    
    // Search in multiple fields
    const stagiaires = await Stagiaire.find({
      $or: [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex }
      ]
    }).populate('chambre', 'numero');

    res.status(200).json({
      status: 'success',
      results: stagiaires.length,
      data: { stagiaires }
    });
  } catch (error) {
    console.error('Error searching stagiaires:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error searching stagiaires'
    });
  }
};

// Ajouter cette méthode à votre contrôleur de stagiaires
exports.getAvailableStagiaires = async (req, res) => {
  try {
    let query = {};
    
    // Si on recherche des stagiaires sans chambre
    if (req.query.chambreStatus === 'disponible') {
      query.chambre = { $exists: false };
    }
    
    // Si on recherche par nom
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query = {
        ...query,
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { email: searchRegex }
        ]
      };
    }
    
    // Trouver les stagiaires correspondants à la requête
    const stagiaires = await Stagiaire.find(query)
      .select('_id firstName lastName email phoneNumber profilePhoto chambre');
    
    res.status(200).json({
      status: 'success',
      results: stagiaires.length,
      data: stagiaires
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};