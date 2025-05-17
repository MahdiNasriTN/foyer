const Chambre = require('../models/chambre');
const Stagiaire = require('../models/stagiaire');

// Récupérer toutes les chambres avec filtres
exports.getAllChambres = async (req, res) => {
  try {
    let query = {};
    
    // Filtrage par statut
    if (req.query.status) {
      query.statut = req.query.status;
    }
    
    // Filtrage par étage
    if (req.query.etage) {
      query.etage = parseInt(req.query.etage);
    }
    
    // Recherche par numéro
    if (req.query.search) {
      query.numero = { $regex: req.query.search, $options: 'i' };
    }
    
    // Tri
    let sortOption = {};
    if (req.query.sortBy) {
      const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
      sortOption[req.query.sortBy] = sortOrder;
    } else {
      sortOption = { numero: 1 };
    }
    
    // Exécution de la requête avec populate pour obtenir les détails des occupants
    const chambres = await Chambre.find(query)
      .sort(sortOption)
      .populate('occupants');
    
    res.status(200).json({
      status: 'success',
      results: chambres.length,
      data: chambres
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
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
    if (statut === 'libre') statut = 'disponible';
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
    const { occupantIds } = req.body;
    const chambreId = req.params.id;
    
    if (!occupantIds || !Array.isArray(occupantIds)) {
      return res.status(400).json({
        status: 'fail',
        message: 'La liste des occupants est requise'
      });
    }
    
    // Récupérer la chambre
    const chambre = await Chambre.findById(chambreId);
    
    if (!chambre) {
      return res.status(404).json({
        status: 'fail',
        message: 'Chambre non trouvée'
      });
    }
    
    // Vérifier que le nombre d'occupants ne dépasse pas la capacité
    if (occupantIds.length > chambre.capacite) {
      return res.status(400).json({
        status: 'fail',
        message: `La chambre ne peut pas accueillir plus de ${chambre.capacite} personnes`
      });
    }
    
    // Mise à jour du statut de la chambre
    chambre.statut = occupantIds.length > 0 ? 'occupée' : 'libre';
    await chambre.save();
    
    // Retirer tous les occupants actuels de la chambre
    await Stagiaire.updateMany(
      { chambre: chambreId },
      { $unset: { chambre: 1 } }
    );
    
    // Assigner les nouveaux occupants si la liste n'est pas vide
    if (occupantIds.length > 0) {
      await Stagiaire.updateMany(
        { _id: { $in: occupantIds } },
        { chambre: chambreId }
      );
    }
    
    // Récupérer la chambre mise à jour avec les informations des occupants
    const updatedChambre = await Chambre.findById(chambreId).populate('occupants');
    
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

// Ajouter cette méthode à votre contrôleur
exports.getChambreOccupants = async (req, res) => {
  try {
    const chambreId = req.params.id;
    
    // Trouver tous les stagiaires assignés à cette chambre
    const occupants = await Stagiaire.find({ chambre: chambreId })
      .select('_id firstName lastName phoneNumber email profilePhoto'); // Sélectionnez les champs pertinents
    
    res.status(200).json({
      status: 'success',
      results: occupants.length,
      data: occupants
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};