const Joi = require('joi');


const startTime = Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .required()
    .messages({
        'string.empty': 'Start time is required',
        'string.pattern.base': "Start time must be between 00:00 to 23:59"
    });

const endTime = Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .required()
    .messages({
        'string.empty': 'Start time is required',
        'string.pattern.base': "Start time must be between 00:00 ans 23:59",
    });

const createSlotSchema = Joi.object({
    startTime,
    endTime,
}).custom((value, helpers) => {

    if (value.endTime <= value.startTime) {
        return helpers.message("End time must be greater than start time");
    }

    return value;

});

const updateSlotSchema = Joi.object({
    startTime,
    endTime
}).custom((value, helpers) => {

    if (value.endTime <= value.startTime) {
        return helpers.message("End time must be greater than start time");
    }

    return value;

});

module.exports = {
    createSlotSchema,
    updateSlotSchema
}