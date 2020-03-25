const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const CustomError = require('./../utils/customError');


const signToken = id => {
    // return jwt.sign({ id: id}, process.env.JWT_SECRET, {
    //     expiresIn: process.env.JWT_EXPIRE_TIME
    // })
    
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE_TIME
    })
}

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword
    });

    const token = signToken(newUser._id);

    res.status(201).json({
        status: "success",
        token,
        requestedAt: req.reqTime,
        data: {
            user: newUser
        }
    })
})

exports.login = catchAsync(async (req, res, next) => {
    // ### pada kasus ini akan mencoba login menggunakan email dan password

    const { email, password } = req.body

    // 1.) check apakah email dan password diisi / ada
    if (!email || !password) {
        return next(new CustomError("Please provide valid email and password", 400));
    }

    // 2.) check apakah user ada dan password yang diisikan benar adanya

    //karena password di schema di false, maka untuk mendapatkannya kembali harus diberi + didepannya ketika dipanggil dengan 
    //select
    const user = await User.findOne({ email }).select('+password');

    //tidak diassign ke variabel namun langsung di taruh di if statement adalah karena nanti apabila variabel user kosong
    //maka akan terjadi error lagi dan method correct password tidak bisa digunakan
    //###
    // const correct = await user.correctPassword(password, user.password);

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new CustomError("Incorrect email or password", 401))
    }


    //bisa juga menggunakan cara dibawah ini
    // const user = (await User.findOne({email: email}).select('+password'));

    // 3.) kirim respon dan JWT kembali ke klien apabila berhasil
    const token = signToken(user._id);
    res.status(200).json({
        status: "success",
        token
    })
})