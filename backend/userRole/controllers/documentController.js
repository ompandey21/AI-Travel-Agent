const { DocumentVault, TripMember } = require("../../config/db");

async function isTripMember(req, res, tripId) {
    const isMember = await TripMember.findOne({
        where: {
            userId: req.user.id,
            tripId: tripId
        }
    });
    if (!isMember) {
        res.status(403).json({ message: "Forbidden: Not a member of this trip" });
        return false;
    }
    return true;
}

exports.createDoc = async(req, res) =>{
    try{
        const {tripId} = req.params;
        const userId = req.user && req.user.id;
        const {title, description} = req.body;
        const fileUrl = req.file.url;
        const findDoc = await DocumentVault.findOne({where: {fileUrl}});
        if(findDoc){
            return res.status(400).json({message: "Document already uploaded"});
        }
        if (!(await isTripMember(req, res, tripId))) return;
        const doc = await DocumentVault.create({title, description, fileUrl, userId, tripId});
        res.status(201).json({message: "Document uploaded successfully", doc});
    }
    catch(e){
        console.error("Document upload error", e);
        res.status(500).json({ message: "Internal server error" });
    }
}

exports.getAllDocs = async(req, res) =>{
    try{
        const {tripId} = req.params;
        if (!(await isTripMember(req, res, tripId))) return;
        const allDocs = await DocumentVault.findAll({where : {tripId}});
        res.status(200).json(allDocs);
    }
    catch(e){
        console.error("Get documents error", e);
        res.status(500).json({ message: "Internal server error" });
    }
}

exports.getDocById = async(req, res) =>{
    try{
        const {docId} = req.params;
        const findDoc = await DocumentVault.findByPk(docId);
        if(!findDoc){
            return res.status(404).json({message: "Document does not exist"});
        }
        if (!(await isTripMember(req, res, findDoc.tripId))) return;
        res.status(200).json(findDoc);
    }
    catch(e){
        console.error("Get document error", e);
        res.status(500).json({ message: "Internal server error" });
    }
}

exports.updateDoc = async(req, res) =>{
    try{
        const {docId} = req.params;
        const doc = await DocumentVault.findByPk(docId);
        if(!doc){
            return res.status(404).json({message: "Document does not exist"});
        }
        if (!(await isTripMember(req, res, doc.tripId))) return;

        const tripMember = await TripMember.findOne({
            where: {
                userId: req.user.id,
                tripId: doc.tripId
            }
        });
        if(doc.userId !== req.user.id && tripMember.role !== 'admin'){
            return res.status(403).json({message: "Forbidden: Only uploader or trip admin can update"});
        }
        const {title, description} = req.body;
        doc.title = title;
        doc.description = description;
        await doc.save();
        res.status(200).json({message: "Details updated successfully", doc});
    }
    catch(e){
        console.error("Update document error", e);
        res.status(500).json({ message: "Internal server error" });
    }
}

exports.deleteDoc = async(req, res) =>{
    try{
        const {docId} = req.params;
        const doc = await DocumentVault.findByPk(docId);
        if(!doc){
            return res.status(404).json({message: "Document does not exist"});
        }
        if (!(await isTripMember(req, res, doc.tripId))) return;
        
        const tripMember = await TripMember.findOne({
            where: {
                userId: req.user.id,
                tripId: doc.tripId
            }
        });
        if(doc.userId !== req.user.id && tripMember.role !== 'admin'){
            return res.status(403).json({message: "Forbidden: Only uploader or trip admin can delete"});
        }
        await doc.destroy();
        res.status(200).json({message: "Document deleted successfully"});
    }
    catch(e){
        console.error("Delete document error", e);
        res.status(500).json({ message: "Internal server error" });
    }
}