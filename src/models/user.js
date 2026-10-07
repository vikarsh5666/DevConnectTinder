const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
    firstName: {
        type: String,
        required: true,
        minLength: 4,
        maxLength: 50
    },
    lastName: {
        type: String,
        minLength: 4,
        maxLength: 50
    },
    emailId: {
        type: String,
        required: true,
        trim: true,
        uniquue: true,
        lowercase: true,
        validate(value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(value)) {
                throw new Error('Email ID is not valid');
            }
        }
    },
    age: {
        type: Number,
        min: 18
    },
    password: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        validate(value) {
            if (!['male', 'female', 'others'].includes(value)) {
                throw new Error('Gender is not valid');
            }
        }
    },
    skills: {
        type: [String]
    },
    about: {
        type: String,
        default: 'This is default about of user',
    },
    photoUrl: {
        type: String,
        default: 'https://www.citypng.com/public/uploads/preview/profile-user-round-black-icon-symbol-hd-png-701751695033512ycgy0udtoj.png'
    }
},
{
    timestamps: true,
})

module.exports = mongoose.model('User', userSchema);