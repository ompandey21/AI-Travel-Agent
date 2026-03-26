const {DataTypes} = require('sequelize');

const expenseMemberDef = {
    userId:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    expenseId:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    shareAmount: {
        type: DataTypes.DECIMAL(10,2),
        defaultValue: 0.00
    },
    isSettled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
};
module.exports = expenseMemberDef;