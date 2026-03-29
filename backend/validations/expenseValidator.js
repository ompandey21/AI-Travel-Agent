const joi = require('joi');
const { splitType } = require('../models/expense_splitter/expenseData');

const addExpenseSchema = joi.object({
    title: joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
            'string.empty': 'Title is required',
            'string.min': 'Title must be at least 2 characters long',
            'string.max': 'Title cannot exceed 100 characters',
        }),
    amount: joi.number()
        .positive()
        .required()
        .messages({
            'any.required': 'Amount is required',
            'number.positive': 'Amount must be a positive number',
        }),
    splitType: joi.string()
        .valid(...Object.values(splitType))
        .required()
        .messages({
            'any.required': 'Split type is required',
            'any.only': `Split type must be one of ${Object.values(splitType).join(', ')}`
        }),
    splits: joi.array()
        .items(joi.object({
            userId: joi.number()
                .required()
                .messages({
                    'any.required': 'User ID is required',
                }),
            amount: joi.number()
                .positive()
                .required()
                .messages({
                    'any.required': 'Amount is required',
                    'number.positive': 'Amount must be a positive number',
                }),
        }))
});

const settleExpenseSchema = joi.object({
    amount: joi.number()
        .positive()
        .required()
        .messages({
            'any.required': 'Amount is required',
            'number.positive': 'Amount must be a positive number',
        }),
});

module.exports = {
    addExpenseSchema,
    settleExpenseSchema
}