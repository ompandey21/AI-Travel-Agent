const {DataTypes} = require('sequelize');

const expenseSettlementDef = {
    tripId:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    expenseId:{
        type: DataTypes.INTEGER,
        allowNull: true
    },
    payerId:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    receiverId:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    amount:{
        type: DataTypes.DECIMAL(10,2),
        allowNull: false
    },
    status:{
        type: DataTypes.ENUM('pending','completed','cancelled'),
        defaultValue: 'pending'
    },
    clearedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
};
module.exports = expenseSettlementDef;