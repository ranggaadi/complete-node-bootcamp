const Tour = require('./../models/tourModel');
const APIfeatures = require('./../utils/apiFeatures');
// const fs = require('fs');

// // top level code untuk meng json kan file tours-simple.json
// const data = fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, 'utf-8');
// const dataJson = JSON.parse(data);
// dataJson.forEach(el => delete el.id); //untuk menghapus property id pada json


// ### ROUTE HANDLER
//memisahkan route handler
exports.alias = (req, res, next) => {
    //akan mengeset query request sebelum di querykan ke fungsi getAllTours
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,duration,difficulty,price,ratingsAverage,summary';
    next();
}


exports.getAllTours = async (req, res) => {
    try {

        // const tours = await Tour.find();
        const feature = new APIfeatures(Tour.find(), req.query)
            .filter()
            .sort()
            .project()   //sama seperti select pada db
            .paginate();

        const tours = await feature.query; //tidak menggunakan await karena nantinya query akan dichaining sehingga harus dipisah

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
            message: err.message
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
    } catch (err) {
        res.status(400).json({
            status: "fail",
            requestedAt: req.reqTime,
            message: err.message
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
    } catch (err) {
        res.status(400).json({
            status: "fail",
            requestedAt: req.reqTime,
            message: err.message
        })
    }
}

exports.updateTour = async (req, res) => {
    try {
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
    } catch (err) {
        res.status(400).json({
            status: "fail",
            requestedAt: req.reqTime,
            message: err.message
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
    } catch (err) {
        res.status(404).json({
            status: "fail",
            requestedAt: req.reqTime,
            message: err.message
        })
    }
}

exports.checkTop5Tour = (req, res, next) => {
    try {
        if (req.url == '/top-5-tours') {
            req.query = { limit: 5, sort: '-ratingsAverage,price' };
        }
        next();
    } catch (err) {
        res.status(404).json({
            status: "fail",
            message: err.message
        })
    }
}

// exports.deleteAllTour = async (req, res, next) => { //digunakan untuk menghapus semua data
//     try {
//         await Tour.deleteMany({});

//         res.status(204).json({
//             status: "success",
//             requestedAt: req.reqTime,
//             data: null
//         });
//     }catch(err) {
//         res.status(404).json({
//             status: "fail",
//             requestedAt: req.reqTime,
//             message: err
//         })
//     }
//     next();
// }

// exports.importAllTour = async (req, res) => {  //digunakan untuk menginsert semua data dari tours-simple.json.
//     try {
//         const allTour = Tour.insertMany(dataJson);

//         res.status(200).json({
//             status: 'success',
//             requestedAt: req.reqTime,
//             data: allTour
//         })
//     }catch (err) {
//         res.status(404).json({
//             status: "fail",
//             message: err
//         })
//     }
// }