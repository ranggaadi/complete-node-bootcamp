const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');


exports.getOverview = catchAsync(async(req, res, next) => {
    //1) get the data
    const tours = await Tour.find();
    //2) build the tempalate from data from step 1 by passing it in overview pages

    res.status(200).render('pages/overview', {
        title: "All Tours",
        tours
    })
});

exports.getTour = (req, res) => {
    res.status(200).render('pages/tour', {
        title: "The Forest Hiker"
    })
}