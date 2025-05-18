const { Stagiaire, Chambre } = require('../models');

// Fonction pour récupérer tous les stagiaires avec filtres
exports.getAllStagiaires = async (req, res) => {
  try {
    // Construction de la requête MongoDB avec les filtres
    let query = {};
    
    // Log all incoming query parameters
    console.log('Request query params:', req.query);
    
    // Add search functionality
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query = {
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { email: searchRegex },
          { identifier: searchRegex },
          { entreprise: searchRegex }
        ]
      };
      console.log('Added search query:', JSON.stringify(query));
    }
    
    // Filtrage par statut (actif/inactif)
    if (req.query.status === 'active') {
      const now = new Date();
      const statusQuery = {
        $and: [
          { dateArrivee: { $lte: now } },
          { dateDepart: { $gte: now } }
        ]
      };
      
      // Combine with existing query
      query = req.query.search 
        ? { $and: [query, statusQuery] }
        : statusQuery;
    } else if (req.query.status === 'inactive') {
      const now = new Date();
      const statusQuery = {
        $or: [
          { dateArrivee: { $gt: now } },
          { dateDepart: { $lt: now } }
        ]
      };
      
      // Combine with existing query
      query = req.query.search 
        ? { $and: [query, statusQuery] }
        : statusQuery;
    }
    
    // Filtrage par chambre
    if (req.query.room === 'withRoom') {
      const roomQuery = { chambre: { $ne: null } };
      
      // Combine with existing query
      query = Object.keys(query).length > 0
        ? { $and: [query, roomQuery] }
        : roomQuery;
        
      // Filtrage par numéro de chambre spécifique
      if (req.query.specificRoom) {
        query.chambre = req.query.specificRoom;
      }
    } else if (req.query.room === 'withoutRoom') {
      const roomQuery = { chambre: null };
      
      // Combine with existing query
      query = Object.keys(query).length > 0
        ? { $and: [query, roomQuery] }
        : roomQuery;
    }
    
    // Filtrage par sexe
    if (req.query.gender && req.query.gender !== 'all') {
      const genderQuery = { sexe: req.query.gender };
      
      // Combine with existing query
      query = Object.keys(query).length > 0
        ? { $and: [query, genderQuery] }
        : genderQuery;
    }
    
    // Filtrage par session (cycle) et année
    if (req.query.session && req.query.session !== 'all') {
      // Map the session parameter to the cycle field values
      let cycleValue;
      if (req.query.session === 'septembre') {
        cycleValue = 'sep';
      } else if (req.query.session === 'novembre') {
        cycleValue = 'nov';
      } else if (req.query.session === 'fevrier') {
        cycleValue = 'fev';
      }
      
      console.log(`Session param: ${req.query.session} -> mapped to cycle value: ${cycleValue}`);
      
      // Create the cycle query
      const cycleQuery = { cycle: cycleValue };
      
      // If year is specified, add sessionYear to the query
      if (req.query.year && req.query.year !== 'all') {
        const yearQuery = { sessionYear: req.query.year.toString() };
        console.log(`Year filter: ${req.query.year}`);
        
        // Combine cycle and year
        const sessionQuery = {
          $and: [cycleQuery, yearQuery]
        };
        
        // Combine with existing query
        query = Object.keys(query).length > 0
          ? { $and: [query, sessionQuery] }
          : sessionQuery;
          
        console.log('Combined cycle + year query:', JSON.stringify(sessionQuery));
      } else {
        // Only filter by cycle without year
        // Combine with existing query
        query = Object.keys(query).length > 0
          ? { $and: [query, cycleQuery] }
          : cycleQuery;
          
        console.log('Cycle-only query (no year):', JSON.stringify(cycleQuery));
      }
    } else if (req.query.year && req.query.year !== 'all') {
      // If only year is specified (no specific session/cycle)
      const yearQuery = { sessionYear: req.query.year.toString() };
      console.log(`Year-only filter: ${req.query.year}`);
      
      // Combine with existing query
      query = Object.keys(query).length > 0
        ? { $and: [query, yearQuery] }
        : yearQuery;
    }
    
    // Filtrage par dates
    if (req.query.startDate && req.query.endDate) {
      const dateQuery = {
        dateArrivee: {
          $gte: new Date(req.query.startDate),
          $lte: new Date(req.query.endDate)
        }
      };
      
      // Combine with existing query
      query = Object.keys(query).length > 0
        ? { $and: [query, dateQuery] }
        : dateQuery;
    } else if (req.query.startDate) {
      const dateQuery = { dateArrivee: { $gte: new Date(req.query.startDate) } };
      
      // Combine with existing query
      query = Object.keys(query).length > 0
        ? { $and: [query, dateQuery] }
        : dateQuery;
    } else if (req.query.endDate) {
      const dateQuery = { dateArrivee: { $lte: new Date(req.query.endDate) } };
      
      // Combine with existing query
      query = Object.keys(query).length > 0
        ? { $and: [query, dateQuery] }
        : dateQuery;
    }

    // Ajouter le tri dans la fonction getAllStagiaires
    const sortField = req.query.sortBy || 'nom';
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;

    // Log query for debugging
    console.log('Final query:', JSON.stringify(query, null, 2));

    // Before executing the query, check if there are any stagiaires with the specified cycle
    const cycleCounts = await Stagiaire.aggregate([
      { $group: { _id: "$cycle", count: { $sum: 1 } } }
    ]);
    console.log('Available cycles in database:', cycleCounts);
    
    // If filtering by cycle, check specifically for that cycle
    if (req.query.session && req.query.session !== 'all') {
      let cycleValue;
      if (req.query.session === 'septembre') cycleValue = 'sep';
      else if (req.query.session === 'novembre') cycleValue = 'nov';
      else if (req.query.session === 'fevrier') cycleValue = 'fev';
      
      const cycleCheck = await Stagiaire.find({ cycle: cycleValue }).limit(1);
      console.log(`Quick check for cycle '${cycleValue}':`, cycleCheck.length > 0 ? 'Found' : 'Not found');
    }
    
    // Exécution de la requête
    const stagiaires = await Stagiaire.find(query)
      .populate('chambre')
      .sort({ [sortField]: sortOrder });

    console.log(`Query returned ${stagiaires.length} stagiaires`);
    
    // If no results, do a sanity check on the database
    if (stagiaires.length === 0) {
      const totalCount = await Stagiaire.countDocuments({});
      console.log(`Total stagiaires in database: ${totalCount}`);
      
      // Show a sample of the data structure
      if (totalCount > 0) {
        const sample = await Stagiaire.findOne({}).lean();
        console.log('Sample stagiaire data structure:', sample);
      }
    }

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
    // Check if a stagiaire with this email already exists
    const existingStagiaire = await Stagiaire.findOne({ email: req.body.email });
    if (existingStagiaire) {
      return res.status(400).json({
        status: 'fail',
        message: 'A stagiaire with this email already exists'
      });
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
    
    // Add default values for cycle and sessionYear if not provided
    const stagiaireData = {
      ...req.body,
      cycle: req.body.cycle || 'sep',
      sessionYear: req.body.sessionYear || new Date().getFullYear().toString()
    };
    
    // Create new stagiaire - identifier will be auto-generated by pre-save hook
    const stagiaire = await Stagiaire.create(stagiaireData);

    res.status(201).json({
      status: 'success',
      data: { stagiaire }
    });
  } catch (error) {
    console.error('Error creating stagiaire:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Ajouter ces deux fonctions spécialisées
exports.createInternStagiaire = async (req, res) => {
  try {
    // S'assurer que le type est toujours 'interne' et ajouter les valeurs par défaut
    const stagiaireData = {
      ...req.body,
      type: 'interne',
      cycle: req.body.cycle || 'sep',
      sessionYear: req.body.sessionYear || new Date().getFullYear().toString()
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
    // S'assurer que le type est toujours 'externe' et ajouter les valeurs par défaut
    const stagiaireData = {
      ...req.body,
      type: 'externe',
      cycle: req.body.cycle || 'sep',
      sessionYear: req.body.sessionYear || new Date().getFullYear().toString()
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