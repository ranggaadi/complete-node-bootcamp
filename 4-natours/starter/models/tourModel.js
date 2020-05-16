const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
// const User = require('./userModel'); //untuk implementasi embedded document userId

//dibawah ini adalah schema
const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true,
        maxlength: [50, "A tour name must contain not more than or equals to 50 characters"],
        minlength: [10, "A tour name must contain not less than or equals to 10 characters"],

        //dibawah ini adalah validator untuk memvalidasi menggunakan external validator dari npm
        // validate: [validator.isAlpha, "A tour name should only contains characters"]  
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
        required: [true, 'A tour must have a difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: "Difficulty is either: easy, medium or difficult"
        }
    },
    ratingsAverage: {   //akan menghitung dari model reviews
        type: Number,
        default: 4.5,
        min: [1, "Rating must be above 1.0"],
        max: [5, "Rating must be below 5.0"],
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, "A tour must have a price"]
    },
    discountPrice: {
        type: Number,
        // validate: function(val){ //mendapatkan akses val -> dimana val adalah nilai yang diassign saat pembuatan
        //     return val <= this.price //nilai diskon tidak boleh melebihi harga aslinya.
        // }

        //dibawah ini adalah custom validator
        validate: {
            validator: function(val){
                //variabel this ini hanya merujuk ke object pembuatan dokumen baru (bukan update dkk)
                return val <= this.price;
            },
            message: "discountPrice can't have value above price value"
        }
    },
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
    startDates: [Date],
    startLocation: {
        //deklarasi type untuk GeoJSON
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        description: String,
        address: String
    },
    locations: [ //untuk melakukan embedded document dapat dilakukan seperti berikut
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            description: String,
            address: String,
            day: Number
        }
    ],
    guides: [
        {
            type: mongoose.Schema.ObjectId, //akan mereferensi ke userId
            ref: 'User' //bahkan kita tidak perlu import model dari userModel
        }
    ]
}, {                             //BLOK ini adalah Opsi schema
    toJSON: {virtuals: true},   //ini berarti apabila schema dijadikan JSON atau Object maka akan menyertakan document virtual
    toObject: {virtuals: true}
})

// menggunakan index untuk optimasi pencarian 1 ascending, -1 descending
// tourSchema.index({price: 1}); //single index
tourSchema.index({price: 1, ratingsAverage: -1}); //compound index
tourSchema.index({slug: 1}); //digunakan untuk mengquery slug untuk pencarian, maka baiknya diset index.

//akan membuat document virtual bernama durationInHours
// kenapa tidak memakai arrow function? karena dalam arrow function tidak mendapat thisnya sendiri
tourSchema.virtual("durationInHours").get(function(){
    if(this.duration){
        return this.duration*24;
    }
})

//virtual populate
tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
})
// Mongoose middleware: mongoose juga memiliki fungsi middleware yang terdiri dari document, query, aggregate, dan model middleware

// DOCUMENT middleware : akan menjalankan fungsi sebelum fungsi .save() atau .create() (tidak berlaku untuk insertMany dkk.)
tourSchema.pre("save", function(next){
    // console.log(this) //this adalah document schema saat ini

    this.slug = slugify(this.name, {lower: true});
    next();
});

// // pre save middleware untuk embedding userid ke tours (guide property)
// tourSchema.pre("save", async function(next){
//     const guidePromises = this.guides.map(async id => await User.findById(id));
//     this.guides = await Promise.all(guidePromises);
//     next();
// });

// QUERY middleware : akan menjalankan fungsi sebelum query dimulai (pre) dan sesudah query dijalankan (post)

// /^find/ adalah regex yang akan memilih semua yang berawalan dengan find (find, findOne, findOneAndUpdate dkk)
tourSchema.pre(/^find/, function(next){
    this.find({isSecretTour: {$ne: true}});  //$ne = not equal

    this.start = Date.now(); //karena this adalah object query biasa sehingga bisa digunakan untuk menambahkan apapun
    next();
})

// query middleware untuk mengeset populate pada setiap findByID
tourSchema.pre(/^find/, function(next){
    this.populate({path: 'guides', select: '-__v -passwordChangedAt'});
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
