const catchAsync = require('./../utils/catchAsync');
const User = require('./../models/userModel');


exports.getAllUsers = catchAsync(async(req, res, next) => {
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