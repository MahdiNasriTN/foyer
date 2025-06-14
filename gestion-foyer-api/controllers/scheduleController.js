const Schedule = require('../models/Schedule');
const Personnel = require('../models/personnel');

// Save general schedule
exports.saveGeneralSchedule = async (req, res) => {
  try {
    const { scheduleData } = req.body;
    
    if (!scheduleData) {
      return res.status(400).json({
        status: 'error',
        message: 'Données de planning requises'
      });
    }

    console.log('Saving schedule data:', scheduleData); // Debug log

    const operations = [];

    // Process each personnel's schedule
    for (const [personnelId, personalSchedule] of Object.entries(scheduleData)) {
      // Verify personnel exists
      const personnel = await Personnel.findById(personnelId);
      if (!personnel) {
        console.log(`Personnel ${personnelId} not found, skipping`);
        continue; // Skip if personnel doesn't exist
      }

      // Process each day
      for (const [day, shiftData] of Object.entries(personalSchedule)) {
        const scheduleEntry = {
          personnelId,
          day,
          isDayOff: shiftData.isDayOff || false,
          notes: shiftData.notes || '',
          createdBy: req.user?.id // If you have user authentication
        };

        // Add time and tasks only if it's not a day off
        if (!shiftData.isDayOff) {
          scheduleEntry.startTime = shiftData.startTime;
          scheduleEntry.endTime = shiftData.endTime;
          scheduleEntry.tasks = shiftData.tasks || [];
        }

        operations.push({
          updateOne: {
            filter: { 
              personnelId, 
              day
            },
            update: scheduleEntry,
            upsert: true
          }
        });
      }
    }

    // Execute all operations
    if (operations.length > 0) {
      const result = await Schedule.bulkWrite(operations);
      console.log('Bulk write result:', result); // Debug log
    }

    res.status(200).json({
      status: 'success',
      message: 'Planning sauvegardé avec succès',
      data: {
        saved: operations.length
      }
    });
  } catch (error) {
    console.error('Error saving schedule:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la sauvegarde du planning'
    });
  }
};

// Get general schedule - SIMPLIFIED without date filtering
exports.getGeneralSchedule = async (req, res) => {
  try {
    console.log('Fetching general schedule...'); // Debug log
    
    const schedules = await Schedule.find({})
      .populate('personnelId', 'firstName lastName poste departement');

    console.log('Found schedules:', schedules.length); // Debug log

    // Transform data to frontend format
    const scheduleData = {};
    
    schedules.forEach(schedule => {
      const personnelId = schedule.personnelId._id.toString();
      
      if (!scheduleData[personnelId]) {
        scheduleData[personnelId] = {};
      }
      
      scheduleData[personnelId][schedule.day] = {
        isDayOff: schedule.isDayOff,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        notes: schedule.notes,
        tasks: schedule.tasks
      };
    });

    console.log('Transformed schedule data:', scheduleData); // Debug log

    res.status(200).json({
      status: 'success',
      data: scheduleData
    });
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la récupération du planning'
    });
  }
};

// Get personnel schedule summary
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
                { $eq: ['$isDayOff', false] },
                { $subtract: ['$endTime', '$startTime'] },
                0
              ]
            }
          }
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: summary
    });
  } catch (error) {
    console.error('Error fetching schedule summary:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la récupération du résumé du planning'
    });
  }
};