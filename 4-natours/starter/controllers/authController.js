const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');

exports.signup = catchAsync(async (req, res, next)=> {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword
    });

    const token = jwt.sign({id: newUser._id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE_TIME
    })

    res.status(201).json({
        status: "success",
        token,
        requestedAt: req.reqTime,
        data: {
            user: newUser
        }
    })
})