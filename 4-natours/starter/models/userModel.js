const mongoose = require('mongoose');
const validator = require('validator');

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
    password:  {
        type: String,
        required: [true, "Please provide a password"],
        minlength: [8, "A password must at least has length of 8"],
        match: [new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.{8,})"), "A password must contain at least 1 uppercase and or 1 lowercase"] //minimal 8 char, dan harus mengandung setidaknya 1 upper dan lower
    },
    confirmPassword: {
        type: String,
        required: [true, "Please confirm your password"],
        validate: {
            validator: function(val) {
                return val === this.password
            },
            message: "the confirmed password must be the same with the password"
        }
    }
})

const User = mongoose.model('User', userSchema);

module.exports = User;