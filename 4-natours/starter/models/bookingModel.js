const mongoose = require('mongoose');

const bookingSchema = mongoose.Schema({
    tour: {
        type: mongoose.Schema.ObjectId,
        required: [true, "Booking must belong to a tour"],
        ref: 'Tour'
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, "Booking must belong to an user"],
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    price: {
        type: Number,
        required: [true, "Booking must contain price information"]
    },
    paid: {
        type: Boolean,
        default: true
    }
})

bookingSchema.pre(/^find/, function(next){ //melakukan populate
    this.populate('user').populate({
        path: 'tour',
        select: 'name'
    })
    next()
})


const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;