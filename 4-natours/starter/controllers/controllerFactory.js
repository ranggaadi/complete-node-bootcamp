const catchAsync = require('./../utils/catchAsync');
const CustomError = require('./../utils/customError');
const APIfeatures = require('./../utils/apiFeatures');

// exports.deleteOne = Model => catchAsync(async (req, res, next) => {
//     let flag = undefined
//     let tour = await Model.findByIdAndDelete(req.params.id, (err, val) => {
//         if (val) flag = val;
//     });

//     tour = flag;

//     if (!tour) {
//         return next(new CustomError(`No found with that id of: ${req.params.id}`, 404));
//     }

//     res.status(204).json({
//         status: "success",
//         requestedAt: req.reqTime,
//         data: null
//     });
// });

exports.deleteOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
        return next(new CustomError('No found with that id', 404));
    }

    res.status(204).json({
        status: "success",
        requestedAt: req.reqTime,
        data: null
    })
})

exports.createOne = Model => catchAsync(async (req, res, next) => {
    // const newTour = new Tour({})
    // newTour.save()

    const doc = await Model.create(req.body);

    res.status(201).json({
        status: "success",
        requestedAt: req.reqTime,
        data: {
            data: doc
        }
    });
});

exports.updateOne = Model => catchAsync(async (req,res,next)=> {
    const doc = await Model.findByIdAndUpdate(req.params.id,  req.body, {
        new: true,
        runValidation: true
    });

    if(!doc) {
        return next(new CustomError("No document found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        data: {
            data: doc
        }
    })
})

exports.getOne = (Model, populateOptions) => catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if(populateOptions){
        query = query.populate(populateOptions);
    }
    const doc = await query;

    if(!doc){
        return next(new CustomError("No document found with that ID", 404))
    }

    res.status(200).json({
        status: "success",
        data: {
            data: doc
        }
    })
})

exports.getAll = Model => catchAsync(async (req, res, next) => {

    //to allow nested getAll on review to GET review on tour
    let filter = {}
    if(req.params.tourId) filter = {tour: req.params.tourId};

    // const tours = await Tour.find();
    const feature = new APIfeatures(Model.find(filter), req.query)
        .filter()
        .sort()
        .project()   //sama seperti select pada db
        .paginate();

    const doc = await feature.query; //tidak menggunakan await karena nantinya query akan dichaining sehingga harus dipisah

    res.status(200).json({
        status: "success",
        requestedAt: req.reqTime,
        results: doc.length,
        data: {
            data: doc
        }
    })
})