const express = require('express');
const viewsController = require('./../controllers/viewsController');
const authController = require('./../controllers/authController');
const router = express.Router();

//mengecek apakah sudah loggin untuk semua route
router.get('/profile', authController.protect, viewsController.getProfile);
router.post('/update-profile', authController.protect, viewsController.updateProfile);

router.use(authController.isLoggedIn);

router.get('/', viewsController.getOverview);
router.get('/tour/:tourSlug', viewsController.getTour);
router.route('/login')
    .get(viewsController.getLogin);

module.exports = router;