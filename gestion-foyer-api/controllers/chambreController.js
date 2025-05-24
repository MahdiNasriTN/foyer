const Chambre = require('../models/chambre');
const Stagiaire = require('../models/stagiaire');

// Récupérer toutes les chambres avec filtres
exports.getAllChambres = async (req, res) => {
  try {
    let query = {};
    
    // Filtrage par statut
    if (req.query.status) {
      // Map frontend values to database values if needed
      const statusValue = req.query.status;
      
      // Add logging to debug the incoming parameter
      console.log('Status filter received:', statusValue);
      
      // Convertir en minuscules et gérer les problèmes d'encodage
      const normalizedStatus = statusValue.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      
      // Mapper vers vos valeurs de base de données
      if (normalizedStatus === 'libre' || normalizedStatus === 'available') {
        query.statut = 'libre';
      } else if (normalizedStatus === 'occupee' || normalizedStatus === 'occupied' || normalizedStatus === 'occupée') {
        query.statut = 'occupee';
      }
      
      console.log('Status query condition:', query.statut);
    }
    
    // Filtrage par étage
    if (req.query.etage) {
      query.etage = req.query.etage;
    }
    
    // Recherche par numéro
    if (req.query.search) {
      query.numero = { $regex: req.query.search, $options: 'i' };
    }
    
    // Exécution de la requête
    let chambres = await Chambre.find(query);
    
    // Journaliser les résultats pour le débogage
    console.log(`Found ${chambres.length} chambres matching query:`, query);
    
    // Tri
    if (req.query.sortBy) {
      const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
      chambres = chambres.sort((a, b) => {
        if (a[req.query.sortBy] < b[req.query.sortBy]) return -1 * sortOrder;
        if (a[req.query.sortBy] > b[req.query.sortBy]) return 1 * sortOrder;
        return 0;
      });
    }
    
    res.status(200).json({
      status: 'success',
      results: chambres.length,
      data: chambres
    });
  } catch (error) {
    console.error('Error fetching chambres:', error);
    res.status(500).json({
      status: 'error',
      message: 'Une erreur est survenue lors de la récupération des chambres'
    });
  }
};

// Récupérer une chambre par ID
exports.getChambre = async (req, res) => {
  try {
    const chambre = await Chambre.findById(req.params.id).populate('occupants');
    
    if (!chambre) {
      return res.status(404).json({
        status: 'fail',
        message: 'Chambre non trouvée'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: chambre
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Créer une nouvelle chambre
exports.createChambre = async (req, res) => {
  try {
    // Vérifier si le numéro est unique
    const existingChambre = await Chambre.findOne({ numero: req.body.numero });
    if (existingChambre) {
      return res.status(400).json({
        status: 'fail',
        message: 'Une chambre avec ce numéro existe déjà'
      });
    }
    
    // Convertir le statut si nécessaire
    let statut = req.body.statut;
    if (statut === 'libre') statut = 'libre';
    if (statut === 'occupée') statut = 'occupee';
    
    // Créer la chambre en prenant en compte les deux noms possibles pour équipements
    const newChambre = await Chambre.create({
      numero: req.body.numero,
      capacite: req.body.capacite,
      nombreLits: req.body.nombreLits || req.body.capacite, // Par défaut, égal à la capacité si non spécifié
      etage: req.body.etage,
      type: req.body.type,
      statut: statut,
      description: req.body.description,
      // Utiliser equipements ou amenities selon ce qui est fourni
      amenities: req.body.equipements || req.body.amenities || [],
      equipements: req.body.equipements || req.body.amenities || [],
      gender: req.body.gender || 'garcon'
    });
    
    res.status(201).json({
      status: 'success',
      data: newChambre
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Mettre à jour une chambre
exports.updateChambre = async (req, res) => {
  try {
    // Vérifier si le numéro modifié est unique
    if (req.body.numero) {
      const existingChambre = await Chambre.findOne({ 
        numero: req.body.numero, 
        _id: { $ne: req.params.id } 
      });
      
      if (existingChambre) {
        return res.status(400).json({
          status: 'fail',
          message: 'Une chambre avec ce numéro existe déjà'
        });
      }
    }
    
    // Préparation des données à mettre à jour
    const updateData = {
      numero: req.body.numero,
      capacite: req.body.capacite,
      nombreLits: req.body.nombreLits,
      etage: req.body.etage,
      type: req.body.type,
      statut: req.body.statut,
      description: req.body.description,
      amenities: req.body.equipements,
      gender: req.body.gender
    };
    
    // Supprimer les propriétés undefined
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );
    
    const updatedChambre = await Chambre.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true, runValidators: true }
    ).populate('occupants');
    
    if (!updatedChambre) {
      return res.status(404).json({
        status: 'fail',
        message: 'Chambre non trouvée'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: updatedChambre
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Supprimer une chambre
exports.deleteChambre = async (req, res) => {
  try {
    const chambre = await Chambre.findById(req.params.id);
    
    if (!chambre) {
      return res.status(404).json({
        status: 'fail',
        message: 'Chambre non trouvée'
      });
    }
    
    // Vérifier si la chambre a des occupants
    if (chambre.occupants && chambre.occupants.length > 0) {
      // Mettre à jour les stagiaires pour supprimer la référence à la chambre
      await Stagiaire.updateMany(
        { chambre: req.params.id },
        { $unset: { chambre: 1 } }
      );
    }
    
    // Supprimer la chambre
    await Chambre.findByIdAndDelete(req.params.id);
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Assigner des occupants à une chambre
exports.assignOccupants = async (req, res) => {
  try {
    const { id } = req.params;
    const { occupantIds } = req.body;

    // Log for debugging
    console.log(`[assignOccupants] Room ID: ${id}, Occupant IDs:`, occupantIds);

    // Find the room to assign occupants to
    const chambre = await Chambre.findById(id);
    if (!chambre) {
      return res.status(404).json({
        status: 'fail',
        message: 'Chambre not found'
      });
    }

    // Make sure we're properly accessing the occupants array
    const currentOccupantIds = [];
    if (chambre.occupants && chambre.occupants.length > 0) {
      chambre.occupants.forEach(occupantId => {
        const idString = occupantId.toString();
        currentOccupantIds.push(idString);
      });
    }

    console.log("[assignOccupants] Current occupants:", currentOccupantIds);

    // Convert the incoming occupantIds to strings for consistent comparison
    const newOccupantIds = occupantIds ? occupantIds.map(id => id.toString()) : [];

    // Find occupants being removed
    const removedOccupantIds = currentOccupantIds.filter(id => 
      !newOccupantIds.includes(id)
    );
    console.log("[assignOccupants] Occupants being removed:", removedOccupantIds);

    // Find occupants being added
    const addedOccupantIds = newOccupantIds.filter(id => 
      !currentOccupantIds.includes(id)
    );
    console.log("[assignOccupants] Occupants being added:", addedOccupantIds);

    // 1. Clear chambreId for any stagiaires that are being removed
    if (removedOccupantIds.length > 0) {
      console.log(`[assignOccupants] Removing chamber association for ${removedOccupantIds.length} stagiaires`);
      
      try {
        const updateResult = await Stagiaire.updateMany(
          { _id: { $in: removedOccupantIds } },
          { $unset: { chambreId: "" } }
        );
        console.log("[assignOccupants] Batch update result for removed occupants:", updateResult);
      } catch (updateError) {
        console.error("[assignOccupants] Error updating removed stagiaires:", updateError);
      }
    }

    // 2. Update the room's occupants list
    chambre.occupants = newOccupantIds;
    
    // 3. Important: Update room status based on occupancy
    if (newOccupantIds.length === 0) {
      chambre.statut = 'libre';
      console.log(`[assignOccupants] Room has no occupants, setting status to 'libre'`);
    } else {
      chambre.statut = 'occupée';
      console.log(`[assignOccupants] Room has ${newOccupantIds.length} occupants, setting status to 'occupée'`);
    }
    
    await chambre.save();
    console.log(`[assignOccupants] Updated room status to: ${chambre.statut}`);

    // 4. Set chambreId for newly added stagiaires
    if (addedOccupantIds.length > 0) {
      console.log(`[assignOccupants] Adding chamber association for ${addedOccupantIds.length} stagiaires`);
      
      try {
        const updateResult = await Stagiaire.updateMany(
          { _id: { $in: addedOccupantIds } },
          { chambreId: id }
        );
        console.log("[assignOccupants] Batch update result for added stagiaires:", updateResult);
      } catch (updateError) {
        console.error("[assignOccupants] Error updating added stagiaires:", updateError);
      }
    }

    // 5. Return success response with updated room information
    res.status(200).json({
      status: 'success',
      data: {
        chambre,
        addedCount: addedOccupantIds.length,
        removedCount: removedOccupantIds.length,
        roomStatus: chambre.statut
      }
    });
  } catch (error) {
    console.error('[assignOccupants] Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while assigning occupants'
    });
  }
};

// Ajouter cette méthode à votre contrôleur
exports.getChambreOccupants = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[getChambreOccupants] Fetching occupants for room: ${id}`);
    
    // Find the room
    const chambre = await Chambre.findById(id);
    if (!chambre) {
      console.log(`[getChambreOccupants] Room ${id} not found`);
      return res.status(404).json({
        status: 'fail',
        message: 'Chambre non trouvée'
      });
    }
    
    // Get occupant IDs and log for debugging
    const occupantIds = chambre.occupants || [];
    console.log(`[getChambreOccupants] Room has ${occupantIds.length} occupants:`, occupantIds);
    
    if (occupantIds.length === 0) {
      console.log(`[getChambreOccupants] No occupants for room ${id}`);
      return res.status(200).json({
        status: 'success',
        data: []
      });
    }
    
    // Fetch occupant details
    const occupants = await Stagiaire.find({
      _id: { $in: occupantIds }
    }).select('_id firstName lastName email phoneNumber profilePhoto');
    
    console.log(`[getChambreOccupants] Found ${occupants.length} occupants for room ${id}`);
    
    res.status(200).json({
      status: 'success',
      data: occupants
    });
  } catch (error) {
    console.error('[getChambreOccupants] Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while fetching occupants'
    });
  }
};

// Add this new endpoint to check occupant conflicts
exports.checkOccupants = async (req, res) => {
  try {
    const { occupantIds } = req.body;
    const roomId = req.params.id;
    
    // Find all chambers except the current one
    const otherRooms = await Chambre.find({
      _id: { $ne: roomId },
      occupants: { $in: occupantIds }
    });
    
    // Check which occupants are already assigned elsewhere
    const conflicts = [];
    
    if (otherRooms.length > 0) {
      // For each occupant, check if they're in another room
      for (const occupantId of occupantIds) {
        const conflictRoom = otherRooms.find(room => 
          room.occupants && room.occupants.includes(occupantId)
        );
        
        if (conflictRoom) {
          conflicts.push({
            occupantId,
            roomId: conflictRoom._id,
            roomNumber: conflictRoom.numero
          });
        }
      }
    }
    
    res.status(200).json({
      status: 'success',
      conflicts,
      hasConflicts: conflicts.length > 0
    });
  } catch (error) {
    console.error('Error checking occupants:', error);
    res.status(500).json({
      status: 'error',
      message: 'Une erreur est survenue lors de la vérification des occupants'
    });
  }
};

exports.checkOccupantsAvailability = async (req, res) => {
  try {
    const { occupantIds } = req.body;
    const roomId = req.params.id;
    
    // Find all chambers that have any of these occupants
    const occupiedRooms = await Chambre.find({
      _id: { $ne: roomId }, // Exclude current room
      occupants: { $in: occupantIds }
    }).select('_id numero occupants');
    
    // Check which stagiaires have chambreId set
    const stagiairesWithRooms = await Stagiaire.find({
      _id: { $in: occupantIds },
      chambreId: { $exists: true, $ne: null, $ne: roomId }
    }).select('_id firstName lastName chambreId');
    
    // Get full conflict info
    const conflicts = [];
    
    // From room occupants list
    for (const room of occupiedRooms) {
      const conflictingOccupants = room.occupants.filter(
        occupantId => occupantIds.includes(occupantId.toString())
      );
      
      for (const occupantId of conflictingOccupants) {
        // Check if this conflict is already recorded
        if (!conflicts.some(c => c.occupantId === occupantId.toString())) {
          conflicts.push({
            occupantId: occupantId.toString(),
            roomId: room._id.toString(),
            roomNumber: room.numero
          });
        }
      }
    }
    
    // From stagiaire chambreId field
    for (const stagiaire of stagiairesWithRooms) {
      // Check if this conflict is already recorded
      if (!conflicts.some(c => c.occupantId === stagiaire._id.toString())) {
        // Get room info
        const room = await Chambre.findById(stagiaire.chambreId);
        
        conflicts.push({
          occupantId: stagiaire._id.toString(),
          occupantName: `${stagiaire.firstName} ${stagiaire.lastName}`,
          roomId: stagiaire.chambreId.toString(),
          roomNumber: room ? room.numero : 'Unknown Room'
        });
      }
    }
    
    res.status(200).json({
      status: 'success',
      conflicts,
      hasConflicts: conflicts.length > 0
    });
  } catch (error) {
    console.error('Error checking occupants availability:', error);
    res.status(500).json({
      status: 'error',
      message: 'Une erreur est survenue lors de la vérification des occupants'
    });
  }
};