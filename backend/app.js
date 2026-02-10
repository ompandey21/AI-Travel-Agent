const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./userRole/routes/authRoute");

const { sequelize, connectDB, UserAuth } = require("./config/db");
connectDB();

sequelize.sync()
  .then(() => console.log("Tables synced"))
  .catch(err => console.error(err));

app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);

const port = process.env.PORT;
app.listen(port, ()=>{
    console.log("Server connected successfully");
})