const Chambre = require('../models/chambre');
const Stagiaire = require('../models/stagiaire');
const User = require('../models/user');

exports.getDashboardStats = async (req, res) => {
  try {
    // Fetch all rooms with populated occupants
    const chambres = await Chambre.find()
      .populate('occupants', 'firstName lastName sexe type')
      .lean();

    // Fetch all stagiaires
    const stagiaires = await Stagiaire.find().lean();

    // Fetch all users (personnel)
    const users = await User.find().lean();

    // Calculate room statistics
    const totalChambres = chambres.length;
    const chambresOccupees = chambres.filter(c => c.occupants && c.occupants.length > 0).length;
    const chambresDisponibles = totalChambres - chambresOccupees;
    const occupationRate = totalChambres > 0 ? Math.round((chambresOccupees / totalChambres) * 100) : 0;

    // Get available rooms list
    const chambresLibres = chambres
      .filter(c => !c.occupants || c.occupants.length === 0)
      .map(c => ({
        numero: c.numero,
        etage: c.etage || 1,
        capacite: c.capacite,
        gender: c.gender || 'mixte'
      }));

    // Calculate stagiaire statistics
    const totalStagiaires = stagiaires.length;
    const stagiairesHommes = stagiaires.filter(s => s.sexe === 'garcon' || s.sexe === 'homme' || s.sexe === 'M').length;
    const stagiairesFemmes = stagiaires.filter(s => s.sexe === 'fille' || s.sexe === 'femme' || s.sexe === 'F').length;
    const stagiairesInternes = stagiaires.filter(s => s.type === 'interne').length;
    const stagiairesExternes = stagiaires.filter(s => s.type === 'externe').length;

    // Get all occupants from rooms for cross-reference
    const occupantsInRooms = [];
    chambres.forEach(chambre => {
      if (chambre.occupants && chambre.occupants.length > 0) {
        chambre.occupants.forEach(occupant => {
          occupantsInRooms.push({
            ...occupant,
            roomNumber: chambre.numero,
            roomFloor: chambre.etage
          });
        });
      }
    });

    // Calculate staff statistics
    const totalStaff = users.length;

    // Additional room statistics by floor
    const roomsByFloor = {
      1: chambres.filter(c => c.etage === 1).length,
      2: chambres.filter(c => c.etage === 2).length,
      3: chambres.filter(c => c.etage === 3).length,
      4: chambres.filter(c => c.etage === 4).length
    };

    // Room capacity statistics
    const totalCapacity = chambres.reduce((sum, c) => sum + (c.capacite || 0), 0);
    const occupiedCapacity = occupantsInRooms.length;
    const availableCapacity = totalCapacity - occupiedCapacity;

    // Recent activity (mock for now - you can implement real activity tracking)
    const recentActivity = [
      {
        type: 'room_assignment',
        message: `${occupantsInRooms.length} stagiaires actuellement logés`,
        timestamp: new Date()
      },
      {
        type: 'room_availability',
        message: `${chambresDisponibles} chambres disponibles`,
        timestamp: new Date()
      }
    ];

    const responseData = {
      chambres: {
        total: totalChambres,
        occupees: chambresOccupees,
        disponibles: chambresDisponibles,
        occupationRate: occupationRate,
        chambresLibres: chambresLibres,
        byFloor: roomsByFloor,
        capacity: {
          total: totalCapacity,
          occupied: occupiedCapacity,
          available: availableCapacity
        }
      },
      occupants: {
        total: totalStagiaires,
        hommes: stagiairesHommes,
        femmes: stagiairesFemmes,
        internes: stagiairesInternes,
        externes: stagiairesExternes,
        inRooms: occupantsInRooms.length,
        list: occupantsInRooms
      },
      staff: {
        total: totalStaff,
        administrators: Math.ceil(totalStaff * 0.3),
        supervisors: Math.ceil(totalStaff * 0.5),
        maintenance: Math.floor(totalStaff * 0.2)
      },
      recentActivity: recentActivity,
      lastUpdated: new Date()
    };

    res.status(200).json({
      status: 'success',
      data: responseData
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la récupération des statistiques du tableau de bord',
      error: error.message
    });
  }
};

// Get quick summary for header stats
exports.getQuickStats = async (req, res) => {
  try {
    const [chambresCount, stagiairesCount, usersCount] = await Promise.all([
      Chambre.countDocuments(),
      Stagiaire.countDocuments(),
      User.countDocuments()
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        chambres: chambresCount,
        stagiaires: stagiairesCount,
        personnel: usersCount
      }
    });
  } catch (error) {
    console.error('Error fetching quick stats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la récupération des statistiques rapides'
    });
  }
};