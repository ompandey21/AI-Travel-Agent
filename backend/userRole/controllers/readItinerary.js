const { ItineraryData, DayData, SlotData } = require("../../config/db");

exports.getItineraryByTrip = async (req, res) => {
    try{
        const { tripId } = req.params;
        const itinerary = await ItineraryData.findOne({ where: { trip_id: tripId } });
        if(!itinerary){
            return res.status(404).json({ message: "Itinerary not found for this trip" });
        }
        const itineraryWithDays = await ItineraryData.findOne({
            where: { trip_id: tripId },
            include: [{ model: DayData, as: 'days', order: [['dayIndex', 'ASC']] }]
        });
        res.status(200).json({message:"Itinerary found", itinerary: itineraryWithDays});
    }
    catch(e){
        console.error("Get itinerary error", e);
        res.status(500).json({ message: "Internal server error" });
    }
}

exports.getDaysByItinerary = async (req, res) => {
    try{
        const { itineraryId } = req.params;
        const days = await DayData.findAll({ 
            where: { itinerary_id: itineraryId }, 
            order: [['dayIndex', 'ASC']],
            include: [{ model: SlotData, as: 'slots', order: [['startTime', 'ASC']] }]
        });
        if(days.length === 0){
            return res.status(404).json({ message: "No days found for this itinerary" });
        }
        res.status(200).json({ message: "Days found", days });
    }
    catch(e){
        console.error("Get days error", e);
        res.status(500).json({ message: "Internal server error" });
    }
}

exports.getPendingSlots = async (req, res) =>{
    try{
        const { itineraryId } = req.params;
        const day = await DayData.findOne({ where: { itinerary_id: itineraryId } });
        const pendingSlots = await SlotData.findAll({ 
            where: { day_id: day.id, status: "pending" }, 
            order: [['startTime', 'ASC']] 
        });
        if(pendingSlots.length === 0){
            return res.status(404).json({ message: "No pending slots found for this itinerary" });
        }
        res.status(200).json({ message: "Pending slots found", pendingSlots });
    }
    catch(e){
        console.error("Get pending slots error", e);
        res.status(500).json({ message: "Internal server error" });
    }
}