const Review = require('./../models/reviewModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./controllerFactory');

exports.getAllReviews = factory.getAll(Review);


// exports.getReview= catchAsync(async(req, res, next) => {
//     const review  =  await Review.find({_id: req.params.id});

//     if(!review.length){
//         return next(new CustomError(`Review with id: ${req.params.id} doesn't exist`, 404));
//     }

//     res.status(200).json({
//         status: "success",
//         data: {
//             review
//         }
//     })
// });

exports.setTourUserIds = catchAsync(async (req, res, next) => {
    if(!req.body.tour) req.body.tour = req.params.tourId;
    if(!req.body.user) req.body.user = req.user.id;
    next();
})

exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
// exports.createReview = catchAsync(async(req, res, next) => {

//     //dibawah ini digunakan untuk nested tour, yang apabila tidak terdapat key tour pada body
//     //maka akan mengambil parameter dari url begitu juga dengan user, hanya saja user mengambil
//     //id melalui id yang sudah login
//     if(!req.body.tour) req.body.tour = req.params.tourId;
//     if(!req.body.user) req.body.user = req.user.id;

//     const newReview = await Review.create(req.body);

//     res.status(201).json({
//         status: "success",
//         requestedAt: req.reqTime,
//         data: {
//             review: newReview
//         }
//     })
// })

exports.deleteReview = factory.deleteOne(Review);