const { DataTypes } = require('sequelize');

const itineraryDataDefinition = {
  trip_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  destination: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isFinalized: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
};

module.exports = itineraryDataDefinition;