const express = require("express");
const router = express.Router();

const { getItineraryByTrip, getDaysByItinerary, getPendingSlots } = require("../controllers/readItinerary");


const auth = require("../middlewares/authMiddleware");
const isTripAdmin = require("../middlewares/isTripAdmin");

router.get("/trip/:tripId", auth, getItineraryByTrip);
router.get("/itinerary/:itineraryId/days", auth, getDaysByItinerary);
router.get("/itinerary/:itineraryId/pending-slots", auth, isTripAdmin, getPendingSlots);

module.exports = router;