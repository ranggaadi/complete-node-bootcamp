const express = require('express');
const usersController = require('../controllers/userController');
const authController = require('../controllers/authController');
const router = express.Router();

router.post('/signup', authController.signup) 
router.post('/login', authController.login)
router.get('/logout', authController.logout)
router.post('/forgot-password', authController.forgotPassword)
router.patch('/reset-password/:token', authController.resetPassword)

router.use(authController.protect); //semua router dibawah kode ini di protect (harus login)

router.patch('/update-password', authController.updatePassword);
router.get('/profile', usersController.getMe, usersController.getUser)
router.patch('/update-profile', usersController.uploadPhotoUser, usersController.resizeUserPhoto, usersController.updateMe);
router.delete('/delete-account', usersController.deleteMe);

router.use(authController.restrictTo('admin')); //semua router dibawah kode harus protect dan harus punya akses admin.

router.route('/')
.get(usersController.getAllUsers)

router.route('/:id')
.get(usersController.getUser)
.patch(usersController.updateUser)
.delete(usersController.deleteUser)

module.exports = router;