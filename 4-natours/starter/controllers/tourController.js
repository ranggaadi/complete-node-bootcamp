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
        res.status(404).json({
            status: "fail",
            requestedAt: req.reqTime,
            message: `Couldn't find tours with id: ${req.params.id}`
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


exports.getTourStats = async (req, res) => {
    try {
        const stats = await Tour.aggregate([
            {
                //OUTER QUERY (pada SUBQUERY)
                $match: { ratingsAverage: { $gte: 4.5 } }   //akan memilih data dimana ratingsQuantity >= 50
            },
            {
                $group: {
                    //nama tabel harus didahului oleh $
                    // _id: "$difficulty", //tampilan akan di grup berdasarkan value dari tabel ini
                    _id: { $toUpper: "$difficulty" }, //tampilan akan di grup berdasarkan value dari tabel ini
                    numData: { $sum: 1 }, //akan menghitung data pada setiap data
                    numRating: { $sum: "$ratingsQuantity" },
                    avgRating: { $avg: "$ratingsAverage" },
                    avgPrice: { $avg: "$price" },
                    minPrice: { $min: "$price" },
                    maxPrice: { $max: "$price" }
                }
            },
            {
                $sort: { maxPrice: -1, avgRating: -1 }
            },
            // {
            //     //ini adalah Inner query ( pada Subquery)
            //     $match: {avgPrice: {$gte: 1500}, _id: {$ne: "DIFFICULT"}} //ne adalah not equal, dan table yang digunakan adalah
            //     //tabel pada agregasi groupby
            // }
        ])

        res.status(200).json({
            status: "success",
            requestedAt: req.reqTime,
            results: stats.length,
            data: stats
        })
    } catch (err) {
        res.status(404).json({
            status: "fail",
            message: err.message
        })
    }
}

exports.getMonthlyPlan = async (req, res) => {
    try {
        const year = req.params.year * 1;

        const plan = await Tour.aggregate([
            {
                $unwind: '$startDates'
            },
            {
                $match: {
                    startDates: { 
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`)}
                }
            },
            {
                $group: {
                    _id: {$month: '$startDates'},
                    countOfTour: {$sum: 1},
                    tour: {$push: '$name'}
                }
            },
            {
                $sort: {countOfTour: -1} //urutakn countOfTour secara descending
            },
            {
                $addFields: {month: "$_id"} //menambah field baru dengan nama month dengan nilai sama dengan _id
            },
            {
                $project: {_id: 0} //menghilangkan kolom id 0 = hilang,1= tampil
            },{
                $limit: 1 //limit tampilan
            }
            // {
            //     $group: {
            //         _id: null,
            //         busiestMonth: {$max: "$countOfTour"}
            //     }
            // }
        ])

        res.status(200).json({
            status: "success",
            requestedAt: req.reqTime,
            size: plan.length,
            plan
        })
    } catch (err) {
        res.status(404).json({
            status: "fail",
            message: err.message
        })
    }
}

// exports.checkTop5Tour = (req, res, next) => {
//     try {
//         if (req.url == '/top-5-tours') {
//             req.query = { limit: 5, sort: '-ratingsAverage,price' };
//         }
//         next();
//     } catch (err) {
//         res.status(404).json({
//             status: "fail",
//             message: err.message
//         })
//     }
// }

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