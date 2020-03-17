const Tour = require('./../models/tourModel');
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

        // 1a. Simple Filtering
        // console.log(req.query);
        const queryObj = {...req.query} //mengcopy isi dari req.query
        const exclude = ['limit', 'sort', 'page', 'fields'];
        exclude.forEach(el => delete queryObj[el]); //menghapus seua property yang ada di exclude
        // console.log(queryObj);

        // 1b. Advanced Filtering
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`); //mereplace gt/gte dkk menjadi $gt / $gte dkk
        filteredQuery = JSON.parse(queryStr);




        let query = Tour.find(filteredQuery); //ini akan mereturn query sehingga dapat di chain



        
        // 2.SORT FUNCTION
        console.log(req.query);
        if(req.query.sort){
            const sortQuery = req.query.sort.split(',').join(' '); //memisahkan dua kondisi sort yang berbeda
            // console.log(sortQuery);
            query = query.sort(sortQuery); //sort dengan dua kondisi pada mongoose seperti (sort 1 sort2) dipisahkan dengan spasi
        }else{
            query = query.sort('-createdAt') //secara default akan mengurutkan dari yang terbaru.
            //apabila fungsi sort terdapat minus berarti secara descending
        }




        //3 Field Limiting / SELECT / Projection
        // console.log(req.query);

        if(req.query.fields){
            const project = req.query.fields.split(',').join(' ');
            // console.log(project);
            query = query.select(project);
        }else{
            query = query.select('-__v'); //tanda minus pada select() berarti tidak akan ditampilkan
        }


        //4.Pagination skip() dan limit
        const page = req.query.page * 1 || 1;
        const limit = req.query.limit * 1 || 10;
        const skip = (page-1)*limit;

        query = query.skip(skip).limit(limit);

        if(req.query.page){
            const numOfData = await Tour.estimatedDocumentCount(); //menghitung banyaknya document
            if(skip >= numOfData) throw new Error("This page doesn't exist");
            //apabila nantinya page melebihi banyaknya data maka nanti akan di throw sebuah error.
        }

        
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
    }catch (err) {
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
    } catch(err) {
        res.status(400).json({
            status: "fail",
            requestedAt: req.reqTime,
            message: err.message
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
    }catch (err) {
        res.status(404).json({
            status: "fail",
            requestedAt: req.reqTime,
            message: err.message
        })
    }
}

exports.checkTop5Tour =  (req, res, next) => {
    try{
        if(req.url == '/top-5-tours'){
            req.query = {limit: 5, sort: '-ratingsAverage,price'};
        }
        next();
    }catch(err){
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