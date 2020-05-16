const Tour = require('./../models/tourModel');
const APIfeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const CustomError = require('./../utils/customError');
const factory = require('./controllerFactory');

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

exports.getToursWithin = catchAsync( async (req, res, next) => {
    const {distance, latlng, unit} = req.params;
    const [lat, lng] = latlng.split(',');

    //perlu diubah menjadi radians dengan membaginya dengan radius dari bumi
    //ternary pertama apabila dalam satuan mile dan kedua dalam satuan km
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    if(!lat || !lng){
        return next(new CustomError('please provide latitude and longitude', 400));
    }

    //menggunakan geospatial operator geoWithin
    const tours = await Tour.find({startLocation: {$geoWithin: {$centerSphere: [[lng, lat], radius]} }});

    // console.log(distance, lat, lng, unit);
    res.status(200).json({
        status: "success",
        results: tours.length,
        data: {
            data: tours
        }
    })
})

exports.getDistances = catchAsync(async(req, res, next) => {
    const {latlng, unit} = req.params;
    const [lat, lng] = latlng.split(',');

    //karena distances ditampilkan dalam satuan meter maka perlu dibuat multiplier untuk convert
    //yang pertama adalah mile satunya adalah meter
    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

    if(!lat || !lng){
        return next(new CustomError('please provide latitude and longitude', 400));
    }

    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1] //dikali 1 agar auto convert jadi nummerik
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier //dibagi dengan 1000 karena diubah menjadi KM yang sebelumnya m
            }
        },
        {
            $project: {
                distance: 1,
                name: 1
            }
        }
    ])

    res.status(200).json({
        status: "success",
        data: {
            data: distances
        }
    })
})


//menggunakan handler factory (controllerFactory) agar lebih rapi

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, {path: "reviews"});
exports.createATour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);

//delete single tour dirubah menjadi dengan menggunakan controllerFactory
exports.deleteTour = factory.deleteOne(Tour);

// exports.updateTour = catchAsync(async (req, res, next) => {
//     let flag = true;
//     const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//         new: true, //akan mereturn yang telah diupdate
//         runValidators: true //akan melalukan pengecekan lagi sesuai schema,
//     }, (err) => {
//         if (err) {
//             if (err.name == "ValidationError") {
//                 flag = false;
//                 return next(err)
//             }
//         }
//     });

//     if (flag) {
//         if (!tour.length) {
//             return next(new CustomError(`Tour with id: ${req.params.id} doesn't exist`, 404));
//         }

//         res.status(200).json({
//             status: "success",
//             requestedAt: req.reqTime,
//             data: {
//                 tour
//             }
//         })
//     }
// })



// exports.deleteTour = catchAsync(async (req, res, next) => {
//     let flag = undefined
//     let tour = await Tour.findByIdAndDelete(req.params.id, (err, val) => {
//         if (val) flag = val;
//     });

//     tour = flag;

//     if (!tour) {
//         return next(new CustomError(`Tour with id: ${req.params.id} doesn't exist`, 404));
//     }

//     res.status(204).json({
//         status: "success",
//         requestedAt: req.reqTime,
//         data: null
//     });
// })


exports.getTourStats = catchAsync(async (req, res, next) => {

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
})

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {

    const year = req.params.year * 1;

    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates'
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                countOfTour: { $sum: 1 },
                tour: { $push: '$name' }
            }
        },
        {
            $sort: { countOfTour: -1 } //urutakn countOfTour secara descending
        },
        {
            $addFields: { month: "$_id" } //menambah field baru dengan nama month dengan nilai sama dengan _id
        },
        {
            $project: { _id: 0 } //menghilangkan kolom id 0 = hilang,1= tampil
        }, {
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
})

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