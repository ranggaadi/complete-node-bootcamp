const express = require('express');
const usersController = require('../controllers/userController');
const authController = require('../controllers/authController');
const router = express.Router();

router.post('/signup', authController.signup) 
router.post('/login', authController.login)
router.post('/forgot-password', authController.forgotPassword)
router.post('/reset-password', authController.resetPassword)

router.route('/')
.get(usersController.getAllUsers)
.post(usersController.createUser);

router.route('/:id')
.get(usersController.getUser)
.patch(usersController.updateUser)
.delete(usersController.deleteUser);

module.exports = router;