const { DataTypes } = require('sequelize');

const dayDataDefinition = {
  itinerary_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  dayIndex: {
    type: DataTypes.STRING,
    allowNull: false
  }
};

module.exports = dayDataDefinition;