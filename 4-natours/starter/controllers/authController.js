const {promisify} = require('util'); //destructuring, ambil fungsi promisify aja
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
        confirmPassword: req.body.confirmPassword,
        photo: req.body.photo,
        passwordChangedAt: req.body.passwordChangedAt,
        role: req.body.role
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

exports.forgotPassword =catchAsync(async (req, res, next) => {
    // 1.) get user email based on POSTed email and check if its exist
    const user = await User.findOne({email: req.body.email})
        // .select('+passwordResetToken', '+passwordResetExpire');
    
    console.log(user);

    if(!user){
        return next(new CustomError('There is no user with email address.', 404));
    }

    // 2.) Generate random reset token
    const resetToken = user.generateResetPasswordToken();
    await user.save({validateBeforeSave: false}); //karena pada method generateResetPasswordToken() hanya mengupdate (passwordResetToken dan passwordResetExpire)
    //maka perlu dilakukan save dengan option tidak memvalidasi ulang karena pada schema ada beberapa variabel yang required

    // 3.) Send it to user email
});

exports.resetPassword = (req, res, next) => {
    //kode disini
}

exports.protect = catchAsync(async (req, res, next) => {
    let token;

    // 1.) dapatkan token, dan cek apakah token tersebut ada
    //untuk mendapatkannya dapat didapat di request header dengan ketentuan umum pada attrib Authorization: Bearer {token}
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        token = req.headers.authorization.split(' ')[1]; //melepas "Bearer" dan mengambil tokennya saja
    }

    if(!token){ //jika ternyata token tidak ada maka akan mereturn error
        return next(new CustomError("You're not yet logged in!, Please login first", 401));
    }


    // 2.) verifikasi token

    // jwt.verify(token, process.env.JWT_SECRET); karena valuenya dilakukan melalui callback maka dipromisify aja
    const decodedJWT = await promisify(jwt.verify)(token, process.env.JWT_SECRET); //promisify mereturn promise jadi di await
  
    // 3.) periksa apakah user masih ada
    const currentUser = await User.findById(decodedJWT.id).select('+role');
    if(!currentUser){
        return next(new CustomError('The user belonging to this token does no longer exist', 401));
    }

    // 4.) periksa apakah user merubah passwordnya setelah token diproses / dibuat
    if(currentUser.changedPasswordAfter(decodedJWT.iat)){
        return next(new CustomError('User recently changed password!, please login again.', 401));
    }

    req.user = currentUser //disimpan disini siapa tau dibutuhkan (akan dioper ke restrictTo middleware), 
    //(dioper / disimpan ke req.user)

    //Jika semua kasus terlewati maka Ijinkan masuk ke getAllTour
    next();
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {

        if(!roles.includes(req.user.role)){
            return next(new CustomError("You don't have permission to perform this action", 403));
        }

        next();
    }
} 