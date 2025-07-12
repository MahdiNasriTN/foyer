import React, { useState, useEffect } from 'react';
import { PlusIcon, XIcon, ChevronDownIcon, ClockIcon, DocumentTextIcon, BadgeCheckIcon, DownloadIcon } from '@heroicons/react/outline';
import { fetchAllPersonnel, saveGeneralSchedule, fetchGeneralSchedule } from '../../services/scheduleService';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // FIXED: Import autoTable as a named export

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const COLORS = [
    { bg: 'from-blue-50 to-indigo-50', text: 'text-blue-800', border: 'border-blue-200' },
    { bg: 'from-purple-50 to-indigo-50', text: 'text-purple-800', border: 'border-purple-200' },
    { bg: 'from-green-50 to-emerald-50', text: 'text-green-800', border: 'border-green-200' },
    { bg: 'from-amber-50 to-orange-50', text: 'text-amber-800', border: 'border-amber-200' },
    { bg: 'from-rose-50 to-pink-50', text: 'text-rose-800', border: 'border-rose-200' },
];

const GeneralSchedule = () => {
    const [personnel, setPersonnel] = useState([]);
    const [scheduleData, setScheduleData] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isAddingShift, setIsAddingShift] = useState(false);
    const [selectedCell, setSelectedCell] = useState({ personnelId: null, day: null, person: null });
    const [shiftDetails, setShiftDetails] = useState({
        startTime: 8,
        endTime: 17,
        notes: '',
        tasks: [],
        isDayOff: false
    });
    const [newTask, setNewTask] = useState('');
    const [isEditingShift, setIsEditingShift] = useState(false);
    const [editingShiftData, setEditingShiftData] = useState(null);

    // NEW: Add filter states
    const [filters, setFilters] = useState({
        poste: 'all', // CHANGED: from 'role' to 'poste'
        name: ''
    });

    // NEW: Add filtered personnel computed value
    const filteredPersonnel = personnel.filter(person => {
        const matchesPoste = filters.poste === 'all' || person.poste === filters.poste; // CHANGED: from role to poste
        const matchesName = filters.name === '' ||
            `${person.firstName} ${person.lastName}`.toLowerCase().includes(filters.name.toLowerCase()) ||
            person.firstName.toLowerCase().includes(filters.name.toLowerCase()) ||
            person.lastName.toLowerCase().includes(filters.name.toLowerCase());

        return matchesPoste && matchesName;
    });

    // NEW: Get unique postes from personnel
    const uniquePostes = [...new Set(personnel.map(person => person.poste).filter(Boolean))]; // CHANGED: from role to poste

    // NEW: Handle filter changes
    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };

    // NEW: Clear all filters
    const clearFilters = () => {
        setFilters({
            poste: 'all', // CHANGED: from 'role' to 'poste'
            name: ''
        });
    };

    // Load all personnel and schedule data
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);

                // Load all personnel
                const personnelResponse = await fetchAllPersonnel();
                console.log('Personnel response:', personnelResponse);

                let personnelList = [];
                if (personnelResponse.personnel) {
                    personnelList = personnelResponse.personnel;
                } else if (personnelResponse.data && personnelResponse.data.personnel) {
                    personnelList = personnelResponse.data.personnel;
                } else if (Array.isArray(personnelResponse.data)) {
                    personnelList = personnelResponse.data;
                } else if (Array.isArray(personnelResponse)) {
                    personnelList = personnelResponse;
                } else {
                    console.warn('Unexpected personnel response structure:', personnelResponse);
                    personnelList = [];
                }

                console.log('Processed personnel list:', personnelList);
                setPersonnel(personnelList);

                // Load general schedule (no date parameter)
                const scheduleResponse = await fetchGeneralSchedule();
                console.log('Schedule response:', scheduleResponse);
                setScheduleData(scheduleResponse.data || {});
            } catch (err) {
                console.error('Error loading schedule data:', err);
                setError('Une erreur est survenue lors du chargement des données');
                setPersonnel([]);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // Auto-dismiss success message
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                setSuccess(null);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [success]);

    // Get shift for a specific cell
    const getShiftForCell = (personnelId, day) => {
        if (!scheduleData[personnelId] || !scheduleData[personnelId][day]) return null;
        return scheduleData[personnelId][day];
    };

    // Handle cell click to add a shift
    const handleCellClick = (personnelId, day, person) => {
        // If there's already a shift, don't do anything (clicking on shift will handle edit)
        if (getShiftForCell(personnelId, day)) return;

        setSelectedCell({ personnelId, day, person });
        setShiftDetails({
            startTime: 8,
            endTime: 17,
            notes: '',
            tasks: [],
            isDayOff: false
        });
        setIsEditingShift(false);
        setEditingShiftData(null);
        setIsAddingShift(true);
    };

    // NEW: Handle clicking on existing shifts
    const handleShiftClick = (personnelId, day, person, existingShift) => {
        setSelectedCell({ personnelId, day, person });
        setShiftDetails({
            startTime: existingShift.startTime,
            endTime: existingShift.endTime,
            notes: existingShift.notes || '',
            tasks: existingShift.tasks || [],
            isDayOff: existingShift.isDayOff || false
        });
        setEditingShiftData(existingShift);
        setIsEditingShift(true);
        setIsAddingShift(true); // Reuse the same modal
    };

    // Add task to shift
    const handleAddTask = () => {
        if (!newTask.trim()) return;

        setShiftDetails({
            ...shiftDetails,
            tasks: [...shiftDetails.tasks, newTask.trim()]
        });
        setNewTask('');
    };

    // Remove task from shift
    const handleRemoveTask = (index) => {
        setShiftDetails({
            ...shiftDetails,
            tasks: shiftDetails.tasks.filter((_, i) => i !== index)
        });
    };

    // Handle saving a shift
    const handleSaveShift = async () => {
        try {
            setSaving(true);
            setError(null);

            const { personnelId, day } = selectedCell;

            // Create a new schedule data object
            const newScheduleData = { ...scheduleData };

            // Initialize the personnel entry if it doesn't exist
            if (!newScheduleData[personnelId]) {
                newScheduleData[personnelId] = {};
            }

            // Set the shift details for this day
            newScheduleData[personnelId][day] = shiftDetails;

            // Update state first
            setScheduleData(newScheduleData);

            // Save to backend immediately
            console.log('Saving schedule data:', newScheduleData);
            await saveGeneralSchedule(newScheduleData);

            setSuccess(isEditingShift ? 'Horaire modifié avec succès !' : 'Horaire sauvegardé avec succès !');
            setIsAddingShift(false);
            setIsEditingShift(false);
            setEditingShiftData(null);
        } catch (err) {
            console.error('Error saving schedule:', err);
            setError(err.message || 'Erreur lors de la sauvegarde de l\'horaire');
            // Don't close modal on error so user can retry
        } finally {
            setSaving(false);
        }
    };

    // Handle deleting a shift
    const handleDeleteShift = async (personnelId, day) => {
        try {
            setSaving(true);
            setError(null);

            const newScheduleData = { ...scheduleData };

            if (newScheduleData[personnelId] && newScheduleData[personnelId][day]) {
                delete newScheduleData[personnelId][day];

                // If this personnel has no more shifts, remove the entry
                if (Object.keys(newScheduleData[personnelId]).length === 0) {
                    delete newScheduleData[personnelId];
                }

                // Update state first
                setScheduleData(newScheduleData);

                // Save to backend immediately
                console.log('Saving updated schedule data:', newScheduleData);
                await saveGeneralSchedule(newScheduleData);

                setSuccess('Horaire supprimé avec succès !');
            }
        } catch (err) {
            console.error('Error deleting schedule:', err);
            setError(err.message || 'Erreur lors de la suppression de l\'horaire');
        } finally {
            setSaving(false);
        }
    };

    // Calculate shift duration
    const getShiftDuration = (shift) => {
        const startTime = shift.startTime;
        const endTime = shift.endTime;
        
        if (endTime > startTime) {
            // Same day shift
            const hours = endTime - startTime;
            return `${hours}h`;
        } else if (endTime === startTime) {
            // 24-hour shift
            return '24h';
        } else {
            // Overnight shift
            const hours = (24 - startTime) + endTime;
            return `${hours}h (nuit)`;
        }
    };

    // Format time for display (24-hour format) - UPDATED with overnight indicator
    const formatTime = (hour) => {
        return `${hour < 10 ? '0' + hour : hour}:00`;
    };

    // NEW: Add function to format time range with overnight indication
    const formatTimeRange = (startTime, endTime) => {
        const start = formatTime(startTime);
        const end = formatTime(endTime);
        
        if (endTime > startTime) {
            // Same day
            return `${start} → ${end}`;
        } else if (endTime === startTime) {
            // 24-hour shift
            return `${start} → ${end} (+1j)`;
        } else {
            // Overnight shift
            return `${start} → ${end} (+1j)`;
        }
    };

    // Get color scheme based on personnelId
    const getColorScheme = (personnelId) => {
        const colorIndex = parseInt(personnelId, 16) % COLORS.length;
        return COLORS[colorIndex] || COLORS[0];
    };

    // Export to PDF function - UPDATED with Director signature section
    const exportToPDF = () => {
        try {
            // Create new PDF document
            const doc = new jsPDF('l', 'mm', 'a4'); // landscape orientation
            
            // Get current date for filename
            const currentDate = new Date().toLocaleDateString('fr-FR');
            
            // PDF Title
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.text('Planning Général du Personnel', 20, 20);
            
            // Subtitle with filters info
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            let subtitle = `Généré le ${currentDate}`;
            if (filters.name || filters.poste !== 'all') {
                subtitle += ' - Filtres appliqués: ';
                const activeFilters = [];
                if (filters.name) activeFilters.push(`Nom: "${filters.name}"`);
                if (filters.poste !== 'all') activeFilters.push(`Poste: ${filters.poste}`);
                subtitle += activeFilters.join(', ');
            }
            doc.text(subtitle, 20, 30);
            
            // Employee count
            doc.text(`${filteredPersonnel.length} employé${filteredPersonnel.length > 1 ? 's' : ''} affiché${filteredPersonnel.length > 1 ? 's' : ''}`, 20, 38);

            // Prepare table data
            const tableColumns = ['Personnel', 'Poste', ...DAYS, 'Les remarques']; // Add Arabic Notes column
            const tableRows = [];

            filteredPersonnel.forEach(person => {
                const personId = person.id || person._id;
                const row = [
                    `${person.firstName} ${person.lastName}`,
                    person.poste || 'Non spécifié'
                ];

                // Add schedule data for each day
                DAYS.forEach(day => {
                    const shift = getShiftForCell(personId, day);
                    if (shift) {
                        if (shift.isDayOff) {
                            row.push('Congé');
                        } else {
                            let cellContent = formatTimeRange(shift.startTime, shift.endTime);
                            if (shift.notes) {
                                cellContent += `\n${shift.notes}`;
                            }
                            if (shift.tasks && shift.tasks.length > 0) {
                                cellContent += `\nTâches: ${shift.tasks.join(', ')}`;
                            }
                            row.push(cellContent);
                        }
                    } else {
                        row.push('-');
                    }
                });

                row.push(''); // Add empty cell for "الملاحظات"
                tableRows.push(row);
            });

            // Generate table using autoTable
            autoTable(doc, {
                head: [tableColumns],
                body: tableRows,
                startY: 45,
                styles: {
                    fontSize: 8,
                    cellPadding: 3,
                    overflow: 'linebreak',
                    halign: 'left',
                    valign: 'top'
                },
                headStyles: {
                    fillColor: [71, 85, 105], // slate-600
                    textColor: 255,
                    fontStyle: 'bold',
                    fontSize: 9,
                    halign: 'center'
                },
                columnStyles: {
                    0: { cellWidth: 35, halign: 'left' }, // Personnel name
                    1: { cellWidth: 25, halign: 'left' }, // Poste
                    2: { cellWidth: 25, halign: 'center' }, // Monday
                    3: { cellWidth: 25, halign: 'center' }, // Tuesday
                    4: { cellWidth: 25, halign: 'center' }, // Wednesday
                    5: { cellWidth: 25, halign: 'center' }, // Thursday
                    6: { cellWidth: 25, halign: 'center' }, // Friday
                    7: { cellWidth: 25, halign: 'center' }, // Saturday
                    8: { cellWidth: 25, halign: 'center' }, // Sunday
                    9: { cellWidth: 30, halign: 'center' }  // Les remarques
                },
                alternateRowStyles: {
                    fillColor: [248, 250, 252] // gray-50
                },
                tableLineColor: [203, 213, 225], // gray-300
                tableLineWidth: 0.1,
                margin: { left: 15, right: 15 },
                // NEW: Add didDrawPage callback to add signature section
                didDrawPage: function (data) {
                    // Get page dimensions
                    const pageWidth = doc.internal.pageSize.width;
                    const pageHeight = doc.internal.pageSize.height;
                    
                    // NEW: Add signature section at bottom right
                    const signatureX = pageWidth - 80; // 80mm from right edge
                    const signatureY = pageHeight - 40; // 40mm from bottom
                    
                    // Signature box
                    doc.setDrawColor(71, 85, 105); // slate-600 color
                    doc.setLineWidth(0.5);
                    doc.rect(signatureX, signatureY, 65, 25); // Rectangle for signature
                    
                    // Signature label
                    doc.setFontSize(10);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(71, 85, 105); // slate-600 color
                    doc.text('Directeur De Centre', signatureX + 32.5, signatureY - 3, { align: 'center' });
                    
                    // Date and signature lines
                    doc.setFontSize(8);
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(107, 114, 128); // gray-500 color
                    
                    // Date line
                    doc.text('Date: _______________', signatureX + 2, signatureY + 8);
                    
                    // Signature line
                    doc.text('Signature:', signatureX + 2, signatureY + 18);
                    doc.line(signatureX + 20, signatureY + 18, signatureX + 63, signatureY + 18); // Signature line
                    
                    // Optional: Add a small watermark/logo area
                    doc.setFontSize(6);
                    doc.setTextColor(156, 163, 175); // gray-400 color
                    doc.text('Approuvé par', signatureX + 32.5, signatureY + 4, { align: 'center' });
                }
            });

            // Add footer with page numbers (update to avoid overlap with signature)
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(107, 114, 128); // gray-500 color
                
                // Position page number at bottom left to avoid signature area
                doc.text(`Page ${i} sur ${pageCount}`, 20, doc.internal.pageSize.height - 10);
                
                // NEW: Add generation timestamp and centre name at bottom center
                doc.setFontSize(8);
                doc.setTextColor(156, 163, 175); // gray-400 color
                const timestamp = new Date().toLocaleString('fr-FR');
                doc.text(`Centre Sectoriel de Formation en Cuir et Chaussures de Sakiet Ezzit`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 18, { align: 'center' });
                doc.text(`Généré le ${timestamp}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
            }

            // Save the PDF
            const fileName = `planning_personnel_${currentDate.replace(/\//g, '-')}.pdf`;
            doc.save(fileName);
            
            setSuccess('Export PDF réalisé avec succès !');
        } catch (error) {
            console.error('Error exporting PDF:', error);
            setError('Erreur lors de l\'export PDF');
        }
    };

    if (loading && personnel.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
                <p className="text-blue-600 text-lg font-medium">Chargement du planning...</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-xl overflow-hidden w-full max-w-none">
            {/* NEW: Filters Section */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Planning Général du Personnel</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            {filteredPersonnel.length} employé{filteredPersonnel.length > 1 ? 's' : ''} affiché{filteredPersonnel.length > 1 ? 's' : ''}
                            {personnel.length !== filteredPersonnel.length && ` sur ${personnel.length} total`}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                        {/* Name Filter */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Rechercher par nom..."
                                value={filters.name}
                                onChange={(e) => handleFilterChange('name', e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm w-full sm:w-64"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>

                        {/* Poste Filter */}
                        <div className="relative">
                            <select
                                value={filters.poste}
                                onChange={(e) => handleFilterChange('poste', e.target.value)}
                                className="pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white appearance-none w-full sm:w-48"
                            >
                                <option value="all">Tous les postes</option>
                                {uniquePostes.map(poste => (
                                    <option key={poste} value={poste}>
                                        {poste}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                            </div>
                        </div>

                        {/* NEW: Export PDF Button */}
                        <button
                            onClick={exportToPDF}
                            disabled={filteredPersonnel.length === 0}
                            className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg shadow-sm hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center text-sm font-medium"
                        >
                            <DownloadIcon className="h-4 w-4 mr-2" />
                            Exporter PDF
                            {filteredPersonnel.length > 0 && (
                                <span className="ml-2 bg-white/20 text-xs px-2 py-0.5 rounded-full">
                                    {filteredPersonnel.length}
                                </span>
                            )}
                        </button>

                        {/* Clear Filters Button */}
                        {(filters.poste !== 'all' || filters.name !== '') && (
                            <button
                                onClick={clearFilters}
                                className="px-3 py-2 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors flex items-center"
                            >
                                <XIcon className="h-4 w-4 mr-1" />
                                Effacer
                            </button>
                        )}
                    </div>
                </div>

                {/* Active Filters Display - UPDATED */}
                {(filters.poste !== 'all' || filters.name !== '') && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {filters.name && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Nom: "{filters.name}"
                                <button
                                    onClick={() => handleFilterChange('name', '')}
                                    className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200"
                                >
                                    <XIcon className="h-3 w-3" />
                                </button>
                            </span>
                        )}
                        {filters.poste !== 'all' && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Poste: {filters.poste}
                                <button
                                    onClick={() => handleFilterChange('poste', 'all')}
                                    className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-green-200"
                                >
                                    <XIcon className="h-3 w-3" />
                                </button>
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Notification area - keep unchanged */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mx-6 my-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-md"
                    >
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <XIcon className="h-5 w-5 text-red-500" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-red-800">{error}</p>
                            </div>
                            <div className="ml-auto pl-3">
                                <button
                                    onClick={() => setError(null)}
                                    className="inline-flex text-red-500 hover:text-red-600"
                                >
                                    <XIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {success && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mx-6 my-4 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-md"
                    >
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <BadgeCheckIcon className="h-5 w-5 text-green-500" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-green-800">{success}</p>
                            </div>
                            <div className="ml-auto pl-3">
                                <button
                                    onClick={() => setSuccess(null)}
                                    className="inline-flex text-green-500 hover:text-green-600"
                                >
                                    <XIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Schedule table - UPDATED to use filteredPersonnel */}
            <div className="w-full px-1 py-1 rounded-xl">
                <table className="w-full table-fixed border-collapse">
                    <thead>
                        <tr>
                            <th className="py-3 px-3 bg-gradient-to-r from-gray-50 to-gray-100 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider sticky left-0 z-20 border-r border-gray-200 w-[180px]">
                                Personnel
                            </th>
                            {DAYS.map(day => (
                                <th key={day} className="py-3 px-2 bg-gradient-to-r from-gray-50 to-gray-100 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200 last:border-r-0">
                                    {day}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {/* UPDATED: Use filteredPersonnel instead of personnel */}
                        {Array.isArray(filteredPersonnel) && filteredPersonnel.length > 0 ? (
                            filteredPersonnel.map((person) => {
                                // Use person's ID to generate consistent colors
                                const personId = person.id || person._id;
                                return (
                                    <tr key={personId} className="hover:bg-gray-50/70 transition-colors">
                                        <td className="py-4 px-6 whitespace-nowrap bg-white sticky left-0 z-10 border-r border-gray-200">
                                            <div className="flex items-center">
                                                {person.profilePhoto ? (
                                                    <img
                                                        src={person.profilePhoto}
                                                        alt={person.firstName}
                                                        className="h-10 w-10 rounded-full mr-3 object-cover border-2 border-white shadow-sm"
                                                    />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full flex items-center justify-center text-white font-medium mr-3 bg-gradient-to-br from-slate-800 to-blue-800">
                                                        {person.firstName?.charAt(0)?.toUpperCase() || '?'}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium text-gray-900">{person.firstName} {person.lastName}</p>
                                                    <div className="flex items-center space-x-2">
                                                        <p className="text-xs text-gray-500">{person.poste || 'Non spécifié'}</p>
                                                        {/* REMOVED: role badge since we're filtering by poste now */}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        {DAYS.map(day => {
                                            const shift = getShiftForCell(personId, day);
                                            const colorScheme = getColorScheme(personId);

                                            return (
                                                <td
                                                    key={`${personId}-${day}`}
                                                    className="p-2 border-r border-gray-200 last:border-r-0 relative align-top h-28"
                                                    onClick={() => !shift && handleCellClick(personId, day, person)}
                                                >
                                                    {shift ? (
                                                        <div 
                                                            className={`h-full w-full flex flex-col relative group rounded-lg border overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${shift.isDayOff
                                                                ? 'border-red-200 bg-gradient-to-r from-red-50 to-pink-50'
                                                                : `${colorScheme.border}`
                                                            }`}
                                                            onClick={() => handleShiftClick(personId, day, person, shift)}
                                                        >
                                                            {shift.isDayOff ? (
                                                                // Day Off Display
                                                                <>
                                                                    <div className="absolute inset-0 bg-gradient-to-r from-red-50 to-pink-50 opacity-70"></div>
                                                                    <div className="relative z-10 p-3 flex flex-col items-center justify-center h-full text-center">
                                                                        <div className="text-2xl mb-2">🏖️</div>
                                                                        <div className="font-semibold text-red-800 text-sm">Jour de repos</div>
                                                                        {shift.notes && (
                                                                            <p className="text-xs text-red-600 mt-1 line-clamp-2">{shift.notes}</p>
                                                                        )}
                                                                        
                                                                        {/* Action buttons */}
                                                                        <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleShiftClick(personId, day, person, shift);
                                                                                }}
                                                                                className="p-1 text-gray-400 hover:text-blue-500 bg-white/80 rounded transition-colors"
                                                                                title="Modifier"
                                                                            >
                                                                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                                </svg>
                                                                            </button>
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleDeleteShift(personId, day);
                                                                                }}
                                                                                className="p-1 text-gray-400 hover:text-red-500 bg-white/80 rounded transition-colors"
                                                                                title="Supprimer"
                                                                            >
                                                                                <XIcon className="h-3 w-3" />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                // Regular Shift Display
                                                                <>
                                                                    <div className={`absolute inset-0 bg-gradient-to-r ${colorScheme.bg} opacity-70`}></div>

                                                                    {/* Header */}
                                                                    <div className="relative z-10 p-3 pb-2 border-b border-gray-200/30 flex justify-between items-center bg-white/20">
                                                                        <div className={`font-semibold ${colorScheme.text} flex items-center`}>
                                                                            <ClockIcon className="h-4 w-4 mr-1" />
                                                                            {/* UPDATED: Use new formatTimeRange function */}
                                                                            {formatTimeRange(shift.startTime, shift.endTime)}
                                                                            <span className="ml-2 bg-white/70 text-xs px-2 py-0.5 rounded-full">
                                                                                {getShiftDuration(shift)}
                                                                            </span>
                                                                        </div>
                                                                        
                                                                        {/* Action buttons */}
                                                                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleShiftClick(personId, day, person, shift);
                                                                                }}
                                                                                disabled={saving}
                                                                                className="p-1 text-gray-400 hover:text-blue-500 bg-white/80 rounded transition-colors disabled:opacity-50"
                                                                                title="Modifier"
                                                                            >
                                                                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                                </svg>
                                                                            </button>
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleDeleteShift(personId, day);
                                                                                }}
                                                                                disabled={saving}
                                                                                className="p-1 text-gray-400 hover:text-red-500 bg-white/80 rounded transition-colors disabled:opacity-50"
                                                                                title="Supprimer"
                                                                            >
                                                                                {saving ? (
                                                                                    <span className="inline-block w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
                                                                                ) : (
                                                                                    <XIcon className="h-3 w-3" />
                                                                                )}
                                                                            </button>
                                                                        </div>
                                                                    </div>

                                                                    {/* Content */}
                                                                    <div className="relative z-10 p-3 flex-grow overflow-auto">
                                                                        {shift.notes && (
                                                                            <p className="text-xs text-gray-600 line-clamp-2 mb-2">{shift.notes}</p>
                                                                        )}

                                                                        {shift.tasks && shift.tasks.length > 0 && (
                                                                            <ul className="space-y-1">
                                                                                {shift.tasks.map((task, index) => (
                                                                                    <li key={index} className="text-xs flex items-start">
                                                                                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 mt-1 mr-1.5 flex-shrink-0"></span>
                                                                                        <span className="text-gray-700">{task}</span>
                                                                                    </li>
                                                                                ))}
                                                                            </ul>
                                                                        )}
                                                                    </div>
                                                                    
                                                                    {/* Hover overlay with edit hint */}
                                                                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                        <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1 text-xs font-medium text-gray-700 shadow-lg">
                                                                            Cliquer pour modifier
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        // Empty cell
                                                        <div className="flex items-center justify-center h-full w-full cursor-pointer group rounded-lg border border-dashed border-gray-300 hover:border-blue-300 transition-colors">
                                                            <div className="rounded-full p-3 bg-gray-50 group-hover:bg-blue-50 transition-colors transform group-hover:scale-110 duration-200">
                                                                <PlusIcon className="h-5 w-5 text-gray-400 group-hover:text-blue-500" />
                                                            </div>
                                                        </div>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            }) // FIXED: Added missing closing parenthesis here
                        ) : (
                            <tr>
                                <td colSpan={8} className="py-8 text-center text-gray-500">
                                    {loading ? 'Chargement du personnel...' :
                                        filters.name || filters.poste !== 'all' ? 'Aucun employé ne correspond aux critères de recherche' :
                                            'Aucun membre du personnel trouvé'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Shift Modal - Updated with slate/blue colors */}
            <AnimatePresence>
                {isAddingShift && (
                    <div className="fixed inset-0 overflow-y-auto h-full w-full z-50 flex items-center justify-center bg-gray-900 bg-opacity-70 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden border border-gray-200"
                        >
                            {/* Modal Header - Updated with slate/blue gradient */}
                            <div className="p-6 border-b border-gray-200 bg-gradient-to-br from-slate-900 to-blue-900 text-white relative">
                                <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"></div>
                                <div className="flex justify-between items-center">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold">
                                            {isEditingShift 
                                                ? (shiftDetails.isDayOff ? 'Modifier le jour de congé' : 'Modifier l\'horaire de travail')
                                                : (shiftDetails.isDayOff ? 'Marquer comme jour de congé' : 'Ajouter un horaire de travail')
                                            }
                                        </h3>
                                        <div className="mt-1 flex items-center">
                                            <span className="text-blue-200 mr-3">
                                                {selectedCell.person?.firstName} {selectedCell.person?.lastName}
                                            </span>
                                            <span className="bg-white/20 text-white text-sm px-3 py-1 rounded-full">
                                                {selectedCell.day}
                                            </span>
                                            {isEditingShift && (
                                                <span className="bg-yellow-500/20 text-yellow-200 text-xs px-2 py-1 rounded-full ml-2">
                                                    Modification
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setIsAddingShift(false);
                                            setIsEditingShift(false);
                                            setEditingShiftData(null);
                                        }}
                                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                    >
                                        <XIcon className="h-6 w-6" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 max-h-[calc(90vh-12rem)] overflow-y-auto">
                                {/* Day Off Toggle */}
                                <div className="mb-6">
                                    <div className="flex items-center justify-between">
                                        <label className="block text-base font-semibold text-gray-800">
                                            Type de journée
                                        </label>
                                    </div>
                                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div
                                            onClick={() => setShiftDetails({ ...shiftDetails, isDayOff: false })}
                                            className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${!shiftDetails.isDayOff
                                                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                                    : 'border-gray-300 bg-white hover:border-gray-400'
                                                }`}
                                        >
                                            <div className="flex items-center">
                                                <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${!shiftDetails.isDayOff ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                                                    }`}>
                                                    {!shiftDetails.isDayOff && <div className="w-2 h-2 rounded-full bg-white"></div>}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">🕘 Journée de travail</div>
                                                    <div className="text-sm text-gray-500">Horaires et tâches normales</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div
                                            onClick={() => setShiftDetails({ ...shiftDetails, isDayOff: true })}
                                            className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${shiftDetails.isDayOff
                                                    ? 'border-red-500 bg-red-50 ring-2 ring-red-200'
                                                    : 'border-gray-300 bg-white hover:border-gray-400'
                                                }`}
                                        >
                                            <div className="flex items-center">
                                                <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${shiftDetails.isDayOff ? 'border-red-500 bg-red-500' : 'border-gray-300'
                                                    }`}>
                                                    {shiftDetails.isDayOff && <div className="w-2 h-2 rounded-full bg-white"></div>}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">🏖️ Jour de congé</div>
                                                    <div className="text-sm text-gray-500">Repos, congés, vacances</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Time Selection - only show if NOT day off */}
                                {!shiftDetails.isDayOff && (
                                    <div className="mb-6">
                                        <label className="block text-base font-semibold text-gray-800 mb-3">
                                            Plage horaire
                                        </label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm text-gray-600 mb-1.5">Heure de début</label>
                                                <div className="relative">
                                                    <select
                                                        value={shiftDetails.startTime}
                                                        onChange={(e) => setShiftDetails({
                                                            ...shiftDetails,
                                                            startTime: parseInt(e.target.value)
                                                            // REMOVED: automatic endTime adjustment
                                                        })}
                                                        className="block w-full pl-4 pr-10 py-3 text-base border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg shadow-sm appearance-none bg-white"
                                                    >
                                                        {HOURS.map(hour => (
                                                            <option key={`start-${hour}`} value={hour}>{formatTime(hour)}</option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                        <ClockIcon className="h-5 w-5 text-gray-400" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-600 mb-1.5">Heure de fin</label>
                                                <div className="relative">
                                                    <select
                                                        value={shiftDetails.endTime}
                                                        onChange={(e) => setShiftDetails({
                                                            ...shiftDetails,
                                                            endTime: parseInt(e.target.value)
                                                        })}
                                                        className="block w-full pl-4 pr-10 py-3 text-base border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg shadow-sm appearance-none bg-white"
                                                    >
                                                        {/* UPDATED: Show all hours, not just those after start time */}
                                                        {HOURS.map(hour => (
                                                            <option key={`end-${hour}`} value={hour}>{formatTime(hour)}</option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                        <ClockIcon className="h-5 w-5 text-gray-400" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* UPDATED: Enhanced duration calculation with overnight shift detection */}
                                        <div className="mt-2 flex items-center justify-between">
                                            <div className="text-sm text-gray-500">
                                                {(() => {
                                                    const startTime = shiftDetails.startTime;
                                                    const endTime = shiftDetails.endTime;
                                                    let duration, displayText, warningText = '';

                                                    if (endTime > startTime) {
                                                        // Same day shift
                                                        duration = endTime - startTime;
                                                        displayText = `${duration} heure${duration > 1 ? 's' : ''}`;
                                                    } else if (endTime === startTime) {
                                                        // 24-hour shift
                                                        duration = 24;
                                                        displayText = '24 heures';
                                                        warningText = '(Service continu)';
                                                    } else {
                                                        // Overnight shift
                                                        duration = (24 - startTime) + endTime;
                                                        displayText = `${duration} heure${duration > 1 ? 's' : ''}`;
                                                        warningText = '(Nuit - jour suivant)';
                                                    }

                                                    return (
                                                        <div className="flex items-center space-x-2">
                                                            <span>
                                                                Durée totale: <span className="font-medium text-blue-700">{displayText}</span>
                                                            </span>
                                                            {warningText && (
                                                                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                                                                    {warningText}
                                                                </span>
                                                            )}
                                                        </div>
                                                    );
                                                })()}
                                            </div>

                                            <div className="flex space-x-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setShiftDetails({ ...shiftDetails, startTime: 8, endTime: 17 })}
                                                    className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                                                >
                                                    Journée
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setShiftDetails({ ...shiftDetails, startTime: 6, endTime: 14 })}
                                                    className="text-xs px-2.5 py-1 bg-amber-50 text-amber-700 rounded hover:bg-amber-100"
                                                >
                                                    Matin
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setShiftDetails({ ...shiftDetails, startTime: 14, endTime: 22 })}
                                                    className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                                                >
                                                    Après-midi
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setShiftDetails({ ...shiftDetails, startTime: 22, endTime: 6 })}
                                                    className="text-xs px-2.5 py-1 bg-purple-50 text-purple-700 rounded hover:bg-purple-100"
                                                >
                                                    Nuit
                                                </button>
                                                {/* NEW: Add 24-hour shift option */}
                                                <button
                                                    type="button"
                                                    onClick={() => setShiftDetails({ ...shiftDetails, startTime: 0, endTime: 0 })}
                                                    className="text-xs px-2.5 py-1 bg-red-50 text-red-700 rounded hover:bg-red-100"
                                                >
                                                    24h
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Description - always show but change placeholder */}
                                <div className="mb-6">
                                    <label htmlFor="notes" className="block text-base font-semibold text-gray-800 mb-3">
                                        {shiftDetails.isDayOff ? 'Motif du congé (optionnel)' : 'Description générale'}
                                    </label>
                                    <div className="relative">
                                        <DocumentTextIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                        <textarea
                                            id="notes"
                                            rows="3"
                                            value={shiftDetails.notes}
                                            onChange={(e) => setShiftDetails({ ...shiftDetails, notes: e.target.value })}
                                            className="block w-full pl-10 pr-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg shadow-sm resize-none"
                                            placeholder={shiftDetails.isDayOff ? "Congés annuels, congé maladie, formation..." : "Description générale de ce créneau horaire..."}
                                        ></textarea>
                                    </div>
                                </div>

                                {/* Tasks - only show if NOT day off */}
                                {!shiftDetails.isDayOff && (
                                    <div>
                                        <label className="block text-base font-semibold text-gray-800 mb-3">
                                            Tâches à effectuer
                                        </label>

                                        <div className="space-y-3">
                                            {/* Task input */}
                                            <div className="flex space-x-2">
                                                <input
                                                    type="text"
                                                    value={newTask}
                                                    onChange={(e) => setNewTask(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                                                    placeholder="Ajouter une tâche..."
                                                    className="block flex-1 pl-4 pr-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg shadow-sm"
                                                />
                                                <button
                                                    onClick={handleAddTask}
                                                    disabled={!newTask.trim()}
                                                    className="px-4 py-3 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
                                                >
                                                    Ajouter
                                                </button>
                                            </div>

                                            {/* Tasks list */}
                                            {shiftDetails.tasks.length > 0 ? (
                                                <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 max-h-48 overflow-y-auto">
                                                    <ul className="divide-y divide-gray-200">
                                                        {shiftDetails.tasks.map((task, index) => (
                                                            <li key={index} className="py-2 first:pt-0 last:pb-0 flex justify-between items-center">
                                                                <div className="flex items-start pr-2">
                                                                    <div className="h-5 w-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                                                                        <span className="text-xs font-bold">{index + 1}</span>
                                                                    </div>
                                                                    <p className="text-sm text-gray-700">{task}</p>
                                                                </div>
                                                                <button
                                                                    onClick={() => handleRemoveTask(index)}
                                                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                                                >
                                                                    <XIcon className="h-4 w-4" />
                                                                </button>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ) : (
                                                <div className="bg-gray-50 rounded-lg border border-dashed border-gray-300 p-6 text-center">
                                                    <p className="text-gray-500 text-sm">Aucune tâche ajoutée</p>
                                                    <p className="text-gray-400 text-xs mt-1">Ajoutez des tâches pour ce créneau horaire</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3 items-center">
                                <button
                                    onClick={() => setIsAddingShift(false)}
                                    disabled={saving}
                                    className="px-5 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 disabled:opacity-50 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleSaveShift}
                                    disabled={saving}
                                    className="px-5 py-2.5 bg-gradient-to-br from-slate-800 to-blue-800 text-white rounded-lg shadow-md hover:from-slate-900 hover:to-blue-900 disabled:opacity-50 transition-colors flex items-center"
                                >
                                    {saving ? (
                                        <>
                                            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                            {isEditingShift ? 'Modification...' : 'Enregistrement...'}
                                        </>
                                    ) : (
                                        isEditingShift ? 'Sauvegarder les modifications' : 'Confirmer'
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GeneralSchedule;