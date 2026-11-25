const express = require('express');
const router = express.Router();
const facultyController = require('../controllers/facultyController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('faculty', 'admin'));

router.get('/dashboard', facultyController.getDashboard);
router.get('/students', facultyController.getMyStudents);

// Exams
router.get('/exams', facultyController.getMyExams);
router.post('/exams', facultyController.createExam);
router.put('/exams/:id', facultyController.updateExam);
router.delete('/exams/:id', facultyController.deleteExam);
router.patch('/exams/:id/status', facultyController.updateExamStatus);

// Submissions & Evaluation
router.get('/exams/:examId/submissions', facultyController.getExamSubmissions);
router.post('/submissions/:attemptId/evaluate', facultyController.evaluateSubmission);
router.post('/exams/:examId/publish-results', facultyController.publishResults);

module.exports = router;
