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

exports.getTour = catchAsync(async(req, res, next) => {
    // 1 get data
    // 2 build template
    // 3 render template using data from step 1
    const {tourSlug} = req.params
    const tour = await Tour.findOne({slug: tourSlug}).populate({
        path: 'reviews',
        fields: 'review rating user'
    })

    res.status(200).render('pages/tour', {
        title: tour.name,
        tour
    })
});

exports.getLogin = (req, res) => {
    res.status(200).render('pages/login', {
        title: "Log into your account"
    });
};