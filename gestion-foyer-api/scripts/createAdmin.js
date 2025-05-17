const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Load the User model directly to avoid circular dependencies
const User = require('../models/user');

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/gestion_foyer');
    console.log('Connected to MongoDB successfully');

    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'admin@example.com' });
    
    if (adminExists) {
      console.log('Admin user already exists');
    } else {
      // Create admin user
      const admin = await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin'
      });
      
      console.log('Admin user created successfully!');
      console.log('Admin details:');
      console.log(`- Name: ${admin.name}`);
      console.log(`- Email: ${admin.email}`);
      console.log(`- Password: admin123`);
      console.log(`- Role: ${admin.role}`);
    }
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    // Close the connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    }
    process.exit(0);
  }
};

// Run the function
createAdmin();