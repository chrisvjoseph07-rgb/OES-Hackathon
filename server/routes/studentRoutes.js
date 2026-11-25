const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('student'));

router.get('/dashboard', studentController.getDashboard);
router.get('/exams', studentController.getAvailableExams);
router.post('/exams/:examId/start', studentController.startExam);
router.post('/attempts/:attemptId/save-answer', studentController.saveAnswer);
router.post('/attempts/:attemptId/submit', studentController.submitExam);
router.get('/results', studentController.getMyResults);

module.exports = router;
