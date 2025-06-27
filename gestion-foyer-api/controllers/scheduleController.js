const Schedule = require('../models/Schedule');
const Personnel = require('../models/personnel');

// Save general schedule - UPDATED to handle both create and update
exports.saveGeneralSchedule = async (req, res) => {
  try {
    const { scheduleData } = req.body;
    
    if (!scheduleData) {
      return res.status(400).json({
        status: 'error',
        message: 'Données de planning requises'
      });
    }

    console.log('Saving schedule data:', scheduleData);

    const operations = [];
    let personnelProcessed = 0;
    let shiftsProcessed = 0;

    // Process each personnel's schedule
    for (const [personnelId, personalSchedule] of Object.entries(scheduleData)) {
      // Verify personnel exists
      const personnel = await Personnel.findById(personnelId);
      if (!personnel) {
        console.log(`Personnel ${personnelId} not found, skipping`);
        continue;
      }

      personnelProcessed++;

      // Process each day
      for (const [day, shiftData] of Object.entries(personalSchedule)) {
        const scheduleEntry = {
          personnelId,
          day,
          isDayOff: shiftData.isDayOff || false,
          notes: shiftData.notes || '',
          updatedAt: new Date(),
          createdBy: req.user?.id
        };

        // Add time and tasks only if it's not a day off
        if (!shiftData.isDayOff) {
          scheduleEntry.startTime = shiftData.startTime;
          scheduleEntry.endTime = shiftData.endTime;
          scheduleEntry.tasks = shiftData.tasks || [];
        } else {
          // Clear time and tasks for day off
          scheduleEntry.startTime = null;
          scheduleEntry.endTime = null;
          scheduleEntry.tasks = [];
        }

        operations.push({
          updateOne: {
            filter: { 
              personnelId, 
              day
            },
            update: { $set: scheduleEntry },
            upsert: true
          }
        });

        shiftsProcessed++;
      }
    }

    // Execute all operations
    let result = null;
    if (operations.length > 0) {
      result = await Schedule.bulkWrite(operations);
      console.log('Bulk write result:', {
        matched: result.matchedCount,
        modified: result.modifiedCount,
        upserted: result.upsertedCount
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Planning sauvegardé avec succès',
      data: {
        personnelProcessed,
        shiftsProcessed,
        operations: operations.length,
        result: result ? {
          matched: result.matchedCount,
          modified: result.modifiedCount,
          upserted: result.upsertedCount
        } : null
      }
    });
  } catch (error) {
    console.error('Error saving schedule:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la sauvegarde du planning',
      details: error.message
    });
  }
};

// Get general schedule - ENHANCED with better error handling
exports.getGeneralSchedule = async (req, res) => {
  try {
    console.log('Fetching general schedule...');
    
    const schedules = await Schedule.find({})
      .populate('personnelId', 'firstName lastName poste departement profilePhoto')
      .sort({ personnelId: 1, day: 1 });

    console.log('Found schedules:', schedules.length);

    // Transform data to frontend format
    const scheduleData = {};
    let processedCount = 0;
    
    schedules.forEach(schedule => {
      // Check if personnel was populated successfully
      if (!schedule.personnelId || !schedule.personnelId._id) {
        console.warn('Schedule found with invalid personnel reference:', schedule._id);
        return;
      }

      const personnelId = schedule.personnelId._id.toString();
      
      if (!scheduleData[personnelId]) {
        scheduleData[personnelId] = {};
      }
      
      scheduleData[personnelId][schedule.day] = {
        _id: schedule._id, // Include ID for updates
        isDayOff: schedule.isDayOff,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        notes: schedule.notes || '',
        tasks: schedule.tasks || [],
        updatedAt: schedule.updatedAt,
        createdAt: schedule.createdAt
      };

      processedCount++;
    });

    console.log('Transformed schedule data for', Object.keys(scheduleData).length, 'personnel');

    res.status(200).json({
      status: 'success',
      data: scheduleData,
      meta: {
        totalSchedules: schedules.length,
        processedSchedules: processedCount,
        personnelCount: Object.keys(scheduleData).length
      }
    });
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la récupération du planning',
      details: error.message
    });
  }
};

// NEW: Delete specific shift
exports.deleteShift = async (req, res) => {
  try {
    const { personnelId, day } = req.params;

    if (!personnelId || !day) {
      return res.status(400).json({
        status: 'error',
        message: 'Personnel ID et jour requis'
      });
    }

    const result = await Schedule.deleteOne({
      personnelId,
      day
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Horaire non trouvé'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Horaire supprimé avec succès',
      data: {
        personnelId,
        day,
        deletedCount: result.deletedCount
      }
    });
  } catch (error) {
    console.error('Error deleting shift:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la suppression de l\'horaire',
      details: error.message
    });
  }
};

// Get personnel schedule summary - ENHANCED
exports.getPersonnelScheduleSummary = async (req, res) => {
  try {
    const summary = await Schedule.aggregate([
      {
        $lookup: {
          from: 'personnels',
          localField: 'personnelId',
          foreignField: '_id',
          as: 'personnel'
        }
      },
      {
        $unwind: '$personnel'
      },
      {
        $group: {
          _id: '$personnelId',
          personnel: { $first: '$personnel' },
          totalWorkDays: {
            $sum: {
              $cond: [{ $eq: ['$isDayOff', false] }, 1, 0]
            }
          },
          totalDaysOff: {
            $sum: {
              $cond: [{ $eq: ['$isDayOff', true] }, 1, 0]
            }
          },
          totalWorkHours: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ['$isDayOff', false] },
                  { $ne: ['$startTime', null] },
                  { $ne: ['$endTime', null] }
                ]},
                { $subtract: ['$endTime', '$startTime'] },
                0
              ]
            }
          },
          averageWorkHours: {
            $avg: {
              $cond: [
                { $and: [
                  { $eq: ['$isDayOff', false] },
                  { $ne: ['$startTime', null] },
                  { $ne: ['$endTime', null] }
                ]},
                { $subtract: ['$endTime', '$startTime'] },
                null
              ]
            }
          },
          scheduleCount: { $sum: 1 }
        }
      },
      {
        $sort: { 'personnel.lastName': 1, 'personnel.firstName': 1 }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: summary,
      meta: {
        totalPersonnel: summary.length
      }
    });
  } catch (error) {
    console.error('Error fetching schedule summary:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la récupération du résumé du planning',
      details: error.message
    });
  }
};