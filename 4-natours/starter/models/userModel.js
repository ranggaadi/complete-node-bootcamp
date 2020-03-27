const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please tell us your name!"],
        maxlength: 50,
        minlength: 1,
        trim: true,
    },
    email: {
        type: String,
        required: [true, "Please provide your email"],
        unique: true,
        trim: true,
        lowercase: true, //akan merubah semua yang dimasukan menjadi kecil
        validate: [validator.isEmail, "Please provide a valid email"]
    },
    photo: String,
    role: {
        type: String,
        default: "user",
        enum: {
            values: ['user', 'guide', 'lead-guide', 'admin'],
            message: "role is either: user, guide, lead-guide or admin"
        },
        select: false
    },
    password: {
        type: String,
        required: [true, "Please provide a password"],
        minlength: [8, "A password must at least has length of 8"],

        //minimal 8 char, dan harus mengandung setidaknya 1 upper dan lower
        match: [new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.{8,})"), "A password must contain at least 1 uppercase and or 1 lowercase"],
        select: false //agar tidak terlihat saat di select
    },
    confirmPassword: {
        type: String,
        required: [true, "Please confirm your password"],
        //ingat : validate hanya berfungsi ketika fungsi .create() atau .save()
        validate: {
            validator: function (val) {
                return val === this.password
            },
            message: "the confirmed password must be the same with the password"
        }
    },
    passwordChangedAt: {
        type: Date,
        default: Date.now()
    },
    passwordResetToken: {
        type: String,
        select: false
    },
    passwordResetExpire: {
        type: Date,
        select: false
    }
})

//middleware berjalan sebelum data disave ke database (digunakan untuk hashing password)
userSchema.pre('save', async function (next) {
    //jika bagian dari password tidak dimodifikasi, maka fungsi tidak akan dijalankan
    if (!this.isModified('password')) return next();

    //mengsalt dan menggenerate password yang sudah di hashing dan disimpan kembali ke password
    //angka 12 adalah cost, dimana semakin besar semakin baik, namun juga meningkatkan intensivitas CPU
    this.password = await bcrypt.hash(this.password, 12);

    //digunakan untuk mengilangkan field sebelum disimpan ke database.
    this.confirmPassword = undefined;
    next();
})

//instanced schema, sehingga fungsi yang dibuat bisa dipanggil dari hasil instansiasi userSchema
//candidatePassword = password yang akan dicek
//userPassword = password yang di hash
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword) //mereturn boolean password benar apa salah
}

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
    if (this.passwordChangedAt) {
        const changedTime = this.passwordChangedAt.getTime() / 1000;
        return changedTime > JWTTimeStamp;
    }

    return false;
}

userSchema.methods.generateResetPasswordToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex');

    //karena pada passwordResetToken dan passwordResetExpire hanya mengupdate maka di tempat pemanggilan method ini 
    // harus disertai dengan "await <hasil schema user>.save()"
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpire = Date.now() + 1 * 60 * 60 * 1000 //kadaluarsa dalam 1 jam

    console.log({resetToken}, this.passwordResetToken);
    

    return resetToken;
}
const User = mongoose.model('User', userSchema);

module.exports = User;