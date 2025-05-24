const Schedule = require('../models/Schedule');

// Get general schedule
exports.getGeneralSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findOne({ type: 'general' });
    
    res.status(200).json({
      status: 'success',
      data: schedule ? schedule.data : {}
    });
  } catch (error) {
    console.error('Error fetching general schedule:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching general schedule'
    });
  }
};

// Save general schedule
exports.saveGeneralSchedule = async (req, res) => {
  try {
    const { schedule } = req.body;
    
    if (!schedule) {
      return res.status(400).json({
        status: 'error',
        message: 'Schedule data is required'
      });
    }
    
    // Find and update, or create if not exists
    const updatedSchedule = await Schedule.findOneAndUpdate(
      { type: 'general' },
      { 
        data: schedule,
        updatedBy: req.user.id,
        lastUpdated: Date.now()
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    
    res.status(200).json({
      status: 'success',
      data: updatedSchedule.data
    });
  } catch (error) {
    console.error('Error saving general schedule:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error saving general schedule'
    });
  }
};