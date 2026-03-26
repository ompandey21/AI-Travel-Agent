const Joi = require('joi');

const createTripSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
            'string.empty': 'Name is required',
            'string.min': 'Name must be atleast 2 characters long',
            'string.max': 'Name cannot excess 100 characters',
        }),
    destination: Joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
            'string.empty': 'Destination is required',
            'string.min': 'Destination must be atleast 2 characters long',
            'string.max': 'Destination cannot excess 100 characters',
        }),
    startDate: Joi.date()
        .iso()
        .required()
        .messages({
            'any.required': 'Start date is required',
            'date.base': 'Start date must be a valid date',
            'date.format': 'Start date must be in ISO format (YYYY-MM-DD)',
        }),
    endDate: Joi.date()
        .iso()
        .min(Joi.ref('startDate'))
        .required()
        .messages({
            'any.required': 'End date is required',
            'date.base': 'End date must be a valid date',
            'date.format': 'End date must be in ISO format (YYYY-MM-DD)',
            'date.min': "End date cannot be before Start date"
        }),

    budget: Joi.number()
        .min(0)
        .required()
        .messages({
            'any.required': 'Budget is required',
            'number.min': 'Budget cannot be negative',
        }),
    cover_img: Joi.string()
        .uri()
});

const inviteSchema = Joi.object({
    email: Joi.string()
        .email({minDomainSegments: 2})
        .required()
        .messages({
            'string.email': 'Enter a valid email address',
            'string.empty': 'Email is required',
        }),
    name: Joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
            'string.empty': 'Name is required',
            'string.min': 'Name must be atleast 2 characters long',
            'string.max': 'Name cannot excess 100 characters',
        }),
});

module.exports = {
    createTripSchema,
    inviteSchema
}