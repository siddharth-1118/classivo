const express = require('express');
const router = express.Router();
const { register, login, googleLogin, me, completeProfile } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/me', authenticate, me);
router.post('/complete-profile', authenticate, (req, res, next) => {
  console.log("[DEBUG] POST /complete-profile route matched!");
  next();
}, completeProfile);

router.post('/profile-setup', authenticate, (req, res, next) => {
  console.log("[DEBUG] POST /profile-setup route matched!");
  next();
}, completeProfile);

module.exports = router;
