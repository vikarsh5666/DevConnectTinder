const validator = require('validator');

const validateSignUpData = (req) => {
    const {firstName, lastName, emailId, password} = req.body;
    if(!firstName || !lastName){
        throw new Error('first Name or Last Name is not provided');
    } else if(firstName.length < 4 || firstName.length >50){
        throw new Error('First name should be grater than 4 and less than 50');
    } else if(!validator.isEmail(emailId)){
        throw new Error('Email Id is not valid');
    } else if(!validator.isStrongPassword(password)){
        throw new Error('PLease enter strong password');
    }
}

const validateAllowedFields =(req) => {
    const allowedFields = ['firstName', 'lastName', 'emailId', 'gender', 'skills', 'age', 'about', 'photoUrl'];
    const isEditAllowedField = Object.keys(req.body).every(field => allowedFields.includes(field));
    return isEditAllowedField;
}

module.exports = {
    validateSignUpData,
    validateAllowedFields
}
