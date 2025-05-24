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
    console.log('Fetching stagiaire with ID:', req.params.id);
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
// Update this function to properly check both chambre and chambreId fields
exports.getAvailableStagiaires = async (req, res) => {
  try {
    console.log("[getAvailableStagiaires] Fetching available stagiaires");
    
    // Find stagiaires where chambreId is not set
    const availableStagiaires = await Stagiaire.find({
      chambreId: { $exists: false }
    }).sort({ firstName: 1, lastName: 1 });
    
    console.log(`[getAvailableStagiaires] Found ${availableStagiaires.length} available stagiaires`);
    
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
  console.log("exportStagiaires controller called with query:", req.query);
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
    
    console.log(`Found ${stagiaires.length} stagiaires to export`);
    
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
    console.log('Exporting stagiaire with ID:', id);
    
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

// Add this new endpoint to check for occupancy conflicts
