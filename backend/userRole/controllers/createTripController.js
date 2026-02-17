const { TripData, TripMember, UserAuth} = require("../../config/db");
const Crypto = require("crypto");
const sendEmail = require("../../utils/sendMail");
const { Op } = require("sequelize");
const { hashPass } = require("./authController");
const jwt = require("jsonwebtoken");
exports.createTrip = async (req, res) =>{
    try{
        const {name, destination, startDate, endDate, cover_img} = req.body;
        const user_id = req.user && req.user.id;
        const trip = await TripData.create({name, destination, startDate, endDate, cover_img, created_by: user_id});

        const createBy = await UserAuth.findByPk(user_id);
        await TripMember.create({
            userId: user_id,
            tripId: trip.id,
            name: createBy.name,
            email: createBy.email,
            role: "admin",
            status: "accepted"
        })
        res.status(201).json({message: "Trip created successfully", data: trip});
    }
    catch(e){
        console.error("Internal server error", e);
        res.status(500).json({message:"Internal server error"});
    }
}


exports.inviteUser = async (req, res) =>{
    try{
        const {email, role, tripId} = req.body;
        const userId = req.user && req.user.id;
        const findAdmin = await TripMember.findOne({
            where: {
                tripId,
                userId,
                role: "admin",
                status: "accepted"
            }
        });
        if(!findAdmin){
            return res.status(403).json({message: "Not authorized"});
        }
        const randomToken = Crypto.randomBytes(32).toString("hex");
        const placeholderName = (email && email.split('@')[0]) || 'Invited User';
        await TripMember.create(
            {
                tripId,
                email,
                name: placeholderName,
                role,
                status: "invited",
                inviteToken: randomToken,
                inviteExpire: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24hrs
            }
        )
        const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
        const inviteLink = `${FRONTEND_URL.replace(/\/$/, '')}/join-trip?token=${randomToken}`;
        try{
            const trip = await TripData.findByPk(tripId);
            const destination = trip.destination;
            const startDate = new Date(trip.startDate).toLocaleDateString();
            const subject =  `Invitiation to join the trip to ${destination}`;
            const body = `Hi, \n\nYou are invited to join the trip to ${destination} on ${startDate} \n\nClick on the link below to join \n\n${inviteLink}`;
            await sendEmail(email, subject, body);
            return res.status(200).json({ message: "Invitation sent" });
        }
        catch(e){
            console.error('Email send failed :', e && e.message ? e.message : e);
        }
    }
    catch(e){
        console.error("Internal server error", e);
        res.status(500).json({message:"Internal server error"});
    }
}
exports.verifyInvite = async (req, res) =>{
    try{
        const {token} = req.query;
        const findInvite = await TripMember.findOne({
            where: {
                inviteToken: token,
                status: "invited",
                inviteExpire: {
                    [Op.gt]: new Date()
                }
            }
        });
        if(!findInvite){
            return res.status(400).json({ message: "Invalid or expired invite" });
        }
        res.status(200).json({
            email: findInvite.email,
            role: findInvite.role,
            trip: findInvite.tripId
        });

    }
    catch(e){
        console.error("Verify invite error", e);
        res.status(500).json({ message: "Internal server error" });
    }
}

exports.acceptInvite = async (req, res) =>{
    try{
        const {token, name, password} = req.body;
        const invite = await TripMember.findOne({ where: { inviteToken: token } });
        if(!invite){
            return res.status(400).json({ message: 'Invalid invite token' });
        }
        let user = await UserAuth.findOne({ where: { email: invite.email } });
        if(!user){  
            const hashedpass = await hashPass(password);
            user = await UserAuth.create({
                name,
                email: invite.email,
                password: hashedpass
            });
        }
        invite.userId = user.id;
        invite.status = "accepted";
        invite.inviteToken = null;
        invite.inviteExpire = null;
        await invite.save();
        const tokenJwt = jwt.sign({id : user.id}, process.env.JWT_SECRET, {expiresIn: "1h"});
        return res.status(200).json({
            message: "Joined trip successfully",
            token: tokenJwt,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            },
            tripId: invite.tripId
        });
    }
    catch(e){
        console.error("Accept invite error", e);
        res.status(500).json({ message: "Internal server error" });
    }
}

exports.getMembers = async (req, res) => {
    try {
        const { id } = req.params;
        const members = await TripMember.findAll({ where: { tripId: id } });
        res.status(200).json(members);
    } catch (e) {
        console.error('Get members error', e);
        res.status(500).json({ message: 'Internal server error' });
    }
}