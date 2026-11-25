const db = require('../config/db');

// Student Dashboard Overview
exports.getDashboard = async (req, res) => {
  try {
    const student = req.user;
    const allExams = db.find('exams');

    // Section-wise strict filter:
    // Only exams matching student's section AND department AND course
    const myEligibleExams = allExams.filter(exam => {
      const sectionMatch = Array.isArray(exam.sections) && exam.sections.includes(student.section);
      const deptMatch = !exam.department || exam.department === student.department;
      return sectionMatch && deptMatch;
    });

    const activeExams = myEligibleExams.filter(e => e.status === 'Active');
    const upcomingExams = myEligibleExams.filter(e => e.status === 'Scheduled');
    const completedExams = myEligibleExams.filter(e => e.status === 'Completed');

    // Student's own submissions
    const myAttempts = db.find('attempts', { studentId: student._id });

    // Calculate overall stats
    const totalTaken = myAttempts.length;
    const passedCount = myAttempts.filter(a => a.passed).length;
    const avgScore = totalTaken > 0
      ? Math.round(myAttempts.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / totalTaken)
      : 0;

    res.json({
      success: true,
      student: {
        id: student._id,
        fullName: student.fullName,
        studentId: student.studentId,
        rollNumber: student.rollNumber,
        department: student.department,
        course: student.course,
        year: student.year,
        semester: student.semester,
        section: student.section,
        email: student.email
      },
      stats: {
        availableExamsCount: activeExams.length,
        upcomingExamsCount: upcomingExams.length,
        completedExamsCount: completedExams.length,
        totalExamsTaken: totalTaken,
        passedCount,
        avgScore
      },
      activeExams,
      upcomingExams,
      completedExams,
      myAttempts: myAttempts.slice(-5).reverse()
    });
  } catch (err) {
    console.error('Student dashboard error:', err);
    res.status(500).json({ success: false, message: 'Failed to load student dashboard.' });
  }
};

// Available Exams with Strict Section & Window Validation
exports.getAvailableExams = async (req, res) => {
  try {
    const student = req.user;
    const allExams = db.find('exams');

    // Filter strictly by student's section
    const assignedExams = allExams.filter(e => {
      const secMatch = Array.isArray(e.sections) && e.sections.includes(student.section);
      const deptMatch = !e.department || e.department === student.department;
      return secMatch && deptMatch && e.status !== 'Draft' && e.status !== 'Cancelled';
    });

    const myAttempts = db.find('attempts', { studentId: student._id });

    // Augment with attempt status
    const result = assignedExams.map(exam => {
      const existingAttempt = myAttempts.find(a => a.examId === exam._id);
      return {
        ...exam,
        hasAttempted: Boolean(existingAttempt && existingAttempt.status === 'submitted'),
        ongoingAttempt: existingAttempt && existingAttempt.status === 'in_progress' ? existingAttempt._id : null,
        attemptResult: existingAttempt || null
      };
    });

    res.json({ success: true, exams: result });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch available exams.' });
  }
};

// Start or Resume Exam
exports.startExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const student = req.user;

    const exam = db.findById('exams', examId);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found.' });

    // 1. Strict Section-wise validation
    if (!exam.sections.includes(student.section)) {
      return res.status(403).json({ 
        success: false, 
        message: `Forbidden: This exam is assigned only to sections [${exam.sections.join(', ')}]. You belong to section '${student.section}'.` 
      });
    }

    // 2. Exam status validation
    if (exam.status !== 'Active' && exam.status !== 'Scheduled') {
      return res.status(403).json({ success: false, message: `Exam is not active (Current status: ${exam.status}).` });
    }

    // 3. Prevent duplicate submissions
    const existing = db.findOne('attempts', { examId, studentId: student._id });
    if (existing && existing.status === 'submitted') {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already submitted this exam. Duplicate attempts are not permitted.',
        attempt: existing
      });
    }

    let attempt = existing;
    if (!attempt) {
      attempt = db.create('attempts', {
        examId,
        examTitle: exam.title,
        subject: exam.subject,
        studentId: student._id,
        studentName: student.fullName,
        studentEmail: student.email,
        studentRoll: student.studentId,
        department: student.department,
        section: student.section,
        totalMarks: exam.totalMarks,
        startedAt: new Date().toISOString(),
        status: 'in_progress',
        answers: {},
        timeRemainingSeconds: exam.duration * 60
      });
    }

    // Fetch question details, SANITIZING correct answers & explanations to prevent cheating!
    const allQuestions = db.find('questions');
    let questions = [];

    if (Array.isArray(exam.questions)) {
      questions = exam.questions.map(qId => {
        const fullQ = typeof qId === 'string' ? allQuestions.find(q => q._id === qId) : qId;
        if (!fullQ) return null;
        // Strip sensitive fields
        const safeQ = { ...fullQ };
        delete safeQ.correctAnswer;
        delete safeQ.explanation;
        return safeQ;
      }).filter(Boolean);
    }

    // Shuffle questions if enabled
    if (exam.shuffleQuestions) {
      questions.sort(() => Math.random() - 0.5);
    }

    res.json({
      success: true,
      exam: {
        _id: exam._id,
        title: exam.title,
        subject: exam.subject,
        duration: exam.duration,
        totalMarks: exam.totalMarks,
        passingMarks: exam.passingMarks,
        instructions: exam.instructions,
        negativeMarking: exam.negativeMarking,
        negativeMarksPerWrongAnswer: exam.negativeMarksPerWrongAnswer,
        allowReview: exam.allowReview,
        allowBackNavigation: exam.allowBackNavigation
      },
      attemptId: attempt._id,
      startedAt: attempt.startedAt,
      savedAnswers: attempt.answers || {},
      questions
    });
  } catch (err) {
    console.error('Start exam error:', err);
    res.status(500).json({ success: false, message: 'Failed to start exam session.' });
  }
};

// Save Ongoing Answer
exports.saveAnswer = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { questionId, answer, markedForReview } = req.body;

    const attempt = db.findById('attempts', attemptId);
    if (!attempt) return res.status(404).json({ success: false, message: 'Attempt not found.' });
    if (attempt.studentId !== req.user._id) return res.status(403).json({ success: false, message: 'Forbidden' });
    if (attempt.status === 'submitted') return res.status(400).json({ success: false, message: 'Exam is already submitted.' });

    const answers = attempt.answers || {};
    answers[questionId] = {
      value: answer,
      markedForReview: Boolean(markedForReview),
      savedAt: new Date().toISOString()
    };

    db.findByIdAndUpdate('attempts', attemptId, { answers });

    res.json({ success: true, message: 'Answer saved.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to save answer.' });
  }
};

// Submit Exam & Automatic Evaluation
exports.submitExam = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { answers, timeTakenMinutes } = req.body;

    const attempt = db.findById('attempts', attemptId);
    if (!attempt) return res.status(404).json({ success: false, message: 'Attempt not found.' });
    if (attempt.studentId !== req.user._id) return res.status(403).json({ success: false, message: 'Forbidden' });
    if (attempt.status === 'submitted') {
      return res.status(400).json({ success: false, message: 'Exam has already been submitted.' });
    }

    const exam = db.findById('exams', attempt.examId);
    if (!exam) return res.status(404).json({ success: false, message: 'Associated exam not found.' });

    const allQuestions = db.find('questions');
    const examQuestions = (exam.questions || []).map(qId => 
      typeof qId === 'string' ? allQuestions.find(q => q._id === qId) : qId
    ).filter(Boolean);

    const finalAnswers = answers || attempt.answers || {};

    // Automatic Evaluation Algorithm
    let totalMarksObtained = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;
    const detailedAnswers = {};

    for (const q of examQuestions) {
      const studentResponse = finalAnswers[q._id];
      const answerVal = studentResponse ? (studentResponse.value !== undefined ? studentResponse.value : studentResponse) : null;

      const qMarks = Number(q.marks) || 1;
      const negMarks = exam.negativeMarking ? (Number(q.negativeMarks) || Number(exam.negativeMarksPerWrongAnswer) || 0) : 0;

      if (answerVal === null || answerVal === undefined || answerVal === '') {
        unansweredCount++;
        detailedAnswers[q._id] = {
          givenAnswer: null,
          isCorrect: false,
          marksAwarded: 0,
          status: 'unanswered'
        };
        continue;
      }

      // Evaluation by question type
      let isCorrect = false;

      if (q.type === 'mcq' || q.type === 'true_false') {
        isCorrect = String(answerVal).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
      } else if (q.type === 'multiple_select') {
        // Must match array of IDs exactly
        if (Array.isArray(answerVal) && Array.isArray(q.correctAnswer)) {
          const sortedGiven = [...answerVal].sort();
          const sortedCorrect = [...q.correctAnswer].sort();
          isCorrect = JSON.stringify(sortedGiven) === JSON.stringify(sortedCorrect);
        }
      } else if (q.type === 'short_answer') {
        isCorrect = String(answerVal).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
      } else if (q.type === 'descriptive') {
        // Descriptive questions are marked pending faculty review
        detailedAnswers[q._id] = {
          givenAnswer: answerVal,
          isCorrect: null,
          marksAwarded: 0,
          status: 'pending_evaluation'
        };
        continue;
      }

      if (isCorrect) {
        correctCount++;
        totalMarksObtained += qMarks;
        detailedAnswers[q._id] = {
          givenAnswer: answerVal,
          isCorrect: true,
          marksAwarded: qMarks,
          status: 'correct'
        };
      } else {
        wrongCount++;
        totalMarksObtained = Math.max(0, totalMarksObtained - negMarks);
        detailedAnswers[q._id] = {
          givenAnswer: answerVal,
          isCorrect: false,
          marksAwarded: -negMarks,
          status: 'wrong'
        };
      }
    }

    const totalExamMarks = Number(exam.totalMarks) || 100;
    const percentage = Math.round((totalMarksObtained / totalExamMarks) * 100);
    const passingMarks = Number(exam.passingMarks) || (totalExamMarks * 0.4);
    const passed = totalMarksObtained >= passingMarks;

    const submittedRecord = db.findByIdAndUpdate('attempts', attemptId, {
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      timeTakenMinutes: timeTakenMinutes || Math.round((new Date() - new Date(attempt.startedAt)) / 60000),
      totalMarks: totalExamMarks,
      marksObtained: Math.round(totalMarksObtained * 10) / 10,
      percentage,
      passed,
      answers: finalAnswers,
      detailedAnswers,
      evaluationBreakdown: {
        correctCount,
        wrongCount,
        unansweredCount,
        totalQuestions: examQuestions.length
      }
    });

    db.logActivity('EXAM_SUBMITTED', req.user, {
      examTitle: exam.title,
      score: submittedRecord.marksObtained,
      passed
    });

    res.json({
      success: true,
      message: 'Exam submitted and evaluated successfully!',
      result: {
        attemptId,
        examTitle: exam.title,
        totalMarks: totalExamMarks,
        marksObtained: submittedRecord.marksObtained,
        percentage,
        passed,
        correctCount,
        wrongCount,
        unansweredCount
      }
    });
  } catch (err) {
    console.error('Submit exam error:', err);
    res.status(500).json({ success: false, message: 'Failed to submit exam.' });
  }
};

// Student Results & Performance
exports.getMyResults = async (req, res) => {
  try {
    const student = req.user;
    const attempts = db.find('attempts', { studentId: student._id, status: 'submitted' });
    const allExams = db.find('exams');
    const allQuestions = db.find('questions');

    const enrichedResults = attempts.map(attempt => {
      const exam = allExams.find(e => e._id === attempt.examId) || {};
      const canViewDetails = exam.resultVisibility !== false;

      let questionDetails = null;
      if (canViewDetails && Array.isArray(exam.questions)) {
        questionDetails = exam.questions.map(qId => {
          const q = allQuestions.find(item => item._id === qId);
          if (!q) return null;
          return {
            _id: q._id,
            questionText: q.questionText,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            marks: q.marks,
            studentResponse: attempt.answers ? attempt.answers[q._id] : null
          };
        }).filter(Boolean);
      }

      return {
        ...attempt,
        resultVisibility: exam.resultVisibility,
        passingMarks: exam.passingMarks,
        questionDetails: canViewDetails ? questionDetails : null
      };
    });

    res.json({ success: true, results: enrichedResults });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch results.' });
  }
};
