const express = require('express');
const viewsController = require('./../controllers/viewsController');
const authController = require('./../controllers/authController');
const router = express.Router();

//mengecek apakah sudah loggin untuk semua route
router.use(authController.isLoggedIn);

router.get('/', viewsController.getOverview);
router.get('/tour/:tourSlug', viewsController.getTour);
router.route('/login')
    .get(viewsController.getLogin);

module.exports = router;