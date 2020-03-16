const Tour = require('./../models/tourModel');

// ### ROUTE HANDLER
//memisahkan route handler
exports.getAllTours = async (req, res) => {
    try {
        const tours = await Tour.find();

        res.status(200).json({
            status: "success",
            requestedAt: req.reqTime,
            results: tours.length,
            data: {
                tours
            }
        })
    } catch (err) {
        res.status(400).json({
            status: "fail",
            requestedAt: req.reqTime,
            message: err
        })
    }
}

exports.getTour = async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id);

        res.status(200).json({
            status: "success",
            requestedAt: req.reqTime,
            results: tour.length,
            data: {
                tour
            }
        })
    }catch (err) {
        res.status(400).json({
            status: "fail",
            requestedAt: req.reqTime,
            message: err
        })
    }
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
            message: err
        })
    }
}

exports.updateTour = async (req, res) => {
    try{
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true, //akan mereturn yang telah diupdate
            runValidators: true //akan melalukan pengecekan lagi sesuai schema
        });

        res.status(200).json({
            status: "success",
            requestedAt: req.reqTime,
            data: {
                tour
            }
        })
    }catch (err) {
        res.status(400).json({
            status: "fail",
            requestedAt: req.reqTime,
            message: err
        })
    }
}


exports.deleteTour = async (req, res) => {
    try {
        await Tour.findByIdAndDelete(req.params.id);

        res.status(204).json({
            status: "success",
            requestedAt: req.reqTime,
            data: null
        });
    }catch (err) {
        res.status(404).json({
            status: "fail",
            requestedAt: req.reqTime,
            message: err
        })
    }
}