const morgan = require('morgan');
const express = require('express');
const app = express();

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

// #### GLOBAL MIDDLEWARE
// NB : pada middleware harus selalu ada next

//third party middleware
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}

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
    const err = new Error(`Couldn't find ${req.originalUrl} on this server!`);
    err.statusCode = 404;
    err.status = "fail"
    next(err); //apabila next fungsi next diisikan dengan argument apapun berarti akan dikirim ke middleware error
})


// dibawah ini adalah middleware global error handling 
app.use((err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    res.status(err.statusCode).json({
        status: err.status,
        requestedAt: req.requestedAt,
        message: err.message
    });
})

module.exports = app;