const Chambre = require('../models/chambre');
const Stagiaire = require('../models/stagiaire');
const KitchenTask = require('../models/kitchenTask');
const User = require('../models/user');

// Get all dashboard data in a single request
exports.getDashboardStats = async (req, res) => {
  try {
    // Get current date for filtering
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    // Run all queries concurrently for better performance
    const [
      chambres,
      stagiaires,
      users,
      upcomingTasks,
      weeklyActivity
    ] = await Promise.all([
      // Get all chambres
      Chambre.find(),
      
      // Get all stagiaires
      Stagiaire.find().populate('chambre', 'numero etage'),
      
      // Get users count (excluding admin)
      User.countDocuments({ role: 'staff' }),
      
      // Get upcoming kitchen tasks for today and tomorrow
      KitchenTask.find({
        date: {
          $gte: today,
          $lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)
        }
      }).populate('stagiaire', 'firstName lastName')
        .populate('assignedBy', 'name')
        .sort({ date: 1 }),
      
      // Get task distribution for the week
      KitchenTask.aggregate([
        {
          $match: {
            date: { 
              $gte: weekStart, 
              $lte: weekEnd 
            }
          }
        },
        {
          $group: {
            _id: { 
              $dateToString: { format: "%Y-%m-%d", date: "$date" } 
            },
            completed: {
              $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
            },
            pending: {
              $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] }
            },
            total: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    // Format data for frontend consumption
    const stats = {
      chambres: {
        total: chambres.length,
        disponibles: chambres.filter(c => c.statut === 'disponible').length,
        occupees: chambres.filter(c => c.statut === 'occupee').length,
        maintenances: chambres.filter(c => c.statut === 'maintenance').length,
        occupationRate: chambres.length ? 
          Math.round((chambres.filter(c => c.statut === 'occupee').length / chambres.length) * 100) : 0,
        chambresLibres: chambres.filter(c => c.statut === 'disponible')
          .map(c => ({ id: c._id, numero: c.numero }))
      },
      occupants: {
        total: stagiaires.length,
        hommes: stagiaires.filter(s => s.sexe === 'homme').length,
        femmes: stagiaires.filter(s => s.sexe === 'femme').length,
        internes: stagiaires.filter(s => s.type === 'interne').length,
        externes: stagiaires.filter(s => s.type === 'externe').length
      },
      staff: {
        total: users
      },
      tasks: {
        upcoming: upcomingTasks.map(task => ({
          id: task._id,
          title: task.title,
          date: task.date,
          status: task.status,
          assignedTo: task.stagiaire ? 
            `${task.stagiaire.firstName} ${task.stagiaire.lastName}` : 'Non assigné',
          timeSlot: task.heureDebut ? `${task.heureDebut} - ${task.heureFin || ''}` : 'Toute la journée'
        }))
      },
      weeklyActivity: weeklyActivity.map(day => {
        const date = new Date(day._id);
        const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
        return {
          name: dayNames[date.getDay()],
          date: day._id,
          completed: day.completed || 0,
          pending: day.pending || 0,
          total: day.total || 0
        };
      })
    };

    // Add any alerts
    const alerts = [];
    
    // Check for nearly full capacity
    if (stats.chambres.occupationRate > 90) {
      alerts.push({
        id: 'capacity-alert',
        type: 'warning',
        message: 'Capacité d\'hébergement presque atteinte',
        time: 'Maintenant'
      });
    }
    
    // Check for maintenance issues
    if (stats.chambres.maintenances > 0) {
      alerts.push({
        id: 'maintenance-alert',
        type: 'info',
        message: `${stats.chambres.maintenances} chambre(s) en maintenance`,
        time: 'Aujourd\'hui'
      });
    }

    // Add alerts to response
    stats.alerts = alerts;

    res.status(200).json({
      status: 'success',
      data: stats
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};