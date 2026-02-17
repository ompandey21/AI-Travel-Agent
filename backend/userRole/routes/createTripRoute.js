const express = require("express");
const router = express.Router();

const {
  createTrip,
  inviteUser,
  verifyInvite,
  acceptInvite,
  getMembers
} = require("../controllers/createTripController");

const authMiddleware = require("../middlewares/authMiddleware");

router.post("/create-trip", authMiddleware, createTrip);
router.post("/invite-user", authMiddleware, inviteUser);
router.get("/verify-invite", verifyInvite);
router.post("/accept-invite", acceptInvite);
router.get("/:id/members", authMiddleware, getMembers);

module.exports = router;
