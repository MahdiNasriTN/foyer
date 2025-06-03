const Chambre = require('../models/chambre');
const Stagiaire = require('../models/stagiaire');

// Enhanced validation function
const validateRoomNumber = (numero) => {
  if (!numero) return { valid: false, message: 'Le numéro de chambre est requis' };
  
  const numericPart = numero.replace(/[^0-9]/g, '');
  const number = parseInt(numericPart);
  
  if (isNaN(number)) {
    return { valid: false, message: 'Le numéro de chambre doit contenir des chiffres' };
  }
  
  // Check if number falls within valid ranges
  const validRanges = [
    { min: 100, max: 199, floor: 1 },
    { min: 200, max: 299, floor: 2 },
    { min: 300, max: 399, floor: 3 },
    { min: 400, max: 499, floor: 4 }
  ];
  
  const validRange = validRanges.find(range => number >= range.min && number <= range.max);
  
  if (!validRange) {
    return { 
      valid: false, 
      message: 'Le numéro de chambre doit être dans les plages: 100-199 (Étage 1), 200-299 (Étage 2), 300-399 (Étage 3), 400-499 (Étage 4)' 
    };
  }
  
  return { valid: true, floor: validRange.floor };
};

// Get all chambres with gender filtering
exports.getAllChambres = async (req, res) => {
  try {
    let query = {};
    
    // Gender filtering
    if (req.query.gender && ['garcon', 'fille', 'mixte'].includes(req.query.gender)) {
      query.gender = req.query.gender;
    }
    
    // Status filtering
    if (req.query.status) {
      const statusValue = req.query.status;
      
      const normalizedStatus = statusValue.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      
      if (normalizedStatus === 'libre' || normalizedStatus === 'available') {
        query.statut = 'disponible';
      } else if (normalizedStatus === 'occupee' || normalizedStatus === 'occupied' || normalizedStatus === 'occupée') {
        query.statut = 'occupee';
      }
    }
    
    // Floor filtering
    if (req.query.etage) {
      query.etage = req.query.etage;
    }
    
    // Search by room number
    if (req.query.search) {
      query.numero = { $regex: req.query.search, $options: 'i' };
    }
    
    
    let chambres = await Chambre.find(query)
      .populate('occupants', 'firstName lastName email phoneNumber sexe type')
      .sort({ etage: 1, numero: 1 });
    
    // Sorting
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

// Create chambre with gender validation
exports.createChambre = async (req, res) => {
  try {
    // Validate room number
    const validation = validateRoomNumber(req.body.numero);
    if (!validation.valid) {
      return res.status(400).json({
        status: 'fail',
        message: validation.message
      });
    }
    
    // Check if room number already exists
    const existingChambre = await Chambre.findOne({ numero: req.body.numero });
    if (existingChambre) {
      return res.status(400).json({
        status: 'fail',
        message: 'Une chambre avec ce numéro existe déjà'
      });
    }
    
    // Validate gender field
    if (req.body.gender && !['garcon', 'fille', 'mixte'].includes(req.body.gender)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Le genre de la chambre doit être "garcon", "fille" ou "mixte"'
      });
    }
    
    // Auto-calculate floor and sync beds with capacity
    const etageCalcule = validation.floor;
    const nombreLitsCalcule = req.body.capacite || 2;
    
    const newChambre = await Chambre.create({
      numero: req.body.numero,
      capacite: req.body.capacite || 2,
      nombreLits: nombreLitsCalcule, // Auto-sync with capacity
      etage: etageCalcule, // Auto-calculated from room number
      type: req.body.type || 'double',
      statut: req.body.statut || 'disponible',
      description: req.body.description,
      amenities: req.body.equipements || req.body.amenities || [],
      equipements: req.body.equipements || req.body.amenities || [],
      gender: req.body.gender || 'garcon'
    });
    
    res.status(201).json({
      status: 'success',
      data: newChambre
    });
  } catch (error) {
    console.error('Error creating chambre:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Enhanced assign occupants with gender and external validation
exports.assignOccupants = async (req, res) => {
  try {
    const { id } = req.params;
    const { occupantIds } = req.body;


    // Find the room
    const chambre = await Chambre.findById(id);
    if (!chambre) {
      return res.status(404).json({
        status: 'fail',
        message: 'Chambre not found'
      });
    }

    // Get current occupants
    const currentOccupantIds = chambre.occupants ? chambre.occupants.map(id => id.toString()) : [];
    const newOccupantIds = occupantIds ? occupantIds.map(id => id.toString()) : [];


    // Validate all new occupants
    if (newOccupantIds.length > 0) {
      const stagiaires = await Stagiaire.find({ _id: { $in: newOccupantIds } });
      

      // VALIDATION 1: Check for external stagiaires
      const externalStagiaires = stagiaires.filter(s => s.type === 'externe');
      if (externalStagiaires.length > 0) {
        const externalNames = externalStagiaires.map(s => `${s.firstName} ${s.lastName}`);
        return res.status(400).json({
          status: 'fail',
          message: `Les stagiaires externes ne peuvent pas être assignés à une chambre: ${externalNames.join(', ')}`
        });
      }

      // VALIDATION 2: Check gender compatibility
      if (chambre.gender !== 'mixte') {
        const incompatibleStagiaires = stagiaires.filter(s => s.sexe !== chambre.gender);
        if (incompatibleStagiaires.length > 0) {
          const incompatibleNames = incompatibleStagiaires.map(s => `${s.firstName} ${s.lastName}`);
          const genderText = chambre.gender === 'garcon' ? 'garçons' : 'filles';
          return res.status(400).json({
            status: 'fail',
            message: `Cette chambre est réservée aux ${genderText}. Stagiaires incompatibles: ${incompatibleNames.join(', ')}`
          });
        }
      }

      // VALIDATION 3: Check room capacity
      if (newOccupantIds.length > chambre.capacite) {
        return res.status(400).json({
          status: 'fail',
          message: `Cette chambre ne peut accueillir que ${chambre.capacite} personnes. Vous essayez d'assigner ${newOccupantIds.length} stagiaires.`
        });
      }

      // VALIDATION 4: Check for conflicts with other rooms
      const otherRoomsWithTheseOccupants = await Chambre.find({
        _id: { $ne: id },
        occupants: { $in: newOccupantIds }
      }).populate('occupants', 'firstName lastName');

      if (otherRoomsWithTheseOccupants.length > 0) {
        const conflicts = [];
        otherRoomsWithTheseOccupants.forEach(room => {
          const conflictingOccupants = room.occupants.filter(occupant => 
            newOccupantIds.includes(occupant._id.toString())
          );
          conflictingOccupants.forEach(occupant => {
            conflicts.push(`${occupant.firstName} ${occupant.lastName} (chambre ${room.numero})`);
          });
        });

        return res.status(400).json({
          status: 'fail',
          message: `Les stagiaires suivants sont déjà assignés à d'autres chambres: ${conflicts.join(', ')}`
        });
      }
    }

    // Find occupants being removed and added
    const removedOccupantIds = currentOccupantIds.filter(id => !newOccupantIds.includes(id));
    const addedOccupantIds = newOccupantIds.filter(id => !currentOccupantIds.includes(id));

    // Remove chambre reference from removed stagiaires
    if (removedOccupantIds.length > 0) {
      try {
        await Stagiaire.updateMany(
          { _id: { $in: removedOccupantIds } },
          { $unset: { chambreId: "" } }
        );
      } catch (updateError) {
        console.error("[assignOccupants] Error updating removed stagiaires:", updateError);
      }
    }

    // Update room occupants list
    chambre.occupants = newOccupantIds;
    await chambre.save(); // This will trigger the pre-save middleware to update status


    // Add chambre reference to newly added stagiaires
    if (addedOccupantIds.length > 0) {
      try {
        await Stagiaire.updateMany(
          { _id: { $in: addedOccupantIds } },
          { chambreId: id }
        );
      } catch (updateError) {
        console.error("[assignOccupants] Error updating added stagiaires:", updateError);
      }
    }

    // Populate the updated room for response
    await chambre.populate('occupants', 'firstName lastName email phoneNumber sexe type');

    res.status(200).json({
      status: 'success',
      data: {
        chambre,
        addedCount: addedOccupantIds.length,
        removedCount: removedOccupantIds.length,
        message: `Assignation réussie. ${addedOccupantIds.length} stagiaire(s) ajouté(s), ${removedOccupantIds.length} retiré(s).`
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

// Get available stagiaires for a specific room (with gender and type filtering)
exports.getAvailableStagiairesForRoom = async (req, res) => {
  try {
    const { id } = req.params;
    
    const chambre = await Chambre.findById(id);
    if (!chambre) {
      return res.status(404).json({
        status: 'fail',
        message: 'Chambre non trouvée'
      });
    }

    // Get all occupied stagiaire IDs from all rooms
    const allRooms = await Chambre.find({}, 'occupants');
    const allOccupiedIds = allRooms.flatMap(room => room.occupants || []);

    // Build filter for available stagiaires
    let filter = {
      _id: { $nin: allOccupiedIds }, // Not already assigned
      type: 'interne' // Only internal stagiaires
    };

    // Add gender filter if room is not mixte
    if (chambre.gender !== 'mixte') {
      filter.sexe = chambre.gender;
    }


    const availableStagiaires = await Stagiaire.find(filter)
      .select('firstName lastName email phoneNumber sexe type')
      .sort({ firstName: 1, lastName: 1 });

    res.status(200).json({
      status: 'success',
      data: availableStagiaires,
      chambreInfo: {
        numero: chambre.numero,
        gender: chambre.gender,
        capacite: chambre.capacite,
        currentOccupants: chambre.occupants ? chambre.occupants.length : 0,
        availableSpaces: chambre.capacite - (chambre.occupants ? chambre.occupants.length : 0)
      }
    });
  } catch (error) {
    console.error('Error fetching available stagiaires for room:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la récupération des stagiaires disponibles'
    });
  }
};

// Get room statistics with gender breakdown
exports.getRoomStatistics = async (req, res) => {
  try {
    const stats = await Chambre.aggregate([
      {
        $group: {
          _id: '$gender',
          totalRooms: { $sum: 1 },
          totalCapacity: { $sum: '$capacite' },
          totalOccupants: { $sum: { $size: '$occupants' } },
          availableRooms: {
            $sum: {
              $cond: [
                { $lt: [{ $size: '$occupants' }, '$capacite'] },
                1,
                0
              ]
            }
          },
          occupiedRooms: {
            $sum: {
              $cond: [
                { $gt: [{ $size: '$occupants' }, 0] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    // Get overall statistics
    const overallStats = await Chambre.aggregate([
      {
        $group: {
          _id: null,
          totalRooms: { $sum: 1 },
          totalCapacity: { $sum: '$capacite' },
          totalOccupants: { $sum: { $size: '$occupants' } },
          averageOccupancy: { $avg: { $divide: [{ $size: '$occupants' }, '$capacite' ] } }
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        byGender: stats,
        overall: overallStats[0] || { 
          totalRooms: 0, 
          totalCapacity: 0, 
          totalOccupants: 0,
          averageOccupancy: 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching room statistics:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
};

// Update chambre with gender validation for existing occupants
exports.updateChambre = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate room number if being updated
    if (req.body.numero) {
      const validation = validateRoomNumber(req.body.numero);
      if (!validation.valid) {
        return res.status(400).json({
          status: 'fail',
          message: validation.message
        });
      }
      
      // Check if room number is unique (excluding current room)
      const existingChambre = await Chambre.findOne({ 
        numero: req.body.numero, 
        _id: { $ne: id } 
      });
      
      if (existingChambre) {
        return res.status(400).json({
          status: 'fail',
          message: 'Une chambre avec ce numéro existe déjà'
        });
      }
      
      // Auto-update floor based on new room number
      req.body.etage = validation.floor;
    }
    
    // Auto-sync beds with capacity if capacity is being updated
    if (req.body.capacite) {
      req.body.nombreLits = req.body.capacite;
    }
    
    // If changing gender, validate current occupants
    if (req.body.gender && ['garcon', 'fille', 'mixte'].includes(req.body.gender)) {
      const chambre = await Chambre.findById(id).populate('occupants', 'sexe firstName lastName');
      
      if (chambre && chambre.occupants && chambre.occupants.length > 0) {
        // Check if current occupants are compatible with new gender
        if (req.body.gender !== 'mixte') {
          const incompatibleOccupants = chambre.occupants.filter(
            occupant => occupant.sexe !== req.body.gender
          );
          
          if (incompatibleOccupants.length > 0) {
            const incompatibleNames = incompatibleOccupants.map(o => `${o.firstName} ${o.lastName}`);
            return res.status(400).json({
              status: 'fail',
              message: `Impossible de changer le genre de la chambre. Les occupants suivants ne sont pas compatibles: ${incompatibleNames.join(', ')}`
            });
          }
        }
      }
    }

    const updateData = {
      numero: req.body.numero,
      capacite: req.body.capacite,
      nombreLits: req.body.nombreLits || req.body.capacite, // Ensure sync
      etage: req.body.etage,
      type: req.body.type,
      statut: req.body.statut,
      description: req.body.description,
      amenities: req.body.equipements || req.body.amenities,
      equipements: req.body.equipements || req.body.amenities,
      gender: req.body.gender
    };

    // Remove undefined properties
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );

    const updatedChambre = await Chambre.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    ).populate('occupants', 'firstName lastName email phoneNumber sexe type');

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
    console.error('Error updating chambre:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Récupérer une chambre par ID
exports.getChambre = async (req, res) => {
  try {
    const chambre = await Chambre.findById(req.params.id)
      .populate('occupants', 'firstName lastName email phoneNumber sexe type');
    
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
    
    // Check if room has occupants
    if (chambre.occupants && chambre.occupants.length > 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Impossible de supprimer une chambre occupée. Veuillez d\'abord retirer tous les occupants.'
      });
    }
    
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

exports.getChambreOccupants = async (req, res) => {
  try {
    const { id } = req.params;
    
    const chambre = await Chambre.findById(id);
    if (!chambre) {
      return res.status(404).json({
        status: 'fail',
        message: 'Chambre non trouvée'
      });
    }
    
    const occupantIds = chambre.occupants || [];
    
    if (occupantIds.length === 0) {
      return res.status(200).json({
        status: 'success',
        data: []
      });
    }
    
    const occupants = await Stagiaire.find({
      _id: { $in: occupantIds }
    }).select('_id firstName lastName email phoneNumber profilePhoto sexe type');
    
    
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

exports.checkOccupantsAvailability = async (req, res) => {
  try {
    const { occupantIds } = req.body;
    const roomId = req.params.id;
    
    const conflicts = [];
    
    // Check room assignments
    const occupiedRooms = await Chambre.find({
      _id: { $ne: roomId },
      occupants: { $in: occupantIds }
    }).select('_id numero occupants');
    
    for (const room of occupiedRooms) {
      const conflictingOccupants = room.occupants.filter(
        occupantId => occupantIds.includes(occupantId.toString())
      );
      
      for (const occupantId of conflictingOccupants) {
        if (!conflicts.some(c => c.occupantId === occupantId.toString())) {
          conflicts.push({
            occupantId: occupantId.toString(),
            roomId: room._id.toString(),
            roomNumber: room.numero
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
    console.error('Error checking occupants availability:', error);
    res.status(500).json({
      status: 'error',
      message: 'Une erreur est survenue lors de la vérification des occupants'
    });
  }
};