const Tour = require('./../models/tourModel');
// const fs = require('fs');

// // top level code untuk meng json kan file tours-simple.json
// const data = fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, 'utf-8');
// const dataJson = JSON.parse(data);
// dataJson.forEach(el => delete el.id); //untuk menghapus property id pada json


// ### ROUTE HANDLER
//memisahkan route handler
exports.getAllTours = async (req, res) => {
    try {

        // 1. Simple Filtering
        // console.log(req.query);
        const queryObj = {...req.query} //mengcopy isi dari req.query
        const exclude = ['limit', 'sort', 'page', 'fields'];
        exclude.forEach(el => delete queryObj[el]); //menghapus seua property yang ada di exclude
        console.log(queryObj);


        // 2. Advanced Filtering
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`);
        filteredQuery = JSON.parse(queryStr);

        const query = Tour.find(filteredQuery);
        
        // const tours = await Tour.find();
        const tours =  await query; //tidak menggunakan await karena nantinya query akan dichaining sehingga harus dipisah

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