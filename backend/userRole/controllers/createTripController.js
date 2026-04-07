const {
  TripData,
  TripMember,
  UserAuth,
  ItineraryData,
  DayData,
  SlotData,
  UserExpense,
} = require("../../config/db");
const Crypto = require("crypto");
const sendEmail = require("../../utils/sendMail");
const { Op } = require("sequelize");
const { hashPass } = require("./authController");
const jwt = require("jsonwebtoken");
const { createTripSchema } = require("../../validations/tripValidator");

const { getCoordinates } = require("../../utils/geoCode");

exports.createTrip = async (req, res) => {
  try {
    const { error } = createTripSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }

    const { name, startLocation, destination, startDate, endDate, budget } =
      req.body;

    const user_id = req.user?.id;

    const existing = await TripData.findOne({
      where: { name, created_by: user_id },
    });

    if (existing) {
      return res.status(400).json({
        message: "You already have a trip with this name",
      });
    }

    // 🔥 fetch coordinates
    const startCoords = await getCoordinates(startLocation);
    const endCoords = await getCoordinates(destination);

    if (!startCoords || !endCoords) {
      return res.status(400).json({
        message: "Invalid locations provided",
      });
    }

    const totalDays = Math.ceil(
      (new Date(endDate) - new Date(startDate)) / 86400000,
    );

    const cover_img = req.file ? req.file.secure_url : null;

    const trip = await TripData.create({
      name,
      startLocation,
      destination,
      startDate,
      endDate,
      totalDays,
      budget,
      cover_img,
      created_by: user_id,

      startLat: startCoords.lat,
      startLng: startCoords.lng,
      endLat: endCoords.lat,
      endLng: endCoords.lng,
    });

    const user = await UserAuth.findByPk(user_id);

    await TripMember.create({
      userId: user_id,
      tripId: trip.id,
      name: user.name,
      email: user.email,
      role: "admin",
      status: "accepted",
    });

    await UserExpense.create({
      tripId: trip.id,
      userId: user_id,
    });

    res.status(201).json({
      message: "Trip created successfully",
      data: trip,
    });
  } catch (e) {
    console.error("Create trip error", e);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.inviteUser = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { email } = req.body;
    let username = "";
    const userId = req.user && req.user.id;

    const findAdmin = await TripMember.findOne({
      where: {
        tripId,
        userId,
        role: "admin",
        status: "accepted",
      },
    });

    if (!findAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const itinerary = await ItineraryData.findOne({
      where: { trip_id: tripId },
    });

    if (itinerary && itinerary.isFinalized) {
      return res
        .status(400)
        .json({ message: "Trip is finalized, cannot invite users" });
    }

    const findTripMember = await TripMember.findOne({
      where: { tripId, email },
    });

    if (findTripMember) {
      if (findTripMember.status === "accepted") {
        return res
          .status(400)
          .json({ message: "User is already a member of this trip" });
      }

      if (findTripMember.status === "invited") {
        const now = new Date();

        if (findTripMember.inviteExpire && findTripMember.inviteExpire > now) {
          return res
            .status(400)
            .json({ message: "User is already invited to this trip" });
        }

        const randomToken = Crypto.randomBytes(32).toString("hex");

        await findTripMember.update({
          inviteToken: randomToken,
          inviteExpire: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });

        const FRONTEND_URL =
          process.env.FRONTEND_URL || "http://localhost:5173";
        const inviteLink = `${FRONTEND_URL.replace(
          /\/$/,
          ""
        )}/join-trip?token=${randomToken}`;

        const trip = await TripData.findByPk(tripId);
        const destination = trip.destination;
        const startDate = new Date(trip.startDate).toLocaleDateString();

        const subject = `Invitiation to join the trip to ${destination}`;
        const body = `Hi, \n\nYou are invited to join the trip to ${destination} on ${startDate} \n\nClick on the link below to join \n\n${inviteLink}`;

        await sendEmail(email, subject, body);

        return res.status(200).json({ message: "Invitation sent" });
      }
    }

    const findUser = await UserAuth.findOne({ where: { email } });
    if (findUser) username = findUser.name;

    const randomToken = Crypto.randomBytes(32).toString("hex");

    await TripMember.create({
      tripId,
      email,
      name: username,
      status: "invited",
      inviteToken: randomToken,
      inviteExpire: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    const FRONTEND_URL =
      process.env.FRONTEND_URL || "http://localhost:5173";
    const inviteLink = `${FRONTEND_URL.replace(
      /\/$/,
      ""
    )}/join-trip?token=${randomToken}`;

    const trip = await TripData.findByPk(tripId);
    const destination = trip.destination;
    const startDate = new Date(trip.startDate).toLocaleDateString();

    const subject = `Invitiation to join the trip to ${destination}`;
    const body = `Hi, \n\nYou are invited to join the trip to ${destination} on ${startDate} \n\nClick on the link below to join \n\n${inviteLink}`;

    await sendEmail(email, subject, body);

    return res.status(200).json({ message: "Invitation sent" });
  } catch (e) {
    console.error("Internal server error", e);
    res.status(500).json({ message: "Internal server error" });
  }
};
exports.verifyInvite = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ message: "Missing invite token" });
    }
    const findInvite = await TripMember.findOne({
      where: {
        inviteToken: token,
        status: "invited",
        inviteExpire: {
          [Op.gt]: new Date(),
        },
      },
    });
    if (!findInvite) {
      return res.status(400).json({ message: "Invalid or expired invite" });
    }
    let userExist = true;
    const findUser = await UserAuth.findOne({
      where : {
        email : findInvite.email
      }
    });
    if(!findUser) userExist = false;
    
    res.status(200).json({
      email: findInvite.email,
      role: findInvite.role,
      trip: findInvite.tripId,
      isValid : userExist
    });
  } catch (e) {
    console.error("Verify invite error", e);
    res.status(500).json({ message: "Internal server error"});
  }
};

exports.acceptInvite = async (req, res) => {
  try {
    const { token } = req.query;
    // const { name, password } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Missing invite token" });
    }
    const invite = await TripMember.findOne({ where: { inviteToken: token } });
    if (!invite) {
      return res.status(400).json({ message: "Invalid invite token" });
    }
    const user = await UserAuth.findOne({ where: { email: invite.email } });
    // if (!user) {
    //   const hashedpass = await hashPass(password);
    //   user = await UserAuth.create({
    //     name,
    //     email: invite.email,
    //     password: hashedpass,
    //   });
    // }
    invite.userId = user.id;
    invite.name = user.name;
    invite.status = "accepted";
    invite.inviteToken = null;
    invite.inviteExpire = null;
    await invite.save();
    await UserExpense.create({
      tripId: invite.tripId,
      userId: user.id,
    });
    const tokenJwt = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    return res.status(200).json({
      message: "Joined trip successfully",
      token: tokenJwt,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      tripId: invite.tripId,
    });
  } catch (e) {
    console.error("Accept invite error", e);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const members = await TripMember.findAll({ where: { tripId: id } });
    res.status(200).json(members);
  } catch (e) {
    console.error("Get members error", e);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const itinerary = await ItineraryData.findOne({
      where: { trip_id: tripId },
    });
    if (itinerary) {
      const days = await DayData.findAll({
        where: { itinerary_id: itinerary.id },
      });
      for (const day of days) {
        await SlotData.destroy({ where: { day_id: day.id } });
      }
      await DayData.destroy({ where: { itinerary_id: itinerary.id } });
      await ItineraryData.destroy({ where: { id: itinerary.id } });
      await TripData.destroy({ where: { id: tripId } });
    }
    res.status(200).json({ message: "Trip deleted successfully" });
  } catch (e) {
    console.error("Delete trip error", e);
    res.status(500).json({ message: "Internal server error" });
  }
};
