const fs = require('fs');

// Ini adalah top level code (dieksekusi sekali aja)
const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

// Middleware param untuk mengecek valid tidaknya ID
exports.checkID = (req, res, next, val) => {
    console.log(`request id bernilai ${val}`);
    const id = val * 1; //merubah string params id menjadi number
    const tour = tours.find(el => el.id === id);

    if (!tour) {
        return res.status(404).json({
            status: "fail",
            message: "Invalid ID"
        })
    }
    next();
}


// ### ROUTE HANDLER
//memisahkan route handler
exports.getAllTours = (req, res) => {
    res.status(200).json({
        status: "success",
        requestedAt: req.reqTime,   //implementasi middleware pada route handler
        result: tours.length,
        data: {
            tours
        }
    })
}

exports.getTour = (req, res) => {
    // console.log(req.params);
    const id = req.params.id * 1; //merubah string params id menjadi number
    const tour = tours.find(el => el.id === id);

    res.status(200).json({
        status: "success",
        requestedAt: req.reqTime,   //implementasi middleware pada route handler
        data: {
            tour
        }
    })
}

exports.createATour = (req, res) => {
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

exports.updateTour = (req, res) => {
    const tour = tours.find(el => el.id === req.params.id * 1);

    res.status(200).json({
        status: "success",
        requestedAt: req.reqTime,   //implementasi middleware pada route handler
        data: {
            tour: "<Updated Tours here.....>"
        }
    })
}

exports.deleteTour = (req, res) => {
    const tour = tours.find(el => el.id === req.params.id * 1);

    res.status(204).json({
        status: 'success',
        requestedAt: req.reqTime,
        data: null
    })
}