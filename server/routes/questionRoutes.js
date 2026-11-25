const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// Faculty and Admin can manage questions
router.get('/', questionController.getQuestions);
router.post('/', authorize('faculty', 'admin'), questionController.createQuestion);
router.put('/:id', authorize('faculty', 'admin'), questionController.updateQuestion);
router.delete('/:id', authorize('faculty', 'admin'), questionController.deleteQuestion);

module.exports = router;
