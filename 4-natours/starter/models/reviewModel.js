const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema({
    review: {
        type: String,
        required: [true, 'A tour must have a review'],
        unique: true,
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
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, "Review must belong to a user."],
    }
}, {
    toJSON: {virtuals: true},
    toObject:{virtuals: true}
})

const Review = mongoose.Model('Review', reviewSchema);
module.exports = Review;
