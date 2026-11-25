const db = require('../config/db');

// Faculty Dashboard Overview
exports.getDashboard = async (req, res) => {
  try {
    const user = req.user;
    const assignedSubjects = user.assignedSubjects || [];
    const assignedSections = user.assignedSections || [];

    // Students enrolled in assigned sections
    const students = db.find('users', { role: 'student' }).filter(s => 
      assignedSections.includes(s.section)
    );

    // Exams created by this faculty
    const exams = db.find('exams').filter(e => e.createdBy === user._id || e.createdByName === user.fullName);
    const activeExams = exams.filter(e => e.status === 'Active');
    const upcomingExams = exams.filter(e => e.status === 'Scheduled');
    const completedExams = exams.filter(e => e.status === 'Completed');

    // Recent results submitted for this faculty's exams
    const examIds = exams.map(e => e._id);
    const recentSubmissions = db.find('attempts').filter(a => examIds.includes(a.examId)).slice(-10).reverse();

    res.json({
      success: true,
      stats: {
        assignedSubjectsCount: assignedSubjects.length,
        assignedSectionsCount: assignedSections.length,
        totalStudentsCount: students.length,
        activeExamsCount: activeExams.length,
        upcomingExamsCount: upcomingExams.length,
        completedExamsCount: completedExams.length
      },
      assignedSubjects,
      assignedSections,
      upcomingExams: upcomingExams.slice(0, 5),
      activeExams: activeExams.slice(0, 5),
      recentSubmissions
    });
  } catch (err) {
    console.error('Faculty dashboard error:', err);
    res.status(500).json({ success: false, message: 'Failed to load faculty dashboard.' });
  }
};

// My Students (restricted to assigned sections)
exports.getMyStudents = async (req, res) => {
  try {
    const assignedSections = req.user.assignedSections || [];
    const { section } = req.query;

    let students = db.find('users', { role: 'student' }).filter(s => 
      assignedSections.includes(s.section)
    );

    if (section && assignedSections.includes(section)) {
      students = students.filter(s => s.section === section);
    }

    const safeList = students.map(s => {
      const copy = { ...s };
      delete copy.password;
      return copy;
    });

    res.json({ success: true, students: safeList, assignedSections });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch assigned students.' });
  }
};

// Exam Management for Faculty
exports.getMyExams = async (req, res) => {
  try {
    const exams = db.find('exams').filter(e => e.createdBy === req.user._id || e.createdByName === req.user.fullName);
    res.json({ success: true, exams });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch exams.' });
  }
};

exports.createExam = async (req, res) => {
  try {
    const {
      title,
      description,
      department,
      course,
      year,
      semester,
      subject,
      sections, // Array of section strings e.g. ['CSE-A']
      examType,
      examDate,
      startTime,
      endTime,
      duration,
      totalMarks,
      passingMarks,
      questions, // Array of question IDs or question objects
      instructions,
      negativeMarking,
      negativeMarksPerWrongAnswer,
      shuffleQuestions,
      shuffleOptions,
      allowReview,
      allowBackNavigation,
      resultVisibility,
      status
    } = req.body;

    // Permissions check: faculty can only assign to their assigned subjects and sections
    const user = req.user;
    if (user.role === 'faculty') {
      const allowedSubjects = user.assignedSubjects || [];
      const allowedSections = user.assignedSections || [];

      if (!allowedSubjects.includes(subject)) {
        return res.status(403).json({ 
          success: false, 
          message: `Forbidden: Subject '${subject}' is not assigned to you. Your assigned subjects: ${allowedSubjects.join(', ')}` 
        });
      }

      const invalidSections = (sections || []).filter(sec => !allowedSections.includes(sec));
      if (invalidSections.length > 0) {
        return res.status(403).json({ 
          success: false, 
          message: `Forbidden: Section(s) [${invalidSections.join(', ')}] are not assigned to you. Your assigned sections: ${allowedSections.join(', ')}` 
        });
      }
    }

    if (!title || !subject || !sections || sections.length === 0 || !examDate) {
      return res.status(400).json({ success: false, message: 'Please provide title, subject, target section(s), and exam date.' });
    }

    // Calculate enrolled students in target sections
    const enrolledStudents = db.find('users', { role: 'student' }).filter(s => 
      sections.includes(s.section)
    );

    const newExam = db.create('exams', {
      title,
      description: description || '',
      department: department || user.department,
      course: course || (user.assignedCourses && user.assignedCourses[0]) || 'B.Tech',
      year: year || '2nd Year',
      semester: semester || '4th Semester',
      subject,
      sections: Array.isArray(sections) ? sections : [sections],
      examType: examType || 'Internal Examination',
      examDate,
      startTime: startTime || '10:00',
      endTime: endTime || '12:00',
      duration: Number(duration) || 60,
      totalMarks: Number(totalMarks) || 50,
      passingMarks: Number(passingMarks) || 20,
      numberOfQuestions: (questions || []).length,
      questions: questions || [],
      instructions: instructions || 'Read all instructions carefully before starting.',
      negativeMarking: Boolean(negativeMarking),
      negativeMarksPerWrongAnswer: Number(negativeMarksPerWrongAnswer) || 0,
      shuffleQuestions: Boolean(shuffleQuestions),
      shuffleOptions: Boolean(shuffleOptions),
      allowReview: allowReview !== undefined ? Boolean(allowReview) : true,
      allowBackNavigation: allowBackNavigation !== undefined ? Boolean(allowBackNavigation) : true,
      resultVisibility: Boolean(resultVisibility),
      status: status || 'Scheduled',
      createdBy: user._id,
      createdByName: user.fullName,
      enrolledStudentsCount: enrolledStudents.length
    });

    // Notify students of the assigned sections
    for (const sec of newExam.sections) {
      db.create('notifications', {
        title: `New Exam Assigned: ${title}`,
        message: `${subject} exam has been scheduled for ${examDate} (${newExam.startTime} - ${newExam.endTime}).`,
        type: 'exam_assigned',
        targetRole: 'student',
        targetSection: sec,
        examId: newExam._id
      });
    }

    db.logActivity('EXAM_CREATED', user, { examTitle: title, examId: newExam._id, sections });

    res.status(201).json({ success: true, message: 'Exam created successfully', exam: newExam });
  } catch (err) {
    console.error('Create exam error:', err);
    res.status(500).json({ success: false, message: 'Failed to create exam.' });
  }
};

exports.updateExam = async (req, res) => {
  try {
    const { id } = req.params;
    const exam = db.findById('exams', id);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found.' });

    // Faculty can only update their own exams
    if (req.user.role === 'faculty' && exam.createdBy !== req.user._id) {
      return res.status(403).json({ success: false, message: 'Forbidden: You can only edit your own exams.' });
    }

    const updated = db.findByIdAndUpdate('exams', id, req.body);
    db.logActivity('EXAM_UPDATED', req.user, { examId: id });
    res.json({ success: true, message: 'Exam updated successfully', exam: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update exam.' });
  }
};

exports.deleteExam = async (req, res) => {
  try {
    const { id } = req.params;
    const exam = db.findById('exams', id);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found.' });

    if (req.user.role === 'faculty' && exam.createdBy !== req.user._id) {
      return res.status(403).json({ success: false, message: 'Forbidden: You can only delete your own exams.' });
    }

    db.findByIdAndDelete('exams', id);
    db.logActivity('EXAM_DELETED', req.user, { examId: id });
    res.json({ success: true, message: 'Exam deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete exam.' });
  }
};

exports.updateExamStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ['Draft', 'Scheduled', 'Active', 'Completed', 'Cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Allowed: ${allowed.join(', ')}` });
    }

    const updated = db.findByIdAndUpdate('exams', id, { status });
    db.logActivity('EXAM_STATUS_CHANGED', req.user, { examId: id, newStatus: status });

    res.json({ success: true, message: `Exam status changed to ${status}`, exam: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update exam status.' });
  }
};

// Exam Submissions & Results Evaluation
exports.getExamSubmissions = async (req, res) => {
  try {
    const { examId } = req.params;
    const exam = db.findById('exams', examId);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found.' });

    const submissions = db.find('attempts', { examId });
    res.json({ success: true, exam, submissions });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch exam submissions.' });
  }
};

exports.evaluateSubmission = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { awardedMarks, facultyFeedback, evaluationBreakdown } = req.body;

    const attempt = db.findById('attempts', attemptId);
    if (!attempt) return res.status(404).json({ success: false, message: 'Attempt not found.' });

    const totalMarks = attempt.totalMarks || 100;
    const marksObtained = Number(awardedMarks) !== undefined ? Number(awardedMarks) : attempt.marksObtained;
    const percentage = Math.round((marksObtained / totalMarks) * 100);
    const passed = percentage >= 40;

    const updated = db.findByIdAndUpdate('attempts', attemptId, {
      marksObtained,
      percentage,
      passed,
      facultyFeedback,
      evaluationBreakdown: evaluationBreakdown || attempt.evaluationBreakdown,
      evaluatedBy: req.user.fullName,
      evaluatedAt: new Date().toISOString()
    });

    res.json({ success: true, message: 'Evaluation saved successfully', attempt: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to evaluate submission.' });
  }
};

exports.publishResults = async (req, res) => {
  try {
    const { examId } = req.params;
    const { resultVisibility } = req.body;

    const exam = db.findByIdAndUpdate('exams', examId, { 
      resultVisibility: Boolean(resultVisibility) 
    });

    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found.' });

    // Notify students
    for (const sec of exam.sections) {
      db.create('notifications', {
        title: `Results Published: ${exam.title}`,
        message: `Results and performance analysis are now available for ${exam.title}.`,
        type: 'result_published',
        targetRole: 'student',
        targetSection: sec,
        examId
      });
    }

    res.json({ success: true, message: 'Exam results visibility updated successfully', exam });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to publish results.' });
  }
};
