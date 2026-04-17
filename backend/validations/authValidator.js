const Joi = require("joi");

const email = Joi.string()
        .email({minDomainSegments: 2})
        .required()
        .messages({
            'string.email': 'Enter a valid email address',
            'string.empty': 'Email is required',
        });

const password = Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9_$@]{3,30}$'))
        .required()
        .messages({
            'string.pattern.base': 'Password must be 3 to 30 characters long with only letters, digits and special',
            'string.empty': 'Password is required'
        });

const cpassword = Joi.string()
        .valid(Joi.ref('password'))
        .required()
        .messages({
            'any.only': 'Passwords do not match',
            'string.empty': 'Confirm password is required'
        });

const signUpSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
            'string.empty': 'Name is required',
            'string.min': 'Name must be atleast 2 characters long',
            'string.max': 'Name cannot excess 100 characters',
        }),
    email,
    password,
    cpassword
});

const loginSchema = Joi.object({
    email,
    password
});

const otp = Joi.string()
    .length(6)
    .pattern(/^[0-9]{6}$/)
    .required()
    .messages({
        'string.length': 'OTP must be 6 digits',
        'string.empty': 'OTP is required',
        'string.pattern.base': 'OTP must contain only digits'
    });

const createPasswordSchema = Joi.object({
    otp,
    password,
    cpassword
});

module.exports = {
    signUpSchema,
    loginSchema,
    createPasswordSchema
}