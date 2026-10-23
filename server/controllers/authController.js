const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'windops_super_secure_industrial_control_jwt_secret_2026', {
    expiresIn: '30d',
  });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (user && (await user.matchPassword(password))) {
      user.lastLogin = new Date();
      await user.save({ validateBeforeSave: false });

      return res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          title: user.title,
          token: generateToken(user._id),
        },
      });
    } else {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Check email and password.' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public (or Admin protected in prod)
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role, title } = req.body;

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'operations_manager',
      title: title || 'Offshore Specialist',
    });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        title: user.title,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Get demo users list for quick login in UI
// @route   GET /api/auth/demo-users
// @access  Public
const getDemoUsers = async (req, res, next) => {
  try {
    const demoUsers = [
      {
        role: 'admin',
        label: 'Admin (Full System Access)',
        email: 'admin@windops.io',
        title: 'Chief Operations Officer',
        scope: 'Full farm control, user administration, system config',
      },
      {
        role: 'operations_manager',
        label: 'Operations Manager',
        email: 'ops@windops.io',
        title: 'Indian Offshore Operations Lead',
        scope: 'Monitoring, maintenance oversight, marine logistics, vessel dispatch, reports',
      },
      {
        role: 'maintenance_engineer',
        label: 'Maintenance Engineer',
        email: 'tech@windops.io',
        title: 'Senior Turbine Field Engineer',
        scope: 'Turbine mechanics, work orders, telemetry diagnostics, inspections',
      },
      {
        role: 'inspector',
        label: 'Inspector',
        email: 'inspector@windops.io',
        title: 'Lead QA / Subsea & NDT Inspector',
        scope: 'Blade, structural, foundation inspections and findings reporting',
      },
    ];
    res.json({ success: true, data: demoUsers });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  loginUser,
  registerUser,
  getMe,
  getDemoUsers,
};
