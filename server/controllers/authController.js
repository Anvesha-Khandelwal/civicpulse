const jwt  = require('jsonwebtoken');
const User = require('../models/userModel');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, departmentName, departmentId } = req.body;

    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({
      name, email, password, role: role || 'citizen',
      departmentName: role === 'authority' ? departmentName : undefined,
      departmentId:   role === 'authority' ? departmentId   : undefined,
    });

    res.status(201).json({
      token: signToken(user._id),
      user: {
        _id: user._id, name: user.name, email: user.email,
        role: user.role, departmentName: user.departmentName,
      },
    });
  } catch (err) { next(err); }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });

    res.json({
      token: signToken(user._id),
      user: {
        _id: user._id, name: user.name, email: user.email,
        role: user.role, departmentName: user.departmentName,
      },
    });
  } catch (err) { next(err); }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json(req.user);
};

module.exports = { register, login, getMe };