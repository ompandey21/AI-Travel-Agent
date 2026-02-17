const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./userRole/routes/authRoute");
const createTripRoutes = require("./userRole/routes/createTripRoute");
const readTripRoutes = require("./userRole/routes/readTripRoute");

const { sequelize, connectDB, UserAuth, TripData, TripMember} = require("./config/db");
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


app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/trips", createTripRoutes);
app.use("/api/read-trips", readTripRoutes);

const port = process.env.PORT;
app.listen(port, ()=>{
    console.log("Server connected successfully");
})