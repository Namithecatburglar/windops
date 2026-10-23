const express = require('express');
const router = express.Router();
const { loginUser, registerUser, getMe, getDemoUsers } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/login', loginUser);
router.post('/register', registerUser);
router.get('/me', protect, getMe);
router.get('/demo-users', getDemoUsers);

module.exports = router;
