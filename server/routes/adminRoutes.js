const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('admin'));

// Overview
router.get('/stats', adminController.getStats);

// Faculty CRUD
router.get('/faculty', adminController.getFaculty);
router.post('/faculty', adminController.createFaculty);
router.put('/faculty/:id', adminController.updateFaculty);
router.delete('/faculty/:id', adminController.deleteFaculty);
router.post('/faculty/:id/reset-password', adminController.resetPassword);

// Student CRUD & Bulk import
router.get('/students', adminController.getStudents);
router.post('/students', adminController.createStudent);
router.post('/students/bulk', adminController.bulkImportStudents);
router.put('/students/:id', adminController.updateStudent);
router.delete('/students/:id', adminController.deleteStudent);
router.post('/students/:id/reset-password', adminController.resetPassword);

// Academic Structure
router.get('/academic-structure', adminController.getAcademicStructure);
router.post('/departments', adminController.createDepartment);
router.post('/courses', adminController.createCourse);
router.post('/sections', adminController.createSection);
router.post('/subjects', adminController.createSubject);
router.delete('/academic/:type/:id', adminController.deleteAcademicItem);

// Settings
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

// Results & Analytics
router.get('/results', adminController.getAllResults);

module.exports = router;
