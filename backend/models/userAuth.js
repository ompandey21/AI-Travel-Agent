const { DataTypes } = require('sequelize');

const UserAuth = {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
  ,
  otp: {
    type: DataTypes.STRING,
    allowNull: true
  },
  otp_expires: {
    type: DataTypes.DATE,
    allowNull: true
  }
};

module.exports = UserAuth;