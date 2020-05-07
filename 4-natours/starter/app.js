const morgan = require('morgan');
const express = require('express');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const xssClean = require('xss-clean');
const rateLimit = require('express-rate-limit');
const app = express();

const CustomError = require('./utils/customError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

// #### GLOBAL MIDDLEWARE
// NB : pada middleware harus selalu ada next

// set security for HTTP Headers
app.use(helmet());

//third party middleware untuk logging di development
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}

//melimit body dari req.body sehingga apabila lebih dari 10kb akan ditolak
app.use(express.json({limit: "10kb"}));


//Sanitize (menghilangkan code code ilegal) untuk mencegah NoSQL injection 
app.use(mongoSanitize());


//Sanitize (menghilangkan code code ilegal) untuk mencegah XSS
app.use(xssClean());

//Untuk mengatasi masalah HTTP Parameter polution
// contoh localhost:8000/api/v1/tours?sort=duration&sort=price
app.use(hpp({
    // dan ini adalah yang diijinkan misal localhost:8000/api/v1/tours?duration=5&price=1997
    //maka akan menjalankan keduanya, bukan salah satu query terakhir seperti tanpa HPP
    whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'difficulty', 'maxGroupSize', 'price']
}))


// menggunakan express rate limit sehingga dapat menghindari serangan DOS dengan melimit request dalam satuan waktu
// variabel limiter akan mereturn sebuah middleware
const limiter = rateLimit({
    max: 100,
    windowMs: 60*60*1000, //dalam satu jam tiap ip diberi limit 100
    message: "Too many request from this IP, please try again in 1 hour!" //pesan yang akan dikirim jika melewati batas
})
app.use('/api', limiter); //limit hanya akan berlaku pada request pada API

//serve static file
app.use(express.static(`${__dirname}/public`)); //menjadikan folder public menjadi root

//contoh penggunaan middleware
// app.use((req, res, next) => {
//     console.log("Halo dari middleware");
//     next(); 
// })


//simple middleware untuk mencatat waktu request
app.use((req, res, next) => {
    req.reqTime = new Date().toISOString();
    next();
})


//kode dibawah ini disebut mounting router,
//  karena menggunakan middleware berupa routing pada path tertentu
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter); 
app.use('/api/v1/reviews', reviewRouter);



//middleware dibawah ini digunakan untuk menghandle url yang tidak valid
app.all('*', (req, res, next) => {
    // const err = new Error(`Couldn't find ${req.originalUrl} on this server!`);
    // err.statusCode = 404;
    // err.status = "fail"
    // next(err); //apabila next fungsi next diisikan dengan argument apapun berarti akan dikirim ke middleware error

    const err = new CustomError(`Couldn't processing ${req.originalUrl} on this server!`, 404);
    next(err);
})


// dibawah ini adalah middleware global error handling dimana semua error akan diproses disini
app.use(globalErrorHandler);

module.exports = app;