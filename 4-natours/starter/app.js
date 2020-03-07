const fs = require('fs');
const morgan = require('morgan');
const express = require('express');
const app = express();

const port = 3000;

// #### GLOBAL MIDDLEWARE
// NB : pada middleware harus selalu ada next

//third party middleware
app.use(morgan('dev'));

app.use(express.json());

app.use((req, res, next) => {
    console.log("Halo dari middleware");
    next(); 
})

//simple middleware untuk mencatat waktu request
app.use((req, res, next) => {
    req.reqTime = new Date().toISOString();
    next();
})



// Ini adalah top level code (dieksekusi sekali aja)
const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));


// ### ROUTE HANDLER
//memisahkan route handler
const getAllTours = (req, res) => {
    res.status(200).json({
        status: "success",
        requestedAt: req.reqTime,   //implementasi middleware pada route handler
        result: tours.length,
        data: {
            tours
        }
    })
}

const getTour = (req, res) => {
    console.log(req.params);
    const id = req.params.id * 1; //merubah string params id menjadi number
    const tour = tours.find(el => el.id === id);

    if (!tour) {
        res.status(404).json({
            status: "fail",
            message: "Invalid ID"
        })
    } else {
        res.status(200).json({
            status: "success",
            requestedAt: req.reqTime,   //implementasi middleware pada route handler
            data: {
                tour
            }
        })
    }
}

const createATour = (req, res) => {
    // console.log(req.body);
    // res.send("Done!");

    const newId = tours[tours.length - 1].id + 1;
    const newTour = Object.assign({ id: newId }, req.body);

    tours.push(newTour);
    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
        res.status(201).json({
            status: "success",
            requestedAt: req.reqTime,   //implementasi middleware pada route handler
            data: {
                tours: newTour
            }
        })
    })
}

const updateTour = (req, res) => {
    const tour = tours.find(el => el.id === req.params.id * 1);
    if (!tour) {
        res.status(404).json({
            status: "fail",
            message: "Invalid ID"
        })
    } else {
        res.status(200).json({
            status: "success",
            requestedAt: req.reqTime,   //implementasi middleware pada route handler
            data: {
                tour: "<Updated Tours here.....>"
            }
        })
    }
}

const deleteTour = (req, res) => {
    const tour = tours.find(el => el.id === req.params.id * 1);
    if (tour) {
        res.status(204).json({
            status: 'success',
            requestedAt: req.reqTime,   //implementasi middleware pada route handler
            data: null
        })
    } else {
        res.status(404).json({
            status: 'fail',
            message: 'invalid ID'
        })
    }
}

const getAllUsers = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This API not yet implemented'
    })
}
const createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This API not yet implemented'
    })
}
const getUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This API not yet implemented'
    })
}
const updateUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This API not yet implemented'
    })
}
const deleteUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This API not yet implemented'
    })
}

// ### ROUTER
// app.get('/api/v1/tours', getAllTours)
// app.get('/api/v1/tours/:id', getTour)
// app.post('/api/v1/tours', createATour)
// app.patch('/api/v1/tours/:id', updateTour)
// app.delete('/api/v1/tours/:id', deleteTour)

const tourRouter = express.Router();
const userRouter = express.Router();

tourRouter.route('/')
.get(getAllTours)
.post(createATour);

tourRouter.route('/:id')
.get(getTour)
.patch(updateTour)
.delete(deleteTour);

userRouter.route('/')
.get(getAllUsers)
.post(createUser);

userRouter.route('/:id')
.get(getUser)
.patch(updateUser)
.delete(deleteUser);


app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// ### SERVER START
app.listen(port, () => {
    console.log(`App starting on port ${port}`);
})