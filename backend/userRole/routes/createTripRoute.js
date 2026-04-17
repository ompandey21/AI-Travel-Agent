const express = require("express");
const router = express.Router();
const upload =require('../../config/multer.js');

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

router.post("/create-trip", auth, upload.single('cover_img'), createTrip);
router.post("/invite-user/:tripId", auth  , inviteUser);
router.get("/verify-invite", verifyInvite);
router.get("/accept-invite", acceptInvite);
router.get("/:id/members", auth, getMembers);
router.delete('/delete-trip/:tripId', auth, isTripAdmin, deleteTrip);

module.exports = router;
