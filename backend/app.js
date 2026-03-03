const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require('cookie-parser');
require("dotenv").config();

const authRoutes = require("./userRole/routes/authRoute");
const createTripRoutes = require("./userRole/routes/createTripRoute");
const readTripRoutes = require("./userRole/routes/readTripRoute");
const createItineraryRoutes = require("./userRole/routes/createItineraryRoute");
const readItineraryRoutes = require("./userRole/routes/readItineraryRoute");

const { sequelize, connectDB, UserAuth, TripData, TripMember, ItineraryData, DayData, SlotData} = require("./config/db");
connectDB();

sequelize.sync()
  .then(() => console.log("Tables synced"))
  .catch(err => console.error(err));

// Associations
// UserAuth and TripData: one-to-many (created_by)
UserAuth.hasMany(TripData, { foreignKey: 'created_by', as: 'trips' });
TripData.belongsTo(UserAuth, { foreignKey: 'created_by', as: 'creator' });

// UserAuth and TripMember: many-to-many through TripMember
UserAuth.hasMany(TripMember, { foreignKey: 'userId', as: 'tripMemberships' });
TripMember.belongsTo(UserAuth, { foreignKey: 'userId', as: 'user' });

// TripData and TripMember: many-to-many through TripMember
TripData.hasMany(TripMember, { foreignKey: 'tripId', as: 'members' });
TripMember.belongsTo(TripData, { foreignKey: 'tripId', as: 'trip' });

// TripData and ItineraryData: one-to-many (trip_id)
TripData.hasMany(ItineraryData, { foreignKey: 'trip_id', as: 'itineraries' });
ItineraryData.belongsTo(TripData, { foreignKey: 'trip_id', as: 'trip' });

// ItineraryData and DayData: one-to-many (itinerary_id)
ItineraryData.hasMany(DayData, { foreignKey: 'itinerary_id', as: 'days' });
DayData.belongsTo(ItineraryData, { foreignKey: 'itinerary_id', as: 'itinerary' });

// DayData and SlotData: one-to-many (day_id)
DayData.hasMany(SlotData, { foreignKey: 'day_id', as: 'slots' });
SlotData.belongsTo(DayData, { foreignKey: 'day_id', as: 'day' });

app.use(express.json());

app.use(cookieParser());

const corsOptions = {
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));
app.use("/api/auth", authRoutes);
app.use("/api/trips", createTripRoutes);
app.use("/api/read-trips", readTripRoutes);
app.use("/api/itinerary", createItineraryRoutes);
app.use("/api/read-itinerary", readItineraryRoutes);

const port = process.env.PORT;
app.listen(port, ()=>{
    console.log("Server connected successfully");
})