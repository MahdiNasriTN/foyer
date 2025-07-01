const Personnel = require('../models/personnel');
const mongoose = require('mongoose'); // Add this import at the top
const Excel = require('exceljs'); // For Excel export functionality

// Obtenir tous les membres du personnel avec filtrage
exports.getAllPersonnel = async (req, res) => {
  try {
    console.log('Received query parameters:', req.query); // Debug log
    
    const { 
      search = '', 
      status = 'all',
      department = 'all',
      role = 'all',
      startDate = '',
      endDate = '',
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      page = 1,
      limit = 50
    } = req.query;

    // Build query
    let query = {};

    // Search functionality
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { nom: searchRegex },
        { email: searchRegex },
        { identifier: searchRegex },
        { poste: searchRegex },
        { departement: searchRegex }
      ];
    }

    // Status filter
    if (status !== 'all') {
      query.statut = status === 'active' ? 'actif' : 'inactif';
    }

    // Department filter
    if (department !== 'all') {
      query.departement = department;
    }

    // Role filter (assuming you have a role field, otherwise map to poste)
    if (role !== 'all') {
      // If you don't have a role field, you can map roles to specific postes
      const roleMapping = {
        'admin': ['Administrator', 'Administrateur', 'Directeur'],
        'manager': ['Manager', 'Gestionnaire', 'Superviseur', 'Chef de service'],
        'employee': ['Employé', 'Agent', 'Technicien', 'Assistant']
      };
      
      if (roleMapping[role]) {
        query.poste = { $in: roleMapping[role] };
      } else {
        query.poste = role; // Direct mapping if not in predefined roles
      }
    }

    // Date range filter
    if (startDate || endDate) {
      query.dateEmbauche = {};
      
      if (startDate) {
        query.dateEmbauche.$gte = new Date(startDate);
      }
      
      if (endDate) {
        // Add one day to include the end date
        const endDateObj = new Date(endDate);
        endDateObj.setDate(endDateObj.getDate() + 1);
        query.dateEmbauche.$lt = endDateObj;
      }
    }

    console.log('MongoDB query:', JSON.stringify(query, null, 2)); // Debug log

    // Sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const personnel = await Personnel.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Personnel.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    console.log(`Found ${personnel.length} personnel out of ${total} total`); // Debug log

    res.status(200).json({
      status: 'success',
      results: personnel.length,
      totalPages,
      currentPage: parseInt(page),
      totalRecords: total,
      data: {
        personnel
      }
    });
  } catch (error) {
    console.error('Error getting personnel:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la récupération du personnel'
    });
  }
};

// GET personnel by ID (improved with ObjectId validation)
exports.getPersonnelById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'ID de format invalide'
      });
    }
    
    const personnel = await Personnel.findById(id);
    if (!personnel) {
      return res.status(404).json({
        status: 'error',
        message: 'Employé non trouvé'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        personnel
      }
    });
  } catch (error) {
    console.error('Error getting personnel by ID:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la récupération de l\'employé'
    });
  }
};

// Add a new function to search by identifier:
exports.getPersonnelByIdentifier = async (req, res) => {
  try {
    const { identifier } = req.params;
    
    const personnel = await Personnel.findOne({ identifier });
    if (!personnel) {
      return res.status(404).json({
        status: 'error',
        message: 'Employé non trouvé avec cet identifiant'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        personnel
      }
    });
  } catch (error) {
    console.error('Error getting personnel by identifier:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la recherche de l\'employé'
    });
  }
};

// Créer un nouveau membre du personnel
exports.createPersonnel = async (req, res) => {
  try {
    const {
      identifier,
      firstName,
      lastName,
      email,
      telephone,
      poste,
      departement,
      dateEmbauche,
      statut,
      adresse
      // Removed permissions
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !telephone || !poste || !departement || !dateEmbauche) {
      return res.status(400).json({
        status: 'error',
        message: 'Tous les champs obligatoires doivent être remplis'
      });
    }

    // Check if email already exists
    const existingEmail = await Personnel.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({
        status: 'error',
        message: 'Un employé avec cet email existe déjà'
      });
    }

    // Check if identifier already exists (if provided)
    if (identifier) {
      const existingIdentifier = await Personnel.findOne({ identifier });
      if (existingIdentifier) {
        return res.status(400).json({
          status: 'error',
          message: 'Un employé avec cet identifiant existe déjà'
        });
      }
    }

    // Create new personnel
    const personnel = new Personnel({
      identifier,
      firstName,
      lastName,
      email: email.toLowerCase(),
      telephone,
      poste,
      departement,
      dateEmbauche,
      statut: statut || 'actif',
      adresse
      // Removed permissions
    });

    const savedPersonnel = await personnel.save();

    res.status(201).json({
      status: 'success',
      message: 'Employé créé avec succès',
      data: {
        personnel: savedPersonnel
      }
    });
  } catch (error) {
    console.error('Error creating personnel:', error);
    
    if (error.code === 11000) {
      // Handle duplicate key error
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        status: 'error',
        message: `Un employé avec cet ${field === 'email' ? 'email' : 'identifiant'} existe déjà`
      });
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        status: 'error',
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la création de l\'employé'
    });
  }
};

// Mettre à jour un membre du personnel
exports.updatePersonnel = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'ID de format invalide'
      });
    }
    
    const {
      identifier,
      firstName,
      lastName,
      email,
      telephone,
      poste,
      departement,
      dateEmbauche,
      statut,
      adresse
      // Removed permissions
    } = req.body;

    // Find the personnel
    const personnel = await Personnel.findById(id);
    if (!personnel) {
      return res.status(404).json({
        status: 'error',
        message: 'Employé non trouvé'
      });
    }

    // Check if email is being changed and if it already exists
    if (email && email.toLowerCase() !== personnel.email) {
      const existingEmail = await Personnel.findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: id }
      });
      if (existingEmail) {
        return res.status(400).json({
          status: 'error',
          message: 'Un employé avec cet email existe déjà'
        });
      }
    }

    // Check if identifier is being changed and if it already exists
    if (identifier && identifier !== personnel.identifier) {
      const existingIdentifier = await Personnel.findOne({ 
        identifier: identifier,
        _id: { $ne: id }
      });
      if (existingIdentifier) {
        return res.status(400).json({
          status: 'error',
          message: 'Un employé avec cet identifiant existe déjà'
        });
      }
    }

    // Update personnel (removed permissions)
    const updatedPersonnel = await Personnel.findByIdAndUpdate(
      id,
      {
        identifier: identifier || personnel.identifier,
        firstName,
        lastName,
        email: email ? email.toLowerCase() : personnel.email,
        telephone,
        poste,
        departement,
        dateEmbauche,
        statut,
        adresse
        // Removed permissions
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'Employé mis à jour avec succès',
      data: {
        personnel: updatedPersonnel
      }
    });
  } catch (error) {
    console.error('Error updating personnel:', error);
    
    if (error.code === 11000) {
      // Handle duplicate key error for both email and identifier
      const field = Object.keys(error.keyPattern)[0];
      const fieldName = field === 'email' ? 'email' : 
                       field === 'identifier' ? 'identifiant' : field;
      return res.status(400).json({
        status: 'error',
        message: `Un employé avec cet ${fieldName} existe déjà`
      });
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        status: 'error',
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la mise à jour de l\'employé'
    });
  }
};

// Obtenir des statistiques sur le personnel
exports.getPersonnelStats = async (req, res) => {
  try {
    // Get total count
    const totalPersonnel = await Personnel.countDocuments();
    
    // Get active count
    const activePersonnel = await Personnel.countDocuments({ statut: 'actif' });
    
    // Get inactive count
    const inactivePersonnel = await Personnel.countDocuments({ statut: 'inactif' });
    
    // Get count by department
    const departmentStats = await Personnel.aggregate([
      {
        $group: {
          _id: '$departement',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // Get count by position
    const positionStats = await Personnel.aggregate([
      {
        $group: {
          _id: '$poste',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // Get recent hires (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentHires = await Personnel.countDocuments({
      dateEmbauche: { $gte: thirtyDaysAgo }
    });

    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          total: totalPersonnel,
          active: activePersonnel,
          inactive: inactivePersonnel,
          recentHires,
          departmentBreakdown: departmentStats,
          positionBreakdown: positionStats
        }
      }
    });
  } catch (error) {
    console.error('Error getting personnel stats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la récupération des statistiques du personnel'
    });
  }
};

// Obtenir le planning d'un membre du personnel
exports.getPersonnelSchedule = async (req, res) => {
  try {
    const personnel = await Personnel.findById(req.params.id);
    
    if (!personnel) {
      return res.status(404).json({
        status: 'fail',
        message: 'Personnel not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        schedule: personnel.schedule || {}
      }
    });
  } catch (error) {
    console.error('Error getting personnel schedule:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Mettre à jour le planning d'un membre du personnel
exports.updatePersonnelSchedule = async (req, res) => {
  try {
    const personnel = await Personnel.findById(req.params.id);
    
    if (!personnel) {
      return res.status(404).json({
        status: 'fail',
        message: 'Personnel not found'
      });
    }
    
    // Mettre à jour le planning
    personnel.schedule = req.body.schedule;
    await personnel.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        schedule: personnel.schedule
      }
    });
  } catch (error) {
    console.error('Error updating personnel schedule:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// DELETE personnel
exports.deletePersonnel = async (req, res) => {
  try {
    const { id } = req.params;
    
    const personnel = await Personnel.findById(id);
    if (!personnel) {
      return res.status(404).json({
        status: 'error',
        message: 'Employé non trouvé'
      });
    }

    await Personnel.findByIdAndDelete(id);

    res.status(200).json({
      status: 'success',
      message: 'Employé supprimé avec succès'
    });
  } catch (error) {
    console.error('Error deleting personnel:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la suppression de l\'employé'
    });
  }
};

// Update the exportPersonnel function
exports.exportPersonnel = async (req, res) => {
  try {
    console.log('Export request received with query:', req.query);
    
    const { 
      search = '', 
      status = 'all', 
      department = 'all',
      poste = 'all',
      format = 'csv' // csv, excel, pdf
    } = req.query;

    // Build query - same logic as getAllPersonnel
    let query = {};

    // Search functionality
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query = {
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { nom: searchRegex },
          { email: searchRegex },
          { identifier: searchRegex },
          { poste: searchRegex },
          { departement: searchRegex }
        ]
      };
    }

    // Status filter
    if (status !== 'all') {
      query.statut = status;
    }

    // Department filter
    if (department !== 'all') {
      query.departement = department;
    }

    // Poste filter
    if (poste !== 'all') {
      query.poste = poste;
    }

    console.log('MongoDB query:', JSON.stringify(query, null, 2));

    // Get all personnel matching filters
    const personnel = await Personnel.find(query).sort({ poste: 1, nom: 1 });

    console.log(`Found ${personnel.length} personnel records`);

    // Group by poste
    const personnelByPoste = personnel.reduce((acc, emp) => {
      const posteKey = emp.poste || 'Non spécifié';
      if (!acc[posteKey]) {
        acc[posteKey] = [];
      }
      acc[posteKey].push({
        identifier: emp.identifier || '',
        nom: emp.nom || `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
        email: emp.email || '',
        telephone: emp.telephone || '',
        poste: emp.poste || '',
        departement: emp.departement || '',
        dateEmbauche: emp.dateEmbauche ? new Date(emp.dateEmbauche).toLocaleDateString('fr-FR') : '',
        statut: emp.statut || '',
        adresse: emp.adresse || ''
      });
      return acc;
    }, {});

    if (format === 'csv') {
      // Generate CSV
      let csvContent = 'Poste,Identifiant,Nom,Email,Téléphone,Département,Date d\'embauche,Statut,Adresse\n';
      
      Object.keys(personnelByPoste).sort().forEach(poste => {
        personnelByPoste[poste].forEach(emp => {
          const csvRow = [
            poste,
            emp.identifier,
            emp.nom,
            emp.email,
            emp.telephone,
            emp.departement,
            emp.dateEmbauche,
            emp.statut,
            emp.adresse
          ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
          
          csvContent += csvRow + '\n';
        });
      });

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=personnel_par_poste_${new Date().toISOString().split('T')[0]}.csv`);
      return res.send('\uFEFF' + csvContent); // Add BOM for proper UTF-8 encoding
    }

    if (format === 'excel') {
      // Generate Excel file
      const workbook = new Excel.Workbook();
      const worksheet = workbook.addWorksheet('Personnel par Poste');

      // Set worksheet columns
      worksheet.columns = [
        { header: 'Poste', key: 'poste', width: 20 },
        { header: 'Identifiant', key: 'identifier', width: 15 },
        { header: 'Nom', key: 'nom', width: 25 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Téléphone', key: 'telephone', width: 15 },
        { header: 'Département', key: 'departement', width: 20 },
        { header: 'Date d\'embauche', key: 'dateEmbauche', width: 15 },
        { header: 'Statut', key: 'statut', width: 10 },
        { header: 'Adresse', key: 'adresse', width: 30 }
      ];

      // Style the header row
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };

      // Add data rows
      Object.keys(personnelByPoste).sort().forEach(poste => {
        personnelByPoste[poste].forEach(emp => {
          worksheet.addRow({
            poste: poste,
            identifier: emp.identifier || '-',
            nom: emp.nom || '-',
            email: emp.email || '-',
            telephone: emp.telephone || '-',
            departement: emp.departement || '-',
            dateEmbauche: emp.dateEmbauche || '-',
            statut: emp.statut || '-',
            adresse: emp.adresse || '-'
          });
        });
      });

      // Add borders to all cells
      worksheet.eachRow(row => {
        row.eachCell(cell => {
          cell.border = { 
            top: { style: 'thin' }, 
            left: { style: 'thin' }, 
            bottom: { style: 'thin' }, 
            right: { style: 'thin' } 
          };
        });
      });

      // Set up autofilter
      worksheet.autoFilter = { from: 'A1', to: 'I1' };

      // Generate filename with current date
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `personnel_par_poste_${dateStr}.xlsx`;

      // Set proper headers for Excel file download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      // Write the Excel file to the response
      await workbook.xlsx.write(res);
      res.end();
      
      console.log(`Personnel Excel export completed successfully: ${filename}`);
      return;
    }

    // Return JSON format for other formats or frontend processing
    res.status(200).json({
      status: 'success',
      data: {
        personnelByPoste,
        totalCount: personnel.length,
        exportDate: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error exporting personnel:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de l\'export du personnel',
      error: error.message
    });
  }
};

// Add function to get unique postes for filter
exports.getUniquePostes = async (req, res) => {
  try {
    const postes = await Personnel.distinct('poste');
    res.status(200).json({
      status: 'success',
      data: {
        postes: postes.filter(p => p && p.trim() !== '').sort()
      }
    });
  } catch (error) {
    console.error('Error getting unique postes:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la récupération des postes'
    });
  }
};