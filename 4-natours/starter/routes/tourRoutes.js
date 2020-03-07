const express = require('express');
const toursController = require('../controllers/tourController');
const router = express.Router();

// param Middleware (hanya akan bekerja pada sebuah parameter request parameter tertentu)
router.param('id', toursController.checkID); //mengecek ID apakah valid pada setiap req yang memiliki ID

router.route('/')
.get(toursController.getAllTours)
.post(toursController.checkBody, toursController.createATour);

router.route('/:id')
.get(toursController.getTour)
.patch(toursController.updateTour)
.delete(toursController.deleteTour);

module.exports = router;