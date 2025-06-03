const bcrypt = require('bcrypt');
const { User } = require('../models');
const sequelize = require('../config/database');

const resetPassword = async () => {
  try {
    // Connect to database
    await sequelize.authenticate();

    // Find user by email
    const email = 'admin@example.com'; // Change to your admin email
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return;
    }
    
    // Hash the new password
    const newPassword = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update the user's password
    user.password = hashedPassword;
    await user.save();
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
};

resetPassword();