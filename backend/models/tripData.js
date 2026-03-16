const { DataTypes } = require('sequelize');

const tripDataDefinition = {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  destination: {
    type: DataTypes.STRING,
    allowNull: false
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  totalDays:{
    type: DataTypes.INTEGER
  },
  budget: {
    type: DataTypes.DECIMAL(10, 2)
  },
  cover_img: {
    type: DataTypes.STRING,
    defaultValue: ""
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
};

module.exports = tripDataDefinition;