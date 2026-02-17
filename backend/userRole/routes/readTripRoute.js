const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const { getMyTrips, getTripById } = require("../controllers/readTripController");

router.get("/my-trips", auth, getMyTrips);
router.get("/my-trip/:tripId", auth, getTripById);

module.exports = router;
