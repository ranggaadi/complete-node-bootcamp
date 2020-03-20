const express = require('express');
const toursController = require('../controllers/tourController');
const router = express.Router();

// param Middleware (hanya akan bekerja pada sebuah parameter request parameter tertentu)
// router.param('id', toursController.checkID); //mengecek ID apakah valid pada setiap req yang memiliki ID

router.route('/top-5-tours').get(toursController.alias, toursController.getAllTours)
// router.route('/top-5-tours').get(toursController.checkTop5Tour, toursController.getAllTours)

router.route('/tours-stats').get(toursController.getTourStats);
router.route('/monthly-plan/:year').get(toursController.getMonthlyPlan);

router.route('/')
.get(toursController.getAllTours)
.post(toursController.createATour)

// router.route('/:check').all(async (req, res) => {

// });

router.route('/:id')
.get(toursController.getTour)
.patch(toursController.updateTour)
.delete(toursController.deleteTour);


// router.route('/4fun')
// .post(toursController.deleteAllTour, toursController.importAllTour);

module.exports = router;