const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { generateToken } = require('../utils/jwt');

exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Please provide email, password, and portal role.' });
    }

    const user = db.findOne('users', { email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Role verification: Prevent student logging into admin/faculty and vice versa
    if (user.role !== role.toLowerCase()) {
      return res.status(403).json({ 
        success: false, 
        message: `Role mismatch: This account is registered as '${user.role.toUpperCase()}', but you are attempting to log into the '${role.toUpperCase()} PORTAL'. Please switch to the appropriate portal.` 
      });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Please contact the administrator.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken({ id: user._id, role: user.role, email: user.email });

    const safeUser = { ...user };
    delete safeUser.password;

    db.logActivity('USER_LOGIN', user, { ip: req.ip });

    res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

exports.register = async (req, res) => {
  try {
    const { 
      fullName, 
      email, 
      password, 
      role, 
      phone,
      department,
      course,
      year,
      semester,
      section,
      studentId,
      designation,
      assignedSubjects,
      assignedSections
    } = req.body;

    if (!fullName || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Please provide full name, email, password, and role.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = db.findOne('users', { email: cleanEmail });
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email address already exists. Please sign in instead.' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const count = db.count('users', { role }) + 1;

    let userData = {
      fullName: fullName.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role: role.toLowerCase(),
      phone: phone || '',
      department: department || (role === 'admin' ? 'Administration' : 'Computer Science & Engineering'),
      status: 'active'
    };

    if (role === 'student') {
      const roll = studentId || ('STU' + String(1000 + count));
      userData = {
        ...userData,
        studentId: roll,
        rollNumber: roll,
        course: course || 'B.Tech Computer Science',
        year: year || '2nd Year',
        semester: semester || '4th Semester',
        section: section || 'CSE-A',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${roll}`
      };
    } else if (role === 'faculty') {
      const facId = 'FAC-' + (1000 + count);
      userData = {
        ...userData,
        facultyId: facId,
        designation: designation || 'Assistant Professor',
        assignedSubjects: Array.isArray(assignedSubjects) 
          ? assignedSubjects 
          : (assignedSubjects ? assignedSubjects.split(',').map(s => s.trim()).filter(Boolean) : ['Operating Systems', 'Computer Networks']),
        assignedSections: Array.isArray(assignedSections) 
          ? assignedSections 
          : (assignedSections ? assignedSections.split(',').map(s => s.trim()).filter(Boolean) : ['CSE-A', 'CSE-B']),
        assignedCourses: [course || 'B.Tech Computer Science'],
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${facId}`
      };
    } else if (role === 'admin') {
      userData = {
        ...userData,
        department: 'Administration',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=admin_${count}`
      };
    }

    const newUser = db.create('users', userData);
    db.logActivity('USER_REGISTERED', newUser, { role: newUser.role });

    const token = generateToken({ id: newUser._id, role: newUser.role, email: newUser.email });
    const safeUser = { ...newUser };
    delete safeUser.password;

    res.status(201).json({
      success: true,
      message: `Account created successfully for ${fullName} (${role.toUpperCase()})`,
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, message: 'Server error during account registration.' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const safeUser = { ...req.user };
    delete safeUser.password;
    res.json({ success: true, user: safeUser });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error retrieving user profile.' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { fullName, phone, avatar } = req.body;
    const updates = {};
    if (fullName) updates.fullName = fullName;
    if (phone) updates.phone = phone;
    if (avatar) updates.avatar = avatar;

    const updated = db.findByIdAndUpdate('users', req.user._id, updates);
    const safeUser = { ...updated };
    delete safeUser.password;

    db.logActivity('PROFILE_UPDATED', req.user);

    res.json({ success: true, message: 'Profile updated successfully', user: safeUser });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new password are required.' });
    }

    const isMatch = bcrypt.compareSync(currentPassword, req.user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password does not match.' });
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    db.findByIdAndUpdate('users', req.user._id, { password: hashedPassword });

    db.logActivity('PASSWORD_CHANGED', req.user);

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to change password.' });
  }
};
