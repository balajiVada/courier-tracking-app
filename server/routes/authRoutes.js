const express = require('express');
const { handleUserSignUp, handleUserLogin, getUserDetails, updateUserDetails} = require('../controllers/authController');
const router = express.Router();

router.post('/signup', handleUserSignUp);
router.post('/login', handleUserLogin);
// Add these new routes
router.get('/user/:userId', getUserDetails);
router.put('/user/:userId', updateUserDetails);

module.exports = router;
