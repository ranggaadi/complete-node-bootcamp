const mongoose = require('mongoose');
const slugify = require('slugify');

//dibawah ini adalah schema
const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true
    },
    slug: String, //untuk implementasi mongoose middleware document
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
    isSecretTour: {
        type: Boolean,
        default: false
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
}, {                             //BLOK ini adalah Opsi schema
    toJSON: {virtuals: true},   //ini berarti apabila schema dijadikan JSON atau Object maka akan menyertakan document virtual
    toObject: {virtuals: true}
})


//akan membuat document virtual bernama durationInHours
// kenapa tidak memakai arrow function? karena dalam arrow function tidak mendapat thisnya sendiri
tourSchema.virtual("durationInHours").get(function(){
    return this.duration*24;
})


// Mongoose middleware: mongoose juga memiliki fungsi middleware yang terdiri dari document, query, aggregate, dan model middleware

// DOCUMENT middleware : akan menjalankan fungsi sebelum fungsi .save() atau .create() (tidak berlaku untuk insertMany dkk.)
tourSchema.pre("save", function(next){
    // console.log(this) //this adalah document schema saat ini

    this.slug = slugify(this.name, {lower: true});
    next();
});


// QUERY middleware : akan menjalankan fungsi sebelum query dimulai (pre) dan sesudah query dijalankan (post)

// /^find/ adalah regex yang akan memilih semua yang berawalan dengan find (find, findOne, findOneAndUpdate dkk)
tourSchema.pre(/^find/, function(next){
    this.find({isSecretTour: {$ne: true}});  //$ne = not equal

    this.start = Date.now(); //karena this adalah object query biasa sehingga bisa digunakan untuk menambahkan apapun
    next();
})

tourSchema.post(/^find/, function(docs, next){
    console.log(`Query dijalankan dalam waktu ${Date.now()-this.start} ms!`); //untuk mencetak waktu eksekusi sejak fungsi pre berjalan
    console.log("Object returned:", docs.length);
    next();
})



//AGGREGATION MIDDLEWARE
tourSchema.pre("aggregate", function(next){
    console.log(this.pipeline()) //isi dari aggregate sesuai route yang kita jalankan.
    this.pipeline().unshift({$match: {isSecretTour: {$ne: true}}}); //memasukan match baru diawal aggregasi
    next();
});

tourSchema.post("aggregate", function(data, next){
    // console.log(data); //isi data dari aggregate yang telah dijalanakan
    console.log(this.pipeline());
    next();
})


// tourSchema.pre("save", function(next){
//     console.log("ini akan dicetak antara proses pemberian slug dan middleware post");
//     next();
// })

// //middleware document post dijalankan setelah data disave
// tourSchema.post("save", function(doc, next){
//     console.log(doc) //doc adalah argument dari document yang sudah dirubah
//     next();
// })




//dibawah ini adalah model
const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
