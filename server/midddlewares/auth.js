const jwt  = require('jsonwebtoken');
const User = require('../models/userModel');

const protect = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer '))
    return res.status(401).json({ message: 'Not authorised, no token' });

  try {
    const decoded = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    next();
  } catch {
    res.status(401).json({ message: 'Token invalid or expired' });
  }
};

const authorityOnly = (req, res, next) => {
  if (req.user?.role === 'authority') return next();
  res.status(403).json({ message: 'Authority access only' });
};

module.exports = { protect, authorityOnly };