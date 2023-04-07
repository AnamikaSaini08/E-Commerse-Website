const express = require('express');
const { registerUser, loginUser, logout } = require('../controllers/userController');
const router = express.Router();

//Register User
router.route('/register').post(registerUser);

//Login User
router.route('/login').post(loginUser);

//Logout User
router.route('/logout').get(logout);

module.exports = router;
