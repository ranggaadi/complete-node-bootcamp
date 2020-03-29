const morgan = require('morgan');
const express = require('express');
const rateLimit = require('express-rate-limit');
const app = express();

const CustomError = require('./utils/customError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

// #### GLOBAL MIDDLEWARE
// NB : pada middleware harus selalu ada next

//third party middleware
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}

// menggunakan express rate limit sehingga dapat menghindari serangan DOS dengan melimit request dalam satuan waktu
// variabel limiter akan mereturn sebuah middleware

const limiter = rateLimit({
    max: 3,
    windowMs: 60*60*1000, //dalam satu jam tiap ip diberi limit 100
    message: "Too many request from this IP, please try again in 1 hour!" //pesan yang akan dikirim jika melewati batas
})

app.use('/api', limiter); //limit hanya akan berlaku pada request pada API

app.use(express.json());

app.use(express.static(`${__dirname}/public`)); //menjadikan folder public menjadi root

app.use((req, res, next) => {
    console.log("Halo dari middleware");
    next(); 
})

//simple middleware untuk mencatat waktu request
app.use((req, res, next) => {
    req.reqTime = new Date().toISOString();
    next();
})


//kode dibawah ini disebut mounting router,
//  karena menggunakan middleware berupa routing pada path tertentu
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter); 



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