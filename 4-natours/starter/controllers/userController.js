const multer = require('multer');
const catchAsync = require('./../utils/catchAsync');
const User = require('./../models/userModel');
const CustomError = require('./../utils/customError');
const factory = require('./controllerFactory');
const { db } = require('./../models/userModel');

const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/img/users');
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split("/")[1];
        cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
    }
})

//untuk memfilter bahwa harus bertipe image
const multerFilter = (req, file, cb) => {
    if(file.mimetype.startsWith("image")){
        cb(null, true)
    }else{
        cb(new CustomError("Not an valid image!, Please provide a valid image file", 400), false);
    }
}

//untuk multer upload user photo
const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
})

exports.uploadPhotoUser = upload.single('photo')

const filter = (obj, ...allowedFields) => {
    let newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    })
    return newObj;
}

exports.updateMe = catchAsync( async(req, res, next) => {
    console.log(req.file)
    console.log(req.body)

    // 1.) Apabila fields request mengandung password / confirmPassword maka kirim error
    if (req.body.password || req.body.confirmPassword) {
        return next(new CustomError('This route is not for password updates. Please use /update-password instead.', 400));
    }
    
    // 2.) filter body agar tidak merubah data sensitive seperti role dkk
    filteredBody = filter(req.body, 'name', 'email');
    
    // 3.) update data user
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true, runValidators: true
    });
    
    res.status(200).json({
        status: "success",
        requestedAt: req.reqTime,
        data: {
            user: updatedUser
        }
    })
});


exports.deleteMe = catchAsync(async(req, res, next)=> {
    // apabila terdapat pemanggilan req.user, maka diharuskan login terlebih dahulu, karena req.user dibentuk oleh
    //method protect pada 
    await User.findByIdAndUpdate(req.user.id, {active: false});
    
    res.status(204).json({
        status: "success",
        data: null
    })
})

exports.getMe = catchAsync(async(req, res, next) => {
    req.params.id = req.user.id;
    next();
})

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);

//do not update password using this updateReview;
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);

// exports.deleteUser = (req, res) => {
    //     res.status(500).json({
        //         status: 'error',
        //         message: 'This API not yet implemented'
        //     })
        // }