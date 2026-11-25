const bcrypt = require('bcryptjs');
const db = require('../config/db');

// Dashboard Overview & Statistics
exports.getStats = async (req, res) => {
  try {
    const totalStudents = db.count('users', { role: 'student' });
    const totalFaculty = db.count('users', { role: 'faculty' });
    const allExams = db.find('exams');
    const totalExams = allExams.length;
    const activeExams = allExams.filter(e => e.status === 'Active').length;
    const completedExams = allExams.filter(e => e.status === 'Completed').length;
    const scheduledExams = allExams.filter(e => e.status === 'Scheduled').length;
    const totalDepartments = db.count('departments');

    // Chart: Students by Department
    const departments = db.find('departments');
    const studentsByDept = departments.map(d => ({
      department: d.code || d.name,
      students: db.count('users', { role: 'student', department: d.name })
    }));

    // Chart: Pass vs Fail stats from attempts
    const attempts = db.find('attempts');
    const passCount = attempts.filter(a => a.passed).length;
    const failCount = attempts.filter(a => !a.passed).length;

    // Chart: Monthly exam activity (simulated last 6 months)
    const monthlyActivity = [
      { month: 'Jun', exams: 4, attempts: 65 },
      { month: 'Jul', exams: 6, attempts: 92 },
      { month: 'Aug', exams: 8, attempts: 130 },
      { month: 'Sep', exams: 12, attempts: 180 },
      { month: 'Oct', exams: 10, attempts: 145 },
      { month: 'Nov', exams: 14, attempts: 210 }
    ];

    // Upcoming exams
    const upcomingExams = allExams
      .filter(e => ['Scheduled', 'Active'].includes(e.status))
      .slice(0, 5);

    // Recent system activities
    const recentActivity = (db.find('activityLogs') || []).slice(-10).reverse();

    res.json({
      success: true,
      stats: {
        totalStudents,
        totalFaculty,
        totalExams,
        activeExams,
        completedExams,
        scheduledExams,
        totalDepartments
      },
      charts: {
        studentsByDept,
        passVsFail: [
          { name: 'Passed', value: passCount || 18, color: '#10B981' },
          { name: 'Failed', value: failCount || 4, color: '#EF4444' }
        ],
        monthlyActivity
      },
      upcomingExams,
      recentActivity
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ success: false, message: 'Failed to load admin stats.' });
  }
};

// Faculty Management
exports.getFaculty = async (req, res) => {
  try {
    const list = db.find('users', { role: 'faculty' }).map(u => {
      const copy = { ...u };
      delete copy.password;
      return copy;
    });
    res.json({ success: true, faculty: list });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch faculty list.' });
  }
};

exports.createFaculty = async (req, res) => {
  try {
    const { fullName, email, phone, department, designation, assignedSubjects, assignedSections, assignedCourses, password } = req.body;
    if (!fullName || !email) {
      return res.status(400).json({ success: false, message: 'Full name and email are required.' });
    }

    const existing = db.findOne('users', { email: email.trim().toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User with this email already exists.' });
    }

    const hashedPassword = bcrypt.hashSync(password || 'password123', 10);
    const facultyCount = db.count('users', { role: 'faculty' }) + 1;
    const facultyId = 'FAC-' + (1000 + facultyCount);

    const faculty = db.create('users', {
      fullName,
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: 'faculty',
      facultyId,
      phone: phone || '',
      department: department || 'General',
      designation: designation || 'Assistant Professor',
      assignedSubjects: assignedSubjects || [],
      assignedSections: assignedSections || [],
      assignedCourses: assignedCourses || [],
      status: 'active',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${facultyId}`
    });

    db.logActivity('FACULTY_CREATED', req.user, { facultyName: fullName, facultyId });

    const safe = { ...faculty };
    delete safe.password;
    res.status(201).json({ success: true, message: 'Faculty member created successfully', faculty: safe });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create faculty member.' });
  }
};

exports.updateFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, phone, department, designation, assignedSubjects, assignedSections, assignedCourses, status } = req.body;

    const updates = {
      fullName,
      email: email?.trim().toLowerCase(),
      phone,
      department,
      designation,
      assignedSubjects,
      assignedSections,
      assignedCourses,
      status
    };

    const updated = db.findByIdAndUpdate('users', id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Faculty not found.' });
    }

    db.logActivity('FACULTY_UPDATED', req.user, { facultyId: id });

    const safe = { ...updated };
    delete safe.password;
    res.json({ success: true, message: 'Faculty updated successfully', faculty: safe });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update faculty.' });
  }
};

exports.deleteFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = db.findByIdAndDelete('users', id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Faculty not found.' });
    }
    db.logActivity('FACULTY_DELETED', req.user, { facultyId: id });
    res.json({ success: true, message: 'Faculty deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete faculty.' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    const hashedPassword = bcrypt.hashSync(newPassword || 'password123', 10);
    const updated = db.findByIdAndUpdate('users', id, { password: hashedPassword });
    if (!updated) return res.status(404).json({ success: false, message: 'User not found.' });

    db.logActivity('PASSWORD_RESET', req.user, { targetUserId: id });
    res.json({ success: true, message: 'Password reset successfully to default (password123).' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to reset password.' });
  }
};

// Student Management
exports.getStudents = async (req, res) => {
  try {
    const { department, course, section, search } = req.query;
    let students = db.find('users', { role: 'student' });

    if (department) {
      students = students.filter(s => s.department === department);
    }
    if (course) {
      students = students.filter(s => s.course === course);
    }
    if (section) {
      students = students.filter(s => s.section === section);
    }
    if (search) {
      const q = search.toLowerCase();
      students = students.filter(s => 
        (s.fullName && s.fullName.toLowerCase().includes(q)) ||
        (s.email && s.email.toLowerCase().includes(q)) ||
        (s.studentId && s.studentId.toLowerCase().includes(q))
      );
    }

    const safeList = students.map(s => {
      const copy = { ...s };
      delete copy.password;
      return copy;
    });

    res.json({ success: true, total: safeList.length, students: safeList });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch students.' });
  }
};

exports.createStudent = async (req, res) => {
  try {
    const { fullName, email, phone, department, course, year, semester, section, studentId, password } = req.body;
    if (!fullName || !email || !section) {
      return res.status(400).json({ success: false, message: 'Full name, email, and section are required.' });
    }

    const existing = db.findOne('users', { email: email.trim().toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User with this email already exists.' });
    }

    const count = db.count('users', { role: 'student' }) + 1;
    const finalRoll = studentId || ('STU' + String(count).padStart(4, '0'));
    const hashedPassword = bcrypt.hashSync(password || 'password123', 10);

    const student = db.create('users', {
      fullName,
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: 'student',
      phone: phone || '',
      studentId: finalRoll,
      rollNumber: finalRoll,
      department: department || 'Computer Science & Engineering',
      course: course || 'B.Tech Computer Science',
      year: year || '2nd Year',
      semester: semester || '4th Semester',
      section,
      status: 'active',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${finalRoll}`
    });

    db.logActivity('STUDENT_CREATED', req.user, { studentName: fullName, studentId: finalRoll });

    const safe = { ...student };
    delete safe.password;
    res.status(201).json({ success: true, message: 'Student created successfully', student: safe });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create student.' });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, phone, department, course, year, semester, section, status } = req.body;

    const updates = {
      fullName,
      email: email?.trim().toLowerCase(),
      phone,
      department,
      course,
      year,
      semester,
      section,
      status
    };

    const updated = db.findByIdAndUpdate('users', id, updates);
    if (!updated) return res.status(404).json({ success: false, message: 'Student not found.' });

    db.logActivity('STUDENT_UPDATED', req.user, { studentId: id });

    const safe = { ...updated };
    delete safe.password;
    res.json({ success: true, message: 'Student updated successfully', student: safe });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update student.' });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = db.findByIdAndDelete('users', id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Student not found.' });

    db.logActivity('STUDENT_DELETED', req.user, { studentId: id });
    res.json({ success: true, message: 'Student deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete student.' });
  }
};

exports.bulkImportStudents = async (req, res) => {
  try {
    const { students } = req.body; // array of student objects
    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ success: false, message: 'Provide an array of students to import.' });
    }

    const hashedPassword = bcrypt.hashSync('password123', 10);
    let imported = 0;

    for (const s of students) {
      if (!s.email || !s.fullName) continue;
      const existing = db.findOne('users', { email: s.email.trim().toLowerCase() });
      if (existing) continue;

      db.create('users', {
        fullName: s.fullName,
        email: s.email.trim().toLowerCase(),
        password: hashedPassword,
        role: 'student',
        phone: s.phone || '',
        studentId: s.studentId || ('STU' + Math.floor(1000 + Math.random() * 9000)),
        department: s.department || 'Computer Science & Engineering',
        course: s.course || 'B.Tech Computer Science',
        year: s.year || '2nd Year',
        semester: s.semester || '4th Semester',
        section: s.section || 'CSE-A',
        status: 'active',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.email}`
      });
      imported++;
    }

    db.logActivity('BULK_STUDENT_IMPORT', req.user, { count: imported });
    res.json({ success: true, message: `Successfully imported ${imported} students.`, count: imported });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to import students.' });
  }
};

// Academic Structure: Departments, Courses, Sections, Subjects
exports.getAcademicStructure = async (req, res) => {
  try {
    const departments = db.find('departments');
    const courses = db.find('courses');
    const sections = db.find('sections');
    const subjects = db.find('subjects');

    res.json({
      success: true,
      departments,
      courses,
      sections,
      subjects
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch academic structure.' });
  }
};

exports.createDepartment = async (req, res) => {
  try {
    const { name, code, hodName, description } = req.body;
    if (!name || !code) return res.status(400).json({ success: false, message: 'Name and code are required.' });
    const dept = db.create('departments', { name, code, hodName, description });
    res.status(201).json({ success: true, department: dept });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create department.' });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const { name, code, departmentName, durationYears, totalSemesters } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Course name is required.' });
    const course = db.create('courses', { name, code, departmentName, durationYears: Number(durationYears) || 4, totalSemesters: Number(totalSemesters) || 8 });
    res.status(201).json({ success: true, course });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create course.' });
  }
};

exports.createSection = async (req, res) => {
  try {
    const { name, courseName, departmentName, year, semester, capacity, roomNumber } = req.body;
    if (!name || !semester) return res.status(400).json({ success: false, message: 'Name and semester are required.' });
    const section = db.create('sections', { name, courseName, departmentName, year, semester, capacity: Number(capacity) || 60, roomNumber });
    res.status(201).json({ success: true, section });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create section.' });
  }
};

exports.createSubject = async (req, res) => {
  try {
    const { name, code, departmentName, credits } = req.body;
    if (!name || !code) return res.status(400).json({ success: false, message: 'Name and code are required.' });
    const subject = db.create('subjects', { name, code, departmentName, credits: Number(credits) || 3 });
    res.status(201).json({ success: true, subject });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create subject.' });
  }
};

exports.deleteAcademicItem = async (req, res) => {
  try {
    const { type, id } = req.params;
    const collectionMap = {
      department: 'departments',
      course: 'courses',
      section: 'sections',
      subject: 'subjects'
    };
    const collection = collectionMap[type];
    if (!collection) return res.status(400).json({ success: false, message: 'Invalid item type.' });

    db.findByIdAndDelete(collection, id);
    res.json({ success: true, message: `${type} deleted successfully.` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete academic item.' });
  }
};

// System Settings
exports.getSettings = async (req, res) => {
  try {
    const store = db.getStore();
    res.json({ success: true, settings: store.settings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to get settings.' });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const store = db.getStore();
    store.settings = { ...store.settings, ...req.body };
    db.save();
    db.logActivity('SETTINGS_UPDATED', req.user);
    res.json({ success: true, message: 'Settings saved successfully.', settings: store.settings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update settings.' });
  }
};

// All Results & Reports
exports.getAllResults = async (req, res) => {
  try {
    const attempts = db.find('attempts');
    const exams = db.find('exams');
    res.json({ success: true, attempts, exams });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch results.' });
  }
};
