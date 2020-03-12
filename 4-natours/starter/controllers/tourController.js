const Tour = require('./../models/tourModel');

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

exports.createATour = async (req, res) => {
    try {
        // const newTour = new Tour({})
        // newTour.save()

        const newTour = await Tour.create(req.body);
        
        res.status(201).json({
            status: "success",
            requestedAt: req.reqTime,
            data: {
                tour: newTour
            }
        });
    } catch(err) {
        res.status(400).json({
            status: "fail",
            requestedAt: req.reqTime,
            message: "Invalid input sent!"
        })
    }
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