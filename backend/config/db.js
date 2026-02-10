const { Sequelize } = require("sequelize");
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    logging: false
  }
);

// Import model defininition
const userAuthDef = require('../models/userAuth');

// Define model
const UserAuth = sequelize.define('userAuth', userAuthDef, { timestamps: true });

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("DB connected");
  } catch (err) {
    console.error("DB connection failed", err);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB, UserAuth };
