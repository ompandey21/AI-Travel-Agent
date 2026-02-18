const { DataTypes } = require('sequelize');

const tripDataDefinition = {
  name: {
    type: DataTypes.STRING
  },
  destination: {
    type: DataTypes.STRING,
    allowNull: false
  },
  startDate: {
    type: DataTypes.DATE
  },
  endDate: {
    type: DataTypes.DATE
  },
  budget: {
    type: DataTypes.NUMBER
  },
  cover_img: {
    type: DataTypes.STRING,
    defaultValue: ""
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
};

module.exports = tripDataDefinition;