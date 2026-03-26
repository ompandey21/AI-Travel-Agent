const {DataTypes} = require('sequelize');

const voteDataDef = {
    userId:{
        type: DataTypes.INTEGER,
        allowedNull: false
    },
    gemId:{
        type: DataTypes.INTEGER,
        allowedNull: false
    },
    voteType:{
        type: DataTypes.ENUM('up', 'down'),
        defaultValue: 'up'
    }
};
module.exports = voteDataDef;