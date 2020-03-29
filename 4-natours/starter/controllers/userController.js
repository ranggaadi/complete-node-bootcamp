const catchAsync = require('./../utils/catchAsync');
const User = require('./../models/userModel');
const CustomError = require('./../utils/customError');

const filter = (obj, ...allowedFields) => {
    let newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    })
    return newObj;
}

exports.getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        status: 'success',
        requestedAt: req.reqTime,
        data: {
            users
        }
    })
});

exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This API not yet implemented'
    })
}
exports.getUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This API not yet implemented'
    })
}
exports.updateMe = catchAsync( async(req, res, next) => {
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

exports.updateUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This API not yet implemented'
    })
}
exports.deleteUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This API not yet implemented'
    })
}