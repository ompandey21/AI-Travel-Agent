const { DataTypes } = require('sequelize');

const chatMessageDefinition = {
  tripId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  recipientId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('group', 'private'),
    allowNull: false,
    defaultValue: 'group',
  },
};

module.exports = chatMessageDefinition;
