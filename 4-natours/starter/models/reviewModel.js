const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = mongoose.Schema({
    review: {
        type: String,
        required: [true, 'A tour must have a review'],
        trim: true,
        minlength: [1, "A tour name must contain not less than or equals to 1 characters"],
    },
    rating: {
        type: Number,
        default: 3,
        min: [1, "Rating must be above 1.0"],
        max: [5, "Rating must be below 5.0"],
    },
    createdAt: {
        type:Date,
        default: Date.now(),
        select: false
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, "Review must belong to a tour."],
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, "Review must belong to a user."],
    }
}, {
    toJSON: {virtuals: true},
    toObject:{virtuals: true}
})

reviewSchema.pre(/^find/, function(next){
    // this.populate({path: "tour", select: "name"})
    //     .populate({path: "user", select: "name photo"});

    this.populate({path: "user", select: "name photo"});
    next();   
})

reviewSchema.statics.calcAvgRatings = async function(tourId){
    const stats = await this.aggregate([
        {
            $match: {tour: tourId}
        },
        {
            $group: {
                _id: '$tour',
                nRating: {$sum: 1},
                avgRating: {$avg: '$rating'}
            }
        }
    ])
    // console.log(stats);

    //mengupdate berdasarkan nilai dari aggregate
    await Tour.findByIdAndUpdate(tourId, {
        ratingsQuantity: stats[0].nRating,
        ratingsAverage: stats[0].avgRating
    })
}
reviewSchema.post('save', function(){
    //this points to current review
    this.constructor.calcAvgRatings(this.tour);
})

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
