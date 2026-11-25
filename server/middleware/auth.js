const { verifyToken } = require('../utils/jwt');
const db = require('../config/db');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required. Token missing.' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }

  const user = db.findById('users', decoded.id);
  if (!user) {
    return res.status(401).json({ success: false, message: 'User not found or deleted.' });
  }

  if (user.status === 'inactive') {
    return res.status(403).json({ success: false, message: 'Account has been deactivated. Contact Admin.' });
  }

  req.user = user;
  next();
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Forbidden: Access requires one of [${roles.join(', ')}] permissions. Current role: ${req.user.role}` 
      });
    }

    next();
  };
}

module.exports = {
  authenticate,
  authorize
};
