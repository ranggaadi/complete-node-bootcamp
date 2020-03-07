const express = require('express');
const toursController = require('../controllers/tourController');
const router = express.Router();

router.route('/')
.get(toursController.getAllTours)
.post(toursController.createATour);

router.route('/:id')
.get(toursController.getTour)
.patch(toursController.updateTour)
.delete(toursController.deleteTour);

module.exports = router;