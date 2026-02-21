const { DataTypes } = require('sequelize');

const slotDataDefinition = {
  day_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  startTime: {
    type: DataTypes.STRING,
    allowNull: false
  },
  endTime: {
    type: DataTypes.STRING,
    allowNull: false
  },
  activity: {
    type: DataTypes.STRING,
    allowNull: false
  },
  imgUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status:{
    type: DataTypes.ENUM('pending', 'approved', "rejected"),
    defaultValue: 'pending'
  }
};

module.exports = slotDataDefinition;