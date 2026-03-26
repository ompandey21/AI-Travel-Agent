const {DataTypes} = require('sequelize');

const splitType = {
    EQUAL: 'equal',
    CUSTOM: 'custom'
};

const expenseDataDef = {
    tripId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL(10,2),
        allowNull: false
    },
    paidBy: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    splitType: {
        type: DataTypes.ENUM(Object.values(splitType)),
        defaultValue: splitType.EQUAL
    }
};

module.exports = { expenseDataDef, splitType };
module.exports.default = expenseDataDef;
