const mongoose = require("mongoose");
const validator = require('validator');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
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
        unique: true,
        lowercase: true,
        validate(value) {
            if(!validator.isEmail(value)){
                throw new Error('Invalid Email: ' + value)
            };
        }
    },
    age: {
        type: Number,
        min: 18
    },
    password: {
        type: String,
        required: true,
        validate(value) {
            if(!validator.isStrongPassword(value)){
                throw new Error('Password must be Strong: ' + value)
            };
        }
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
        default: 'https://www.citypng.com/public/uploads/preview/profile-user-round-black-icon-symbol-hd-png-701751695033512ycgy0udtoj.png',
        validate(value) {
            if(!validator.isURL(value)){
                throw new Error('Invalid Photo URl: '+ value)
            };
        }
    }
},
{
    timestamps: true,
});

userSchema.methods.getJWT = async function() {
    const user = this;
    const token =  await jwt.sign({ _id: user._id }, "Dev@ConnectTinder", { expiresIn: "7d" });
    return token;
};

userSchema.methods.validatePassword = async function(passwordInputByUser) {
    const user  = this;
    const passwordHash = user.password;
    const isValidPassword = await bcrypt.compare(passwordInputByUser, passwordHash)
    return isValidPassword;
}
module.exports = mongoose.model('User', userSchema);