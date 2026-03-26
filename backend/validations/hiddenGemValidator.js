const joi = require('joi');
const { city } = require('../models/hidden_gem/hiddenGem');

const createGemSchema = joi.object({
    name: joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
            'string.empty': 'Name is required',
            'string.min': 'Name must be at least 2 characters long',
            'string.max': 'Name cannot exceed 100 characters',
        }),
    latitude: joi.number()
        .min(-90)
        .max(90)
        .required()
        .messages({
            'number.base': 'Latitude must be a number',
            'number.min': 'Latitude must be between -90 and 90',
            'number.max': 'Latitude must be between -90 and 90',
            'any.required': 'Latitude is required',
        }),
    longitude: joi.number()
        .min(-180)
        .max(180)
        .required()
        .messages({
            'number.base': 'Longitude must be a number',
            'number.min': 'Longitude must be between -180 and 180',
            'number.max': 'Longitude must be between -180 and 180',
            'any.required': 'Longitude is required',
        }),
    city: joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
            'string.empty': 'City is required',
            'string.min': 'City must be at least 2 characters long',
            'string.max': 'City cannot exceed 100 characters',
        }),
});

module.exports = {
    createGemSchema
}