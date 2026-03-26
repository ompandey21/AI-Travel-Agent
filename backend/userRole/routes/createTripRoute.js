const express = require("express");
const router = express.Router();

const {
  createTrip,
  inviteUser,
  verifyInvite,
  acceptInvite,
  getMembers,
  deleteTrip
} = require("../controllers/createTripController");

const auth = require("../middlewares/authMiddleware");
const isTripAdmin = require("../middlewares/isTripAdmin");
const validate = require("../middlewares/validate");
const { createTripSchema, inviteSchema } = require("../../validations/tripValidator");

router.post("/create-trip", auth ,validate(createTripSchema), createTrip);
router.post("/invite-user/:tripId", auth ,validate(inviteSchema) , inviteUser);
router.get("/verify-invite", verifyInvite);
router.post("/accept-invite", acceptInvite);
router.get("/:id/members", auth, getMembers);
router.delete('/delete-trip/:tripId', auth, isTripAdmin, deleteTrip);

module.exports = router;
