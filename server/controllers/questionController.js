const db = require('../config/db');

exports.getQuestions = async (req, res) => {
  try {
    const { subject, topic, difficulty, type, search } = req.query;
    let list = db.find('questions');

    if (subject) list = list.filter(q => q.subject === subject);
    if (topic) list = list.filter(q => q.topic === topic);
    if (difficulty) list = list.filter(q => q.difficulty === difficulty);
    if (type) list = list.filter(q => q.type === type);
    if (search) {
      const query = search.toLowerCase();
      list = list.filter(q => q.questionText && q.questionText.toLowerCase().includes(query));
    }

    res.json({ success: true, total: list.length, questions: list });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch questions.' });
  }
};

exports.createQuestion = async (req, res) => {
  try {
    const {
      questionText,
      questionImage,
      subject,
      topic,
      difficulty,
      type,
      marks,
      explanation,
      options,
      correctAnswer,
      negativeMarks
    } = req.body;

    if (!questionText || !subject) {
      return res.status(400).json({ success: false, message: 'Question text and subject are required.' });
    }

    const question = db.create('questions', {
      questionText,
      questionImage: questionImage || null,
      subject,
      topic: topic || 'General',
      difficulty: difficulty || 'Medium',
      type: type || 'mcq',
      marks: Number(marks) || 1,
      explanation: explanation || '',
      options: options || [],
      correctAnswer: correctAnswer !== undefined ? correctAnswer : null,
      negativeMarks: Number(negativeMarks) || 0,
      createdBy: req.user._id,
      createdByName: req.user.fullName
    });

    db.logActivity('QUESTION_CREATED', req.user, { questionId: question._id, subject });

    res.status(201).json({ success: true, message: 'Question created successfully', question });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create question.' });
  }
};

exports.updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = db.findByIdAndUpdate('questions', id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: 'Question not found.' });

    res.json({ success: true, message: 'Question updated successfully', question: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update question.' });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    db.findByIdAndDelete('questions', id);
    res.json({ success: true, message: 'Question deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete question.' });
  }
};
