const {DataTypes} = require('sequelize');

const DocumentVault = {
    title:{
        type: DataTypes.STRING,
        allowNull: false
    },
    description:{
        type: DataTypes.STRING,
        allowNull: false
    },
    fileUrl: {
        type: DataTypes.STRING,
        allowNull: false
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    tripId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
};

module.exports = DocumentVault;