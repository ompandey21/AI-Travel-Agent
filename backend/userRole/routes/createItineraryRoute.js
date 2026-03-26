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
} = require("../controllers/createItinerary");

const authMiddleware = require('../middlewares/authMiddleware');
const isTripAdmin = require('../middlewares/isTripAdmin');
const validate = require('../middlewares/validate');
const { createSlotSchema, updateSlotSchema } = require('../../validations/itineraryValidator');

router.post('/create-itinerary/:tripId', authMiddleware, isTripAdmin, createItinerary);
router.post('/create-slot/:dayId', authMiddleware, validate(createSlotSchema), createSlot);
router.post('/finalize-itinerary/:itineraryId', authMiddleware, isTripAdmin, finalizeItinerary);
router.post('/approve-slot/:slotId', authMiddleware, isTripAdmin, approveSlot);
router.post('/reject-slot/:slotId', authMiddleware, isTripAdmin, rejectSlot);
router.post('/update-slot/:slotId', authMiddleware, isTripAdmin, validate(updateSlotSchema), updateSlot);
router.delete('/delete-slot/:slotId', authMiddleware, isTripAdmin, deleteSlot);

module.exports = router;