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
        type: Date,
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
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})


//gabungan table kolom user dan tour harus unique (mencegah review lebih dari 1 dari user yang sama)
reviewSchema.index({user: 1, tour: 1}, {unique: true});

reviewSchema.pre(/^find/, function (next) {
    // this.populate({path: "tour", select: "name"})
    //     .populate({path: "user", select: "name photo"});
    
    this.populate({ path: "user", select: "name photo" });
    next();
})

reviewSchema.statics.calcAvgRatings = async function (tourId) {

    //untuk mendapatkan banyaknya rating pada tiap tour dan rata ratanya
    const stats = await this.aggregate([
        {
            $match: { tour: tourId }
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ])
    // console.log(stats);

    //mengupdate berdasarkan nilai dari aggregate

    if (stats.length > 0) { //jika hasil aggregate ada maka jalankan
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        })
    } else { //jika tidak ada yang tour id yang memiliki review maka set as default
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        })
    }
}


//on post agar reviewnya disimpan terlebih dahulu
reviewSchema.post('save', function () {
    //this points to current review

    //untuk menjalankan method pertama kali maka menggunakan this.constructor
    this.constructor.calcAvgRatings(this.tour);
})

//namun untuk mengupdate ratingsQuantity dan ratingsAverage ketika review dihapus atau diupdate maka
//menggunakan cara dibawah ini

//kedua querty dibaawah ihi sebenernya adalah shorthand unntuk findOneAndUpdate dan findOneAndDelete
// findByIdAndUpdate
// findByIdAndDelete

//maka untuk mengaksesnya dapat digunakan regular expression untuk ini
reviewSchema.pre(/^findOneAnd/, async function (next) {
    //dimasukan pada this.review karena akan dioper dari query pre middleware ke post query middleware
    this.review = await this.findOne();
    console.log(this.review);
})

reviewSchema.post(/^findOneAnd/, async function () {
    // this.review = this pada query ini

    // await this.findOne() tidak bisa dijalankan disini karena, query sudah dijalankan. 
    await this.review.constructor.calcAvgRatings(this.review.tour);
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
