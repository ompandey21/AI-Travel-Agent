const express = require('express');
const router = express.Router();
const {
    createItinerary,
    createSlot,
    finalizeItinerary,
    approveSlot,
    rejectSlot,
    updateSlot,
    deleteSlot,
    deleteTrip
} = require("../controllers/createItinerary");

const authMiddleware = require('../middlewares/authMiddleware');
const isTripAdmin = require('../middlewares/isTripAdmin');

router.post('/create-itinerary/:tripId', authMiddleware, isTripAdmin, createItinerary);
router.post('/create-slot/:dayId', authMiddleware, createSlot);
router.post('/finalize-itinerary/:itineraryId', authMiddleware, isTripAdmin, finalizeItinerary);
router.post('/approve-slot/:slotId', authMiddleware, isTripAdmin, approveSlot);
router.post('/reject-slot/:slotId', authMiddleware, isTripAdmin, rejectSlot);
router.post('/update-slot/:slotId', authMiddleware, isTripAdmin, updateSlot);
router.delete('/delete-slot/:slotId', authMiddleware, isTripAdmin, deleteSlot);

module.exports = router;