const {DataTypes} = require('sequelize');

const hiddenGemDefinition = {
    name:{
        type: DataTypes.STRING,
        allowedNull: false
    },
    latitude:{
        type: DataTypes.DOUBLE,
        allowedNull: false
    },
    longitude:{
        type: DataTypes.DOUBLE,
        allowedNull: false
    },
    city:{
        type: DataTypes.STRING,
        allowedNull: false
    },
    added_by:{
        type: DataTypes.INTEGER,
        allowedNull: false
    },
    up_vote:{
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    down_vote:{
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
};

module.exports = hiddenGemDefinition;