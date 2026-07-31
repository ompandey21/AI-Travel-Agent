const axios = require("axios");
const { Op } = require("sequelize");
const { ItineraryData, DayData, SlotData, TripData, TripMember } = require("../../config/db");

function normalizeText(text) {
    return (text || "").toString().trim().toLowerCase();
}

function extractPlaceNameFromActivity(activityText) {
    if (!activityText) return null;
    const text = activityText.toString().trim();
    const lower = text.toLowerCase();
    const atIndex = lower.lastIndexOf(" at ");
    if (atIndex !== -1) {
        return text.slice(atIndex + 4).trim();
    }
    return text;
}

exports.createItinerary = async (req, res) => {
    try{
        const { tripId } = req.params;
        const trip = await TripData.findByPk(tripId);
        if (!trip) {
            return res.status(404).json({ message: "Trip not found" });
        }
        const destination = trip.destination;
        const existingItinerary = await ItineraryData.findOne({ where: { trip_id: tripId } });
        if(existingItinerary){
            return res.status(400).json({ message: "Itinerary already exists for this trip" });
        }
        const itinerary = await ItineraryData.create({ trip_id: tripId , destination });
        const totalDays = trip.totalDays;
        for(let i=1; i<=totalDays; i++){
            await DayData.create({itinerary_id: itinerary.id, destination, dayIndex: i});
        }
        res.status(201).json({ message: "Itinerary created successfully", itinerary});
    }
    catch(e){
        console.error("Create itinerary error", e);
        res.status(500).json({ message: "Internal server error" });
    }
}

exports.createSlot = async(req, res) =>{
    try{
        const { dayId } = req.params;
        const {startTime, endTime, activity, imgUrl} = req.body;
        const existingSlot = await SlotData.findOne({ where: { day_id: dayId, startTime, endTime } });
        if(existingSlot || await SlotData.findOne(
            { where: { 
                day_id: dayId, 
                [Op.or]: [
                    {
                        startTime: { [Op.lte]: startTime },
                        endTime: { [Op.gte]: startTime }
                    },
                    {
                        startTime: { [Op.lte]: endTime },
                        endTime: { [Op.gte]: endTime }
                    }
                ] 
            } }
        )){
            return res.status(400).json({ message: `Slot from ${startTime} to ${endTime} already exists for this day` });
        }
        const day = await DayData.findByPk(dayId);
        const itinerary = await ItineraryData.findByPk(day.itinerary_id);
        if(itinerary.isFinalized){
            return res.status(400).json({ message: "Itinerary is finalized, cannot add new slot" });
        }

        const itineraryDays = await DayData.findAll({
            where: { itinerary_id: itinerary.id },
            attributes: ['id'],
            raw: true,
        });
        const itineraryDayIds = itineraryDays.map((d) => d.id);

        const normalizedActivity = normalizeText(activity);
        const existingSlots = await SlotData.findAll({
            where: { day_id: { [Op.in]: itineraryDayIds } },
            attributes: ['activity'],
            raw: true,
        });

        const existingSlotWithSameActivity = existingSlots.find((slot) => normalizeText(slot.activity) === normalizedActivity);
        if (existingSlotWithSameActivity) {
            return res.status(400).json({ message: "A slot with the same activity already exists in this itinerary" });
        }

        const existingPlace = existingSlots.find((slot) => {
            const existingPlaceName = normalizeText(extractPlaceNameFromActivity(slot.activity));
            return existingPlaceName && normalizedActivity.includes(existingPlaceName);
        });
        if (existingPlace) {
            return res.status(400).json({ message: "A slot with the same place already exists in another day of this itinerary" });
        }

        const isAdmin = await TripMember.findOne({
            where: {
                userId: req.user.id,
                tripId: itinerary.trip_id,
                role: 'admin'
            }
        });
        const status = isAdmin ? "approved" : "pending";

        const slot = await SlotData.create({ day_id: dayId, startTime, endTime, activity, status , imgUrl });
        res.status(201).json({ message: "Slot created successfully", slot });
    }
    catch(e){
        console.error("Create slot error", e);
        res.status(500).json({ message: "Internal server error" });
    }
}

exports.createPlanWithAI = async (req, res) => {
    try {
        const { dayId } = req.params;
        const { city, activity } = req.body;

        if (!city || !activity) {
            return res.status(400).json({ message: "City and activity are required" });
        }

        const day = await DayData.findByPk(dayId);
        if (!day) {
            return res.status(404).json({ message: "Day not found" });
        }

        const itinerary = await ItineraryData.findByPk(day.itinerary_id);

        if (itinerary.isFinalized) {
            return res.status(400).json({ message: "Itinerary is finalized, cannot add new slots" });
        }

        const isAdmin = await TripMember.findOne({
            where: {
                userId: req.user.id,
                tripId: itinerary.trip_id,
                role: 'admin'
            }
        });
        const status = isAdmin ? "approved" : "pending";

        const itineraryDays = await DayData.findAll({
            where: { itinerary_id: itinerary.id },
            attributes: ['id'],
            raw: true,
        });
        const itineraryDayIds = itineraryDays.map((d) => d.id);

        const existingSlots = await SlotData.findAll({
            where: { day_id: { [Op.in]: itineraryDayIds } },
            attributes: ['activity'],
            raw: true,
        });

        const existingPlaces = Array.from(new Set(
            existingSlots
                .map((slot) => normalizeText(extractPlaceNameFromActivity(slot.activity)))
                .filter(Boolean)
        ));

        const response = await axios.post(
            `${process.env.ML_SERVICE_API}/itinerary/create-slots`,
            { city, activity, excludePlaces: existingPlaces }
        );

        const dayPlan = response?.data?.data?.day_plan;

        if (!dayPlan || !Array.isArray(dayPlan)) {
            return res.status(500).json({ message: "Invalid response from ML service" });
        }

        const parseTime = (timeStr) => {
            try {
                const [time, modifier] = timeStr.split(" ");
                let [hours, minutes] = time.split(":").map(Number);

                if (modifier === "PM" && hours !== 12) hours += 12;
                if (modifier === "AM" && hours === 12) hours = 0;

                const date = new Date();
                date.setHours(hours, minutes, 0, 0);
                return date;
            } catch {
                return null;
            }
        };

        const parseDuration = (durationStr) => {
            const num = parseFloat(durationStr);
            if (isNaN(num)) return null;
            return num * 60;
        };

        const createdSlots = [];
        const usedPlaces = new Set(existingPlaces.map(normalizeText));

        for (const item of dayPlan) {
            try {
                const place = item.place?.trim();
                const normalizedPlace = normalizeText(place);
                if (!place || usedPlaces.has(normalizedPlace)) continue;

                const start = parseTime(item.time);
                const duration = parseDuration(item.duration);

                if (!start || !duration) continue;

                const end = new Date(start.getTime() + duration * 60000);

                const startTime = start.toTimeString().slice(0, 5);
                const endTime = end.toTimeString().slice(0, 5);

                const conflict = await SlotData.findOne({
                    where: {
                        day_id: dayId,
                        [Op.or]: [
                            {
                                startTime: { [Op.lte]: startTime },
                                endTime: { [Op.gte]: startTime }
                            },
                            {
                                startTime: { [Op.lte]: endTime },
                                endTime: { [Op.gte]: endTime }
                            }
                        ]
                    }
                });

                if (conflict) continue;

                const slot = await SlotData.create({
                    day_id: dayId,
                    startTime,
                    endTime,
                    activity: `${item.activity} at ${item.place}`,
                    status,
                    imgUrl: null
                });

                createdSlots.push(slot);
                usedPlaces.add(normalizedPlace);

            } catch {
                continue;
            }
        }

        return res.status(201).json({
            message: "AI plan created successfully",
            createdCount: createdSlots.length
        });

    } catch (e) {
        console.error("Create plan with AI error", e);
        res.status(500).json({ message: "Internal server error" });
    }
};
// only admin can finalize
exports.finalizeItinerary = async (req, res) => {
    try{
        const { itineraryId } = req.params;
        const itinerary = await ItineraryData.findByPk(itineraryId);
        if(itinerary.isFinalized){
            return res.status(400).json({ message: "Itinerary is already finalized" });
        }
        await ItineraryData.update({ isFinalized: true }, { where: { id: itineraryId } });
        res.status(200).json({ message: "Itinerary finalized successfully" });
    }
    catch(e){
        console.error("Finalize itinerary error", e);
        res.status(500).json({ message: "Internal server error" });
    }
}

// only admin can approve pending slot
exports.approveSlot = async (req, res) =>{
    try{
        const {slotId} = req.params;
        const slot = await SlotData.findByPk(slotId);
        const day = await DayData.findByPk(slot.day_id);
        const itinerary = await ItineraryData.findByPk(day.itinerary_id);
        if(itinerary.isFinalized){
            return res.status(400).json({ message: "Itinerary is finalized, cannot approve slot" });
        }
        slot.status = "approved";
        await slot.save();
        res.status(200).json({ message: "Slot approved successfully", slot });
    }
    catch(e){
        console.error("Approve slot error", e);
        res.status(500).json({ message: "Internal server error" });
    }
}
// only admin can reject pending slot
exports.rejectSlot = async (req, res) =>{
    try{
        const {slotId} = req.params;
        const slot = await SlotData.findByPk(slotId);
        const day = await DayData.findByPk(slot.day_id);
        const itinerary = await ItineraryData.findByPk(day.itinerary_id);
        if(itinerary.isFinalized){
            return res.status(400).json({ message: "Itinerary is finalized, cannot reject slot" });
        }
        slot.status = "rejected";
        await slot.save();
        res.status(200).json({ message: "Slot rejected successfully", slot });
    }
    catch(e){
        console.error("Reject slot error", e);
        res.status(500).json({ message: "Internal server error" });
    }
}
// only admin can update slot
exports.updateSlot = async (req, res) =>{
    try{
        const {slotId} = req.params;
        const {startTime, endTime, activity, imgUrl} = req.body;
        const slot = await SlotData.findByPk(slotId);
        const day = await DayData.findByPk(slot.day_id);
        const itinerary = await ItineraryData.findByPk(day.itinerary_id);
        if(slot.status === "pending"){
            return res.status(400).json({ message: "Cannot update pending slot, please approve or reject it first" });
        }
        if(itinerary.isFinalized){
            return res.status(400).json({ message: "Itinerary is finalized, cannot update slot" });
        }
        slot.startTime = startTime;
        slot.endTime = endTime;
        slot.activity = activity;
        slot.imgUrl = imgUrl;
        await slot.save();
        res.status(200).json({ message: "Slot updated successfully", slot });
    }
    catch(e){
        console.error("Update slot error", e);
        res.status(500).json({ message: "Internal server error" });
    }
}

// only admin can delete slot
exports.deleteSlot = async (req, res) =>{
    try{
        const {slotId} = req.params;
        const slot = await SlotData.findByPk(slotId);
        const day = await DayData.findByPk(slot.day_id);
        const itinerary = await ItineraryData.findByPk(day.itinerary_id);
        if(itinerary.isFinalized){
            return res.status(400).json({ message: "Itinerary is finalized, cannot delete slot" });
        }
        await slot.destroy();
        res.status(200).json({ message: "Slot deleted successfully" });
    }
    catch(e){
        console.error("Delete slot error", e);
        res.status(500).json({ message: "Internal server error" });
    }
}