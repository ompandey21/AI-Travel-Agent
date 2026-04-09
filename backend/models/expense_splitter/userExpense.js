const {DataTypes} = require('sequelize');

const userExpenseDef = {
    tripId:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    userId:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    totalPaid:{
        type: DataTypes.DECIMAL(10,2),
        defaultValue: 0.00,
    },
    totalOwed:{
        type: DataTypes.DECIMAL(10,2),
        defaultValue: 0.00,
    },
    pendingToPay: {
        type: DataTypes.DECIMAL(10,2),
        defaultValue: 0.00
    },
    pendingToReceive: {
        type: DataTypes.DECIMAL(10,2),
        defaultValue: 0.00
    }
};

module.exports = userExpenseDef;