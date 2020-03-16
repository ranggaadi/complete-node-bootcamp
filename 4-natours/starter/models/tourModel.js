const mongoose = require('mongoose');

//dibawah ini adalah schema
const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true
    },
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty'] 
    },
    ratingsAverage: {   //akan menghitung dari model reviews
        type: Number,
        default: 4.5
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, "A tour must have a price"]
    },
    discountPrice: Number,
    summary: {
        type: String,
        trim: true,
        required: [true, "A tour must have an description"]
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, "A tour must have an cover image"]
    },
    images: [String], //tipenya merupakan array of string.
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false //apabila select bernilai false maka tidak akan ditampilkan pada client
        //bermanfaat apabila data yang ada bersifat sensitif
    },
    startDates: [Date]
})

//dibawah ini adalah model
const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
