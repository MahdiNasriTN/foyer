const { Stagiaire, Chambre } = require('../models');
const Excel = require('exceljs'); // You'll need to install this

// Add this helper function at the top of your file, right after the imports
const buildStagiaireQuery = (queryParams) => {
  let query = {};
  
  // Add search functionality
  if (queryParams.search) {
    const searchRegex = new RegExp(queryParams.search, 'i');
    query = {
      $or: [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { identifier: searchRegex },
        { entreprise: searchRegex }
      ]
    };
  }
  
  // Filtrage par statut (actif/inactif)
  if (queryParams.status === 'active') {
    const now = new Date();
    const statusQuery = {
      $and: [
        { dateArrivee: { $lte: now } },
        { dateDepart: { $gte: now } }
      ]
    };
    
    // Combine with existing query
    query = queryParams.search 
      ? { $and: [query, statusQuery] }
      : statusQuery;
  } else if (queryParams.status === 'inactive') {
    const now = new Date();
    const statusQuery = {
      $or: [
        { dateArrivee: { $gt: now } },
        { dateDepart: { $lt: now } }
      ]
    };
    
    // Combine with existing query
    query = queryParams.search 
      ? { $and: [query, statusQuery] }
      : statusQuery;
  }
  
  // Filtrage par chambre
  if (queryParams.room === 'withRoom') {
    const roomQuery = { chambre: { $ne: null } };
    
    // Combine with existing query
    query = Object.keys(query).length > 0
      ? { $and: [query, roomQuery] }
      : roomQuery;
      
    // Filtrage par numéro de chambre spécifique
    if (queryParams.specificRoom) {
      query.chambre = queryParams.specificRoom;
    }
  } else if (queryParams.room === 'withoutRoom') {
    const roomQuery = { chambre: null };
    
    // Combine with existing query
    query = Object.keys(query).length > 0
      ? { $and: [query, roomQuery] }
      : roomQuery;
  }
  
  // Filtrage par sexe
  if (queryParams.gender && queryParams.gender !== 'all') {
    const genderQuery = { sexe: queryParams.gender };
    
    // Combine with existing query
    query = Object.keys(query).length > 0
      ? { $and: [query, genderQuery] }
      : genderQuery;
  }
  
  // Filtrage par session (cycle) et année
  if (queryParams.session && queryParams.session !== 'all') {
    // Map the session parameter to the cycle field values
    let cycleValue;
    if (queryParams.session === 'septembre') {
      cycleValue = 'sep';
    } else if (queryParams.session === 'novembre') {
      cycleValue = 'nov';
    } else if (queryParams.session === 'fevrier') {
      cycleValue = 'fev';
    }
    
    // Create the cycle query
    const cycleQuery = { cycle: cycleValue };
    
    // If year is specified, add sessionYear to the query
    if (queryParams.year && queryParams.year !== 'all') {
      const yearQuery = { sessionYear: queryParams.year.toString() };
      
      // Combine cycle and year
      const sessionQuery = {
        $and: [cycleQuery, yearQuery]
      };
      
      // Combine with existing query
      query = Object.keys(query).length > 0
        ? { $and: [query, sessionQuery] }
        : sessionQuery;
    } else {
      // Only filter by cycle without year
      // Combine with existing query
      query = Object.keys(query).length > 0
        ? { $and: [query, cycleQuery] }
        : cycleQuery;
    }
  } else if (queryParams.year && queryParams.year !== 'all') {
    // If only year is specified (no specific session/cycle)
    const yearQuery = { sessionYear: queryParams.year.toString() };
    
    // Combine with existing query
    query = Object.keys(query).length > 0
      ? { $and: [query, yearQuery] }
      : yearQuery;
  }
  
  // Filtrage par dates
  if (queryParams.startDate && queryParams.endDate) {
    const dateQuery = {
      dateArrivee: {
        $gte: new Date(queryParams.startDate),
        $lte: new Date(queryParams.endDate)
      }
    };
    
    // Combine with existing query
    query = Object.keys(query).length > 0
      ? { $and: [query, dateQuery] }
      : dateQuery;
  } else if (queryParams.startDate) {
    const dateQuery = { dateArrivee: { $gte: new Date(queryParams.startDate) } };
    
    // Combine with existing query
    query = Object.keys(query).length > 0
      ? { $and: [query, dateQuery] }
      : dateQuery;
  } else if (queryParams.endDate) {
    const dateQuery = { dateArrivee: { $lte: new Date(queryParams.endDate) } };
    
    // Combine with existing query
    query = Object.keys(query).length > 0
      ? { $and: [query, dateQuery] }
      : dateQuery;
  }
  
  return query;
};

// Update the getAllStagiaires function - FIXED VERSION for room assignments
exports.getAllStagiaires = async (req, res) => {
  try {
    // Construction de la requête MongoDB avec les filtres
    let query = {};
    
    // Log all incoming query parameters
    
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
    
    // Filtrage par chambre - COMPLETELY REWRITTEN FOR CORRECT LOGIC
    if (req.query.room === 'withRoom') {
      // Get all stagiaire IDs that are in any room's occupants array
      const roomsWithOccupants = await Chambre.find({ occupants: { $exists: true, $not: { $size: 0 } } });
      const stagiaireIdsWithRooms = roomsWithOccupants.flatMap(room => room.occupants);
      
      if (stagiaireIdsWithRooms.length > 0) {
        const roomQuery = { _id: { $in: stagiaireIdsWithRooms } };
        
        // Combine with existing query
        query = Object.keys(query).length > 0
          ? { $and: [query, roomQuery] }
          : roomQuery;
      } else {
        // No stagiaires have rooms, return empty result
        query = { _id: { $in: [] } };
      }
        
      // Filtrage par numéro de chambre spécifique
      if (req.query.specificRoom) {
        // Find rooms with the specific number
        const specificRooms = await Chambre.find({ 
          numero: { $regex: req.query.specificRoom, $options: 'i' } 
        });
        const specificStagiaireIds = specificRooms.flatMap(room => room.occupants);
        
        if (specificStagiaireIds.length > 0) {
          const specificRoomQuery = { _id: { $in: specificStagiaireIds } };
          
          query = Object.keys(query).length > 0
            ? { $and: [query, specificRoomQuery] }
            : specificRoomQuery;
        } else {
          // No stagiaires in rooms with that number
          query = { _id: { $in: [] } };
        }
      }
    } else if (req.query.room === 'withoutRoom') {
      // Get all stagiaire IDs that are in any room's occupants array
      const roomsWithOccupants = await Chambre.find({ occupants: { $exists: true, $not: { $size: 0 } } });
      const stagiaireIdsWithRooms = roomsWithOccupants.flatMap(room => room.occupants);
      
      // Find stagiaires NOT in any room
      const roomQuery = { _id: { $nin: stagiaireIdsWithRooms } };
      
      // Combine with existing query
      query = Object.keys(query).length > 0
        ? { $and: [query, roomQuery] }
        : roomQuery;
    }
    
    // Rest of the filtering logic (gender, session, dates, payment) stays the same...
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
      
      
      // Create the cycle query
      const cycleQuery = { cycle: cycleValue };
      
      // If year is specified, add sessionYear to the query
      if (req.query.year && req.query.year !== 'all') {
        const yearQuery = { sessionYear: req.query.year.toString() };
        
        // Combine cycle and year
        const sessionQuery = {
          $and: [cycleQuery, yearQuery]
        };
        
        // Combine with existing query
        query = Object.keys(query).length > 0
          ? { $and: [query, sessionQuery] }
          : sessionQuery;
          
      } else {
        // Only filter by cycle without year
        // Combine with existing query
        query = Object.keys(query).length > 0
          ? { $and: [query, cycleQuery] }
          : cycleQuery;
          
      }
    } else if (req.query.year && req.query.year !== 'all') {
      // If only year is specified (no specific session/cycle)
      const yearQuery = { sessionYear: req.query.year.toString() };
      
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

    // Payment filter logic
    if (req.query.paymentStatus && req.query.paymentStatus !== '') {
      
      // Translate English payment status to French for database query
      let frenchPaymentStatus = '';
      if (req.query.paymentStatus === 'paid') {
        frenchPaymentStatus = 'payé';
      } else if (req.query.paymentStatus === 'exempt') {
        frenchPaymentStatus = 'dispensé';
      }
      

      if (frenchPaymentStatus) {
        const paymentFilter = {
          $or: [
            { 
              'payment.restauration.enabled': true, 
              'payment.restauration.status': frenchPaymentStatus 
            },
            { 
              'payment.foyer.enabled': true, 
              'payment.foyer.status': frenchPaymentStatus 
            },
            { 
              'payment.inscription.enabled': true, 
              'payment.inscription.status': frenchPaymentStatus 
            }
          ]
        };


        // Combine with existing query
        query = Object.keys(query).length > 0
          ? { $and: [query, paymentFilter] }
          : paymentFilter;
      }
    }

    // Ajouter le tri dans la fonction getAllStagiaires
    const sortField = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;

    // Log query for debugging

    // EXECUTE QUERY - NO POPULATION NEEDED
    let stagiaires = await Stagiaire.find(query)
      .sort({ [sortField]: sortOrder });

    
    // GET ALL ROOMS TO MAP STAGIAIRES TO ROOMS
    const allRooms = await Chambre.find({});
    
    // Create a map of stagiaire ID to room info
    const stagiaireToRoomMap = {};
    allRooms.forEach(room => {
      if (room.occupants && room.occupants.length > 0) {
        room.occupants.forEach(occupantId => {
          stagiaireToRoomMap[occupantId.toString()] = {
            numero: room.numero,
            etage: room.etage,
            capacite: room.capacite,
            type: room.type,
            statut: room.statut,
            _id: room._id
          };
        });
      }
    });
    
    
    // Transform stagiaires data for frontend compatibility - ENHANCED VERSION
    const transformedStagiaires = stagiaires.map(stagiaire => {
      const transformed = { ...stagiaire.toObject() };
      
      // Handle payment data
      if (stagiaire.payment) {
        transformed.restauration = stagiaire.payment.restauration?.enabled || false;
        transformed.foyer = stagiaire.payment.foyer?.enabled || false;
        transformed.inscription = stagiaire.payment.inscription?.enabled || false;
        
        transformed.restaurationStatus = stagiaire.payment.restauration?.status || 'payé';
        transformed.foyerStatus = stagiaire.payment.foyer?.status || 'payé';
        transformed.inscriptionStatus = stagiaire.payment.inscription?.status || 'payé';
      }
      
      // Handle room assignment - CORRECTED VERSION USING MAPPING
      const roomInfo = stagiaireToRoomMap[stagiaire._id.toString()];
      if (roomInfo) {
        transformed.chambreInfo = roomInfo;
        transformed.chambreNumero = roomInfo.numero;
      } else {
        // No room assigned
        transformed.chambreNumero = null;
        transformed.chambreInfo = null;
      }
      
      return transformed;
    });
    
    // If no results, do a sanity check on the database
    if (transformedStagiaires.length === 0) {
      const totalCount = await Stagiaire.countDocuments({});
      
      // Show a sample of the data structure
      if (totalCount > 0) {
        const sample = await Stagiaire.findOne({}).lean();
      }
    }

    res.status(200).json({
      status: 'success',
      results: transformedStagiaires.length,
      data: {
        stagiaires: transformedStagiaires
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
    // Special case for 'available' endpoint
    if (req.params.id === 'available') {
      // Handle it as the getAvailableStagiaires function would
      const availableStagiaires = await Stagiaire.find({
        $or: [
          { chambreId: { $exists: false } },
          { chambreId: null }
        ]
      }).sort({ firstName: 1, lastName: 1 });

      return res.status(200).json({
        status: 'success',
        data: availableStagiaires
      });
    }

    // Regular case - fetch a specific stagiaire
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
    const stagiaireData = req.body;
    
    // Process payment data
    if (stagiaireData.restauration !== undefined || stagiaireData.foyer !== undefined || stagiaireData.inscription !== undefined) {
      stagiaireData.payment = {
        restauration: {
          enabled: stagiaireData.restauration || false,
          status: stagiaireData.restaurationStatus || 'payé',
          semester1Price: parseFloat(stagiaireData.restaurationSemester1) || 0,
          semester2Price: parseFloat(stagiaireData.restaurationSemester2) || 0
        },
        foyer: {
          enabled: stagiaireData.foyer || false,
          status: stagiaireData.foyerStatus || 'payé',
          semester1Price: parseFloat(stagiaireData.foyerSemester1) || 0,
          semester2Price: parseFloat(stagiaireData.foyerSemester2) || 0
        },
        inscription: {
          enabled: stagiaireData.inscription || false,
          status: stagiaireData.inscriptionStatus || 'payé',
          semester1Price: parseFloat(stagiaireData.inscriptionSemester1) || 0,
          semester2Price: parseFloat(stagiaireData.inscriptionSemester2) || 0
        }
      };
      
      // Remove the flat payment fields from the main object
      delete stagiaireData.restauration;
      delete stagiaireData.foyer;
      delete stagiaireData.inscription;
      delete stagiaireData.restaurationStatus;
      delete stagiaireData.foyerStatus;
      delete stagiaireData.inscriptionStatus;
      delete stagiaireData.restaurationSemester1;
      delete stagiaireData.restaurationSemester2;
      delete stagiaireData.foyerSemester1;
      delete stagiaireData.foyerSemester2;
      delete stagiaireData.inscriptionSemester1;
      delete stagiaireData.inscriptionSemester2;
    }
    
    const stagiaire = await Stagiaire.create(stagiaireData);
    
    res.status(201).json({
      status: 'success',
      data: {
        stagiaire
      }
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
    const { id } = req.params;
    const updateData = req.body;
    
    // Process payment data for updates
    if (updateData.restauration !== undefined || updateData.foyer !== undefined || updateData.inscription !== undefined) {
      updateData.payment = {
        restauration: {
          enabled: updateData.restauration || false,
          status: updateData.restaurationStatus || 'payé',
          semester1Price: parseFloat(updateData.restaurationSemester1) || 0,
          semester2Price: parseFloat(updateData.restaurationSemester2) || 0
        },
        foyer: {
          enabled: updateData.foyer || false,
          status: updateData.foyerStatus || 'payé',
          semester1Price: parseFloat(updateData.foyerSemester1) || 0,
          semester2Price: parseFloat(updateData.foyerSemester2) || 0
        },
        inscription: {
          enabled: updateData.inscription || false,
          status: updateData.inscriptionStatus || 'payé',
          semester1Price: parseFloat(updateData.inscriptionSemester1) || 0,
          semester2Price: parseFloat(updateData.inscriptionSemester2) || 0
        }
      };
      
      // Remove the flat payment fields
      delete updateData.restauration;
      delete updateData.foyer;
      delete updateData.inscription;
      delete updateData.restaurationStatus;
      delete updateData.foyerStatus;
      delete updateData.inscriptionStatus;
      delete updateData.restaurationSemester1;
      delete updateData.restaurationSemester2;
      delete updateData.foyerSemester1;
      delete updateData.foyerSemester2;
      delete updateData.inscriptionSemester1;
      delete updateData.inscriptionSemester2;
    }
    
    const stagiaire = await Stagiaire.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!stagiaire) {
      return res.status(404).json({
        status: 'fail',
        message: 'Stagiaire not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        stagiaire
      }
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
// Update this function to properly check both chambre and chambreId fields
exports.getAvailableStagiaires = async (req, res) => {
  try {
    
    // Find stagiaires where chambreId is not set
    const availableStagiaires = await Stagiaire.find({
      chambreId: { $exists: false }
    }).sort({ firstName: 1, lastName: 1 });
    
    
    res.status(200).json({
      status: 'success',
      data: availableStagiaires
    });
  } catch (error) {
    console.error('[getAvailableStagiaires] Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Impossible de récupérer les stagiaires disponibles'
    });
  }
};

// Export multiple stagiaires
exports.exportStagiaires = async (req, res) => {
  try {
    // Apply the same filtering logic as in getAllStagiaires
    const query = buildStagiaireQuery(req.query);
    
    // Limit results if requested
    const limit = req.query.limit ? parseInt(req.query.limit) : null;
    
    // Get stagiaires from database
    let stagiaires;
    if (limit) {
      stagiaires = await Stagiaire.find(query).limit(limit).populate('chambre');
    } else {
      stagiaires = await Stagiaire.find(query).populate('chambre');
    }
    
    
    // Create Excel workbook
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet('Stagiaires');
    
    // Define columns with headers - Including ALL fields from the model
    worksheet.columns = [
      { header: 'Identifiant', key: 'identifier', width: 15 },
      { header: 'Prénom', key: 'firstName', width: 20 },
      { header: 'Nom', key: 'lastName', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Téléphone', key: 'telephone', width: 15 },
      { header: 'Sexe', key: 'sexe', width: 10 },
      { header: 'Type', key: 'type', width: 10 },
      { header: 'Chambre', key: 'chambre', width: 10 },
      { header: 'Date d\'arrivée', key: 'dateArrivee', width: 15 },
      { header: 'Date de départ', key: 'dateDepart', width: 15 },
      { header: 'Entreprise', key: 'entreprise', width: 20 },
      { header: 'Cycle', key: 'cycle', width: 10 },
      { header: 'Session', key: 'sessionYear', width: 10 },
      { header: 'Statut', key: 'status', width: 15 },
      { header: 'CIN/Passport', key: 'cinPassport', width: 20 },
      { header: 'Nationalité', key: 'nationality', width: 15 },
      { header: 'Date de naissance', key: 'birthDate', width: 15 },
      { header: 'Adresse', key: 'address', width: 30 },
      { header: 'Ville', key: 'city', width: 15 },
      { header: 'Pays', key: 'country', width: 15 },
      { header: 'Situation Actuelle', key: 'currentSituation', width: 20 },
      { header: 'Établissement', key: 'establishment', width: 20 },
      { header: 'Centre Affecté', key: 'assignedCenter', width: 20 },
      { header: 'Numéro de Groupe', key: 'groupNumber', width: 15 },
      { header: 'Notes', key: 'notes', width: 30 },
      { header: 'Date de création', key: 'createdAt', width: 20 },
      { header: 'Dernière modification', key: 'updatedAt', width: 20 }
    ];
    
    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    
    // Add data rows
    stagiaires.forEach(stagiaire => {
      // Calculate status
      const now = new Date();
      const isActive = stagiaire.dateArrivee <= now && stagiaire.dateDepart >= now;
      
      // Build row data with all fields
      const rowData = {
        id: stagiaire._id.toString(),
        firstName: stagiaire.firstName || '',
        lastName: stagiaire.lastName || '',
        email: stagiaire.email || '',
        telephone: stagiaire.telephone || '',
        sexe: stagiaire.sexe || '',
        type: stagiaire.type || 'N/A',
        identifier: stagiaire.identifier || '',
        chambre: stagiaire.chambre ? stagiaire.chambre.numero : 'Non assignée',
        dateArrivee: stagiaire.dateArrivee ? new Date(stagiaire.dateArrivee).toLocaleDateString() : '',
        dateDepart: stagiaire.dateDepart ? new Date(stagiaire.dateDepart).toLocaleDateString() : '',
        entreprise: stagiaire.entreprise || '',
        cycle: stagiaire.cycle || '',
        sessionYear: stagiaire.sessionYear || '',
        status: isActive ? 'Actif' : 'Inactif',
        cinPassport: stagiaire.cin || stagiaire.passport || '',
        nationality: stagiaire.nationality || '',
        birthDate: stagiaire.birthDate ? new Date(stagiaire.birthDate).toLocaleDateString() : '',
        address: stagiaire.address || '',
        city: stagiaire.city || '',
        country: stagiaire.country || '',
        currentSituation: stagiaire.currentSituation || '',
        establishment: stagiaire.establishment || '',
        assignedCenter: stagiaire.assignedCenter || '',
        groupNumber: stagiaire.groupNumber || '',
        notes: stagiaire.notes || '',
        createdAt: stagiaire.createdAt ? new Date(stagiaire.createdAt).toLocaleString() : '',
        updatedAt: stagiaire.updatedAt ? new Date(stagiaire.updatedAt).toLocaleString() : ''
      };
      
      worksheet.addRow(rowData);
    });
    
    // Add borders to all cells
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });
    
    // Freeze the header row
    worksheet.views = [
      { state: 'frozen', ySplit: 1, activeCell: 'A2' }
    ];
    
    // Add filters to headers to make the data filterable in Excel
    worksheet.autoFilter = {
      from: 'A1',
      to: 'AB1'  // Adjust this based on the number of columns
    };
    
    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=stagiaires.xlsx');
    
    // Send the workbook
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error exporting stagiaires:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Export single stagiaire
// Export single stagiaire with table format
exports.exportStagiaire = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get stagiaire from database
    const stagiaire = await Stagiaire.findById(id).populate('chambre');
    
    if (!stagiaire) {
      return res.status(404).json({
        status: 'error',
        message: 'Stagiaire not found'
      });
    }
    
    // Create Excel workbook
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet('Détails Stagiaire');
    
    // Define columns
    worksheet.columns = [
      { header: 'Attribut', key: 'attribute', width: 25 },
      { header: 'Valeur', key: 'value', width: 50 }
    ];
    
    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    
    // Calculate status
    const now = new Date();
    const isActive = stagiaire.dateArrivee <= now && stagiaire.dateDepart >= now;
    
    // Add rows for common fields
    const rows = [
      { attribute: 'Identifiant', value: stagiaire.identifier || '' },
      { attribute: 'Prénom', value: stagiaire.firstName || '' },
      { attribute: 'Nom', value: stagiaire.lastName || '' },
      { attribute: 'Email', value: stagiaire.email || '' },
      { attribute: 'Téléphone', value: stagiaire.telephone || '' },
      { attribute: 'Sexe', value: stagiaire.sexe || '' },
      { attribute: 'Type', value: stagiaire.type || 'N/A' },
      { attribute: 'Chambre', value: stagiaire.chambre ? stagiaire.chambre.numero : 'Non assignée' },
      { attribute: 'Date d\'arrivée', value: stagiaire.dateArrivee ? new Date(stagiaire.dateArrivee).toLocaleDateString() : '' },
      { attribute: 'Date de départ', value: stagiaire.dateDepart ? new Date(stagiaire.dateDepart).toLocaleDateString() : '' },
      { attribute: 'Entreprise', value: stagiaire.entreprise || '' },
      { attribute: 'Cycle', value: stagiaire.cycle || '' },
      { attribute: 'Session', value: stagiaire.sessionYear || '' },
      { attribute: 'Statut', value: isActive ? 'Actif' : 'Inactif' },
      { attribute: 'Adresse', value: stagiaire.address || '' },
      { attribute: 'Ville', value: stagiaire.city || '' },
      { attribute: 'Pays', value: stagiaire.country || '' },
      { attribute: 'Notes', value: stagiaire.notes || '' },
      { attribute: 'Date de création', value: stagiaire.createdAt ? new Date(stagiaire.createdAt).toLocaleString() : '' },
      { attribute: 'Dernière modification', value: stagiaire.updatedAt ? new Date(stagiaire.updatedAt).toLocaleString() : '' }
    ];
    
    // Add type-specific fields
    if (stagiaire.type === 'interne') {
      rows.push(
        { attribute: 'Nationalité', value: stagiaire.nationality || 'N/A' },
        { attribute: 'Date de naissance', value: stagiaire.birthDate ? new Date(stagiaire.birthDate).toLocaleDateString() : '' },
        { attribute: 'CIN/Passport', value: stagiaire.cin || stagiaire.passport || 'N/A' },
        { attribute: 'Situation actuelle', value: stagiaire.currentSituation || 'N/A' },
        { attribute: 'Établissement', value: stagiaire.establishment || 'N/A' }
        // Add any other intern-specific fields
      );
    } else if (stagiaire.type === 'externe') {
      rows.push(
        { attribute: 'Centre affecté', value: stagiaire.assignedCenter || 'N/A' },
        { attribute: 'Numéro de groupe', value: stagiaire.groupNumber || 'N/A' }
        // Add any other extern-specific fields
      );
    }
    
    // Add the rows to the worksheet
    worksheet.addRows(rows);
    
    // Add borders to all cells
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });
    
    // Style the attribute column
    worksheet.getColumn(1).font = { bold: true };
    worksheet.getColumn(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF5F5F5' }
    };
    
    // Freeze the header row
    worksheet.views = [
      { state: 'frozen', ySplit: 1, activeCell: 'A2' }
    ];
    
    // Add a second worksheet with additional details if needed
    if (stagiaire.chambre) {
      const chambreSheet = workbook.addWorksheet('Informations Chambre');
      
      chambreSheet.columns = [
        { header: 'Attribut', key: 'attribute', width: 25 },
        { header: 'Valeur', key: 'value', width: 50 }
      ];
      
      // Style the header row
      chambreSheet.getRow(1).font = { bold: true };
      chambreSheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
      
      // Add chambre details
      chambreSheet.addRows([
        { attribute: 'Numéro', value: stagiaire.chambre.numero || '' },
        { attribute: 'Étage', value: stagiaire.chambre.etage || '' },
        { attribute: 'Capacité', value: stagiaire.chambre.capacite || '' },
        { attribute: 'Type', value: stagiaire.chambre.type || '' },
        { attribute: 'Status', value: stagiaire.chambre.status || '' }
      ]);
      
      // Add borders to all cells
      chambreSheet.eachRow((row) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      });
      
      // Style the attribute column
      chambreSheet.getColumn(1).font = { bold: true };
      chambreSheet.getColumn(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF5F5F5' }
      };
    }
    
    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=stagiaire_${stagiaire.firstName}_${stagiaire.lastName}_${stagiaire._id}.xlsx`);
    
    // Send the workbook
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(`Error exporting stagiaire ${req.params.id}:`, error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Server error while exporting single stagiaire' 
    });
  }
};

// Update this function to transform payment data for editing
exports.getStagiaireById = async (req, res) => {
  try {
    const { id } = req.params;
    const stagiaire = await Stagiaire.findById(id);
    
    if (!stagiaire) {
      return res.status(404).json({
        status: 'fail',
        message: 'Stagiaire not found'
      });
    }

    // Transform payment data back to flat structure for frontend editing
    let transformedStagiaire = stagiaire.toObject();
    
    if (stagiaire.payment) {
      // Add flat payment fields for frontend compatibility
      transformedStagiaire.restauration = stagiaire.payment.restauration?.enabled || false;
      transformedStagiaire.foyer = stagiaire.payment.foyer?.enabled || false;
      transformedStagiaire.inscription = stagiaire.payment.inscription?.enabled || false;
      
      transformedStagiaire.restaurationStatus = stagiaire.payment.restauration?.status || 'payé';
      transformedStagiaire.foyerStatus = stagiaire.payment.foyer?.status || 'payé';
      transformedStagiaire.inscriptionStatus = stagiaire.payment.inscription?.status || 'payé';
      
      transformedStagiaire.restaurationSemester1 = stagiaire.payment.restauration?.semester1Price || '';
      transformedStagiaire.restaurationSemester2 = stagiaire.payment.restauration?.semester2Price || '';
      transformedStagiaire.foyerSemester1 = stagiaire.payment.foyer?.semester1Price || '';
      transformedStagiaire.foyerSemester2 = stagiaire.payment.foyer?.semester2Price || '';
      transformedStagiaire.inscriptionSemester1 = stagiaire.payment.inscription?.semester1Price || '';
      transformedStagiaire.inscriptionSemester2 = stagiaire.payment.inscription?.semester2Price || '';
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        stagiaire: transformedStagiaire
      }
    });
  } catch (error) {
    console.error('Error fetching stagiaire:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Update the getStagiaires function - fix the payment filter logic
exports.getStagiaires = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Extract filters from query parameters
    const {
      search = '',
      status = 'all',
      room = 'all',
      specificRoom = '',
      gender = 'all',
      session = 'all',
      year = 'all',
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      paymentStatus = ''
    } = req.query;

    // Translate English payment status to French for database query
    let frenchPaymentStatus = '';
    if (paymentStatus === 'paid') {
      frenchPaymentStatus = 'payé';
    } else if (paymentStatus === 'exempt') {
      frenchPaymentStatus = 'dispensé';
    }
    
    // Build the base filter using existing buildStagiaireQuery function
    let filter = buildStagiaireQuery({
      search,
      status,
      room,
      specificRoom,
      gender,
      session,
      year,
      startDate,
      endDate
    });

    // Add payment filter logic with French status
    if (frenchPaymentStatus && frenchPaymentStatus !== '') {
      const paymentFilter = {
        $or: [
          { 
            'payment.restauration.enabled': true, 
            'payment.restauration.status': frenchPaymentStatus 
          },
          { 
            'payment.foyer.enabled': true, 
            'payment.foyer.status': frenchPaymentStatus 
          },
          { 
            'payment.inscription.enabled': true, 
            'payment.inscription.status': frenchPaymentStatus 
          }
        ]
      };


      // Combine with existing filter properly
      if (Object.keys(filter).length > 0) {
        filter = { $and: [filter, paymentFilter] };
      } else {
        filter = paymentFilter;
      }
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query
    const [stagiaires, total] = await Promise.all([
      Stagiaire.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean(),
      Stagiaire.countDocuments(filter)
    ]);

    if (stagiaires.length > 0) {
    }

    // Transform stagiaires data for frontend compatibility
    const transformedStagiaires = stagiaires.map(stagiaire => {
      const transformed = { ...stagiaire };
      
      if (stagiaire.payment) {
        transformed.restauration = stagiaire.payment.restauration?.enabled || false;
        transformed.foyer = stagiaire.payment.foyer?.enabled || false;
        transformed.inscription = stagiaire.payment.inscription?.enabled || false;
        
        transformed.restaurationStatus = stagiaire.payment.restauration?.status || 'payé';
        transformed.foyerStatus = stagiaire.payment.foyer?.status || 'payé';
        transformed.inscriptionStatus = stagiaire.payment.inscription?.status || 'payé';
      }
      
      return transformed;
    });

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      status: 'success',
      results: transformedStagiaires.length,
      data: {
        stagiaires: transformedStagiaires,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit
        }
      }
    });
  } catch (error) {
    console.error('Error fetching stagiaires:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
