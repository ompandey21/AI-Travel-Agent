const { DataTypes } = require('sequelize');

const tripMemberDefinition = {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  tripId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('editor', 'admin'),
    defaultValue: 'editor'
  },
  status: {
    type: DataTypes.ENUM('invited', 'accepted'),
    defaultValue: 'invited'
  },
  inviteToken: {
    type: DataTypes.STRING
  },
  inviteExpire: {
    type: DataTypes.DATE
  }
};

module.exports = tripMemberDefinition;