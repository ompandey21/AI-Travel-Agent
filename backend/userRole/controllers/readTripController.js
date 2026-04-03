const { TripMember, TripData } = require("../../config/db");
const { budget } = require("../../models/tripData");

exports.getMyTrips = async (req, res) => {
  try {
    const userId = req.user.id;

    const trips = await TripMember.findAll({
      where: {
        userId,
        status: "accepted",
      },
      include: [
        {
          model: TripData,
          as: "trip",
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const formatted = trips
      .filter((t) => t.trip)
      .map((t) => ({
        tripId: t.trip.id,
        name: t.trip.name,
        destination: t.trip.destination,
        startDate: t.trip.startDate,
        endDate: t.trip.endDate,
        totalDays: t.trip.totalDays,
        budget: t.trip.budget,
        cover_img: t.trip.cover_img,
        role: t.role,
      }));

    res.status(200).json({
      message: "Trips fetched successfully",
      data: formatted,
    });
  } catch (e) {
    console.error("Get my trips error:", e);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getTripById = async (req, res) => {
  try {
    const { tripId } = req.params;
    const userId = req.user.id;

    const member = await TripMember.findOne({
      where: {
        tripId,
        userId,
        status: "accepted",
      },
    });

    if (!member) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const trip = await TripData.findByPk(tripId, {
      attributes: [
        "id",
        "name",
        "startLocation",
        "destination",
        "startLat",
        "startLng",
        "endLat",
        "endLng",
        "startDate",
        "endDate",
        "totalDays",
        "budget",
        "cover_img",
        "created_by",
      ],
    });
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    res.status(200).json(trip);
  } catch (e) {
    console.error("Get trip error", e);
    res.status(500).json({ message: "Internal server error" });
  }
};
