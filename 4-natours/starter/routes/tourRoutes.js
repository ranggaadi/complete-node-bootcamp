const express = require('express');
const toursController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('../routes/reviewRoutes');
const router = express.Router();

// param Middleware (hanya akan bekerja pada sebuah parameter request parameter tertentu)
// router.param('id', toursController.checkID); //mengecek ID apakah valid pada setiap req yang memiliki ID

//digunakan untuk nested route dengan metode mergeParams pada route review
router.use('/:tourId/reviews', reviewRouter);

router.route('/top-5-tours').get(toursController.alias, toursController.getAllTours)
// router.route('/top-5-tours').get(toursController.checkTop5Tour, toursController.getAllTours)

router.route('/tours-stats').get(toursController.getTourStats);
router.route('/monthly-plan/:year').get(toursController.getMonthlyPlan);

router.route('/')   //authcontroller.protect digunakan untuk melindungi route dari user yang bvelum login
.get(authController.protect, toursController.getAllTours)
.post(toursController.createATour)

// router.route('/:check').all(async (req, res) => {

// });

router.route('/:id')
.get(toursController.getTour)
.patch(toursController.updateTour)
.delete(authController.protect, authController.restrictTo('lead-guide', 'admin'), toursController.deleteTour);

// router.route('/:tourId/reviews')
// .post(authController.protect, authController.restrictTo('user'), reviewController.createReview);


// router.route('/4fun')
// .post(toursController.deleteAllTour, toursController.importAllTour);

module.exports = router;