const { promisify } = require('util'); //destructuring, ambil fungsi promisify aja
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const CustomError = require('./../utils/customError');
const sendEmail = require('./../utils/email');
const crypto = require('crypto');

const signToken = id => {
    // return jwt.sign({ id: id}, process.env.JWT_SECRET, {
    //     expiresIn: process.env.JWT_EXPIRE_TIME
    // })

    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE_TIME
    })
}

const createSendToken = (user, statusCode, res, req) => {
    const token = signToken(user._id);

    let cookieOption = {
        httpOnly: true,
        expires: new Date(Date.now()+process.env.JWT_COOKIE_EXPIRE*24*60*60*1000) //diubah menjadi ms
    }

    //opsi secure hanya diterapkan ketika production, karena hanya akan berjalan pada protocol https
    if(process.env.NODE_ENV === 'production') cookieOption.secure = true

    res.cookie('jwt', token, cookieOption);


    //menghilangkan field field sensitive
    user.password = undefined;
    
    res.status(statusCode).json({
        status: "success",
        token,
        requestedAt: req.reqTime,
        data: {
            user
        }
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

    createSendToken(newUser, 201, res, req);
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
    createSendToken(user, 200, res, req);
})

exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1.) get user email based on POSTed email and check if its exist
    const user = await User.findOne({ email: req.body.email })
    // .select('+passwordResetToken +passwordResetExpire');

    console.log(user);

    if (!user) {
        return next(new CustomError('There is no user with email address.', 404));
    }

    // 2.) Generate random reset token
    const resetToken = user.generateResetPasswordToken();
    await user.save({ validateBeforeSave: false }); //karena pada method generateResetPasswordToken() hanya mengupdate (passwordResetToken dan passwordResetExpire)
    //maka perlu dilakukan save dengan option tidak memvalidasi ulang karena pada schema ada beberapa variabel yang required

    // 3.) Send it to user email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/reset-password/${resetToken}`;

    const message = `Forgot your password? then simply submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

    const options = {
        email: user.email,
        message,
        subject: "Your password reset token (valid in 1 hour)"
    }

    try {
        await sendEmail(options);

        res.status(200).json({
            status: "success",
            message: "Email for resetting password sended!"
        })
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new CustomError('There was an error while sending an email, Please try again later', 500));
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    //1.) dapatkan user berdasarkan token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpire: { $gt: Date.now() } });

    //2.) jika token tidak kadaluarsa (waktunya), dan ada user benar benar ada, maka set password baru
    if (!user) {
        return next(new CustomError("Token is invalid or already expired!", 400));
    }

    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save(); //pada kasus ini kita perlu validator

    //3.) Update changedPasswordAt (melalui middleware mongobd pre save)

    //4.) Log in user, kirim JWT
    createSendToken(user, 200, res, req);
})

//middleware ini digunakan untuk mengupdate password dengan memasukan password lama
exports.updatePassword = catchAsync( async(req, res, next) => {
    
    // 1.) dapatkan user dari collection
    const user = await User.findById(req.user._id).select("+password");

    // 2.) check apakah user saat ini benar memasukan password
    if (!await user.correctPassword(req.body.oldPassword, user.password)) {
        return next(new CustomError("The current password is incorrect", 401));
    }

    // 3.) jika benar adanya maka update password
    user.password = req.body.newPassword;
    user.confirmPassword = req.body.confirmPassword;
    await user.save(); //tetep divalidasi


    // 4.) logged in user, kirim respon jwt
    createSendToken(user, 200, res, req);
});

exports.protect = catchAsync(async (req, res, next) => {
    let token;

    // 1.) dapatkan token, dan cek apakah token tersebut ada
    //untuk mendapatkannya dapat didapat di request header dengan ketentuan umum pada attrib Authorization: Bearer {token}
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(' ')[1]; //melepas "Bearer" dan mengambil tokennya saja
    }

    if (!token) { //jika ternyata token tidak ada maka akan mereturn error
        return next(new CustomError("You're not yet logged in!, Please login first", 401));
    }


    // 2.) verifikasi token

    // jwt.verify(token, process.env.JWT_SECRET); karena valuenya dilakukan melalui callback maka dipromisify aja
    const decodedJWT = await promisify(jwt.verify)(token, process.env.JWT_SECRET); //promisify mereturn promise jadi di await

    // 3.) periksa apakah user masih ada
    const currentUser = await User.findById(decodedJWT.id).select('+role'); //memilih role agar bisa dioper ke restrictTo
    if (!currentUser) {
        return next(new CustomError('The user belonging to this token does no longer exist', 401));
    }

    // 4.) periksa apakah user merubah passwordnya setelah token diproses / dibuat
    if (currentUser.changedPasswordAfter(decodedJWT.iat)) {
        return next(new CustomError('User recently changed password!, please login again.', 401));
    }

    req.user = currentUser //disimpan disini siapa tau dibutuhkan (akan dioper ke restrictTo middleware), 
    //(dioper / disimpan ke req.user)

    //Jika semua kasus terlewati maka Ijinkan masuk ke getAllTour
    next();
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {

        if (!roles.includes(req.user.role)) {
            return next(new CustomError("You don't have permission to perform this action", 403));
        }

        next();
    }
} 