const jwt = require('jsonwebtoken');
const { getMockDB } = require('../config/db');
const { User } = require('../models/Schemas');

// Protect routes
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ceylon_tea_super_secret_key_12345');

      if (process.env.USE_MOCK_DB === 'true') {
        const db = getMockDB();
        const user = db.users.find(u => u._id === decoded.id);
        if (!user) {
          return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
        }
        // Exclude password
        const { password, ...userWithoutPassword } = user;
        req.user = userWithoutPassword;
      } else {
        req.user = await User.findById(decoded.id).select('-password');
        if (!req.user) {
          return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
        }
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `User role '${req.user ? req.user.role : 'None'}' is not authorized to access this route` 
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
