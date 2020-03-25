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
        validate: {
            validator: function(val) {
                return val.includes(/^(?=.*[A-Za-z])(?=.{8,})/);
            },
            message: "A password should contains at l uppercase or 1 lowecase alhabetical character"
        },
        minlength: 8,

    },
    confirmPassword: {
        type: String,
        required: [true, "Please confirm your password"]
    }
})

const User = mongoose.model('User', userSchema);

module.exports = User;