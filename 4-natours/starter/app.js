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
    res.status(404).json({
        status: "fail",
        requestedAt: req.reqTime,
        message: `Couldn't find ${req.originalUrl} on this server!`
    })
})

module.exports = app;