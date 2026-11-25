const db = require('../config/db');

exports.getNotifications = async (req, res) => {
  try {
    const user = req.user;
    const all = db.find('notifications');

    // Filter notifications for this user:
    // targetRole === 'all' OR targetRole === user.role
    // and if targetSection is specified, student must belong to it
    const relevant = all.filter(n => {
      if (n.targetRole === 'all') return true;
      if (n.targetRole === user.role) {
        if (user.role === 'student' && n.targetSection) {
          return n.targetSection === user.section;
        }
        return true;
      }
      return false;
    }).reverse();

    res.json({ success: true, notifications: relevant });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
  }
};

exports.broadcast = async (req, res) => {
  try {
    const { title, message, targetRole, targetDepartment, targetSection } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required.' });
    }

    const notif = db.create('notifications', {
      title,
      message,
      type: 'announcement',
      targetRole: targetRole || 'all',
      targetDepartment: targetDepartment || null,
      targetSection: targetSection || null,
      createdByName: req.user.fullName,
      createdAt: new Date().toISOString()
    });

    db.logActivity('ANNOUNCEMENT_BROADCAST', req.user, { title, targetRole });

    res.status(201).json({ success: true, message: 'Notification broadcasted successfully.', notification: notif });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to broadcast notification.' });
  }
};
