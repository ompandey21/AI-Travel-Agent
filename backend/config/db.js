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
const tripDataDef = require('../models/tripData');
const tripMemberDef = require('../models/tripMember');
const itineraryDataDef = require('../models/itinerary_models/itineraryData');
const dayDataDef = require('../models/itinerary_models/dayData');
const slotDataDef = require('../models/itinerary_models/slotsData');

// Define model
const UserAuth = sequelize.define('user_auth', userAuthDef, { timestamps: true });
const TripData = sequelize.define('trip_data', tripDataDef, { timestamps: true });
const TripMember = sequelize.define('trip_member_data', tripMemberDef, { timestamps: true });
const ItineraryData = sequelize.define('itinerary_data', itineraryDataDef, { timestamps: true });
const DayData = sequelize.define('day_data', dayDataDef, { timestamps: true });
const SlotData = sequelize.define('slot_data', slotDataDef, { timestamps: true });

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("DB connected");
  } catch (err) {
    console.error("DB connection failed", err);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB, UserAuth, TripData, TripMember, ItineraryData, DayData, SlotData };
