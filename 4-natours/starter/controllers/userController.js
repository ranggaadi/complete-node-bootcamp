const multer = require('multer');
const sharp = require('sharp');
const catchAsync = require('./../utils/catchAsync');
const User = require('./../models/userModel');
const CustomError = require('./../utils/customError');
const factory = require('./controllerFactory');
const { db } = require('./../models/userModel');

//dibawah ini adalah config untuk langsung menyimpan di storage filesystem
// dikomen karena akan melalukan proses resize gambar, sehingga akan lebih baik
//apabila disimpan dalam memory terlebih dahulu daripada read dua kali

// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'public/img/users');
//     },
//     filename: (req, file, cb) => {
//         const ext = file.mimetype.split("/")[1];
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//     }
// })

//dibawah ini adalah config untuk melakukan penyimpanan di memorystorage
//sehingga dapat langsung diproses pada resize
const multerStorage = multer.memoryStorage()

//untuk memfilter bahwa harus bertipe image
const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
        cb(null, true)
    } else {
        cb(new CustomError("Not an valid image!, Please provide a valid image file", 400), false);
    }
}

//untuk multer upload user photo
const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
})

//didalam method single adalah nama form yang memproses gambar
exports.uploadPhotoUser = upload.single('photo')

exports.resizeUserPhoto = catchAsync(async(req, res, next) => {
    if (!req.file) return next() //jika tidak ada field langsung ke middleware selanjutnya

    //tidak perlu menggunakan extension karena pada package sharp akan selalu dikonversi menjadi jpeg
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`

    //karena disimpan dalam memory maka mengaksesnya menggunkan .buffer
    await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg") //dikonversi menjadi .jpeg
    .jpeg({quality: 90}) //kualitas diturunkan 90%
    .toFile(`public/img/users/${req.file.filename}`)

    next();
})

const filter = (obj, ...allowedFields) => {
    let newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    })
    return newObj;
}

exports.updateMe = catchAsync(async (req, res, next) => {

    // 1.) Apabila fields request mengandung password / confirmPassword maka kirim error
    if (req.body.password || req.body.confirmPassword) {
        return next(new CustomError('This route is not for password updates. Please use /update-password instead.', 400));
    }

    // 2.) filter body agar tidak merubah data sensitive seperti role dkk
    filteredBody = filter(req.body, 'name', 'email');
    if (req.file) filteredBody.photo = req.file.filename

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


exports.deleteMe = catchAsync(async (req, res, next) => {
    // apabila terdapat pemanggilan req.user, maka diharuskan login terlebih dahulu, karena req.user dibentuk oleh
    //method protect pada 
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
        status: "success",
        data: null
    })
})

exports.getMe = catchAsync(async (req, res, next) => {
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