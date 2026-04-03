const { DataTypes } = require('sequelize');

const tripDataDefinition = {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },

  startLocation: {
    type: DataTypes.STRING,
    allowNull: false
  },
  destination: {
    type: DataTypes.STRING,
    allowNull: false
  },

  startLat: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  startLng: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  endLat: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  endLng: {
    type: DataTypes.FLOAT,
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

  totalDays: {
    type: DataTypes.INTEGER
  },

  budget: {
    type: DataTypes.INTEGER,
    allowNull: false
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