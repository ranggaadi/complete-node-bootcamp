const Review = require('./../models/reviewModel');
const catchAsync = require('./../utils/catchAsync');
const APIFeature = require('./../utils/apiFeatures');

exports.getAllReviews = catchAsync(async(req,res, next)=> {
    // const reviews = Review.find();

    const reviews = await Review.find();

    res.status(200).json({
        status: "success",
        requestedAt: req.reqTime,
        results: reviews.length,
        data: {
            reviews
        }
    })
});


exports.getReview= catchAsync(async(req, res, next) => {
    const review  =  await Review.find({_id: req.params.id});

    if(!review.length){
        return next(new CustomError(`Review with id: ${req.params.id} doesn't exist`, 404));
    }

    res.status(200).json({
        status: "success",
        data: {
            review
        }
    })
});

exports.createReview = catchAsync(async(req, res, next) => {
    const newReview = await Review.create(req.body);

    res.status(201).json({
        status: "success",
        requestedAt: req.reqTime,
        data: {
            review: newReview
        }
    })
})