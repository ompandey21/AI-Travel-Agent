const { HiddenGemData, UserAuth, HiddenGemVote } = require("../../config/db");

exports.createHiddenGem = async(req, res) =>{
    try{
        const{name, latitude, longitude, city} = req.body;
        const user_id = req.user && req.user.id;
        const findGem = await HiddenGemData.findOne({where: {latitude, longitude}});
        if(findGem){
            return res.status(400).json({message: "This location is already added as hidden gem"});
        }
        const createGem = await HiddenGemData.create({name, latitude, longitude, city, added_by:user_id});
        res.status(201).json({message: "Location added successfully as hidden gem", createGem});
    }
    catch(e){
        console.error("Internal server error", e);
        res.status(500).json({message: "Internal server error"});
    }
}

exports.readAllHiddenGems = async(req, res) =>{
    try{
        const allGems = await HiddenGemData.findAll();
        if(allGems.length === 0){
            return res.status(404).json({message: "No location is added as hidden gem"});
        }
        res.status(200).json(allGems);
    }
    catch(e){
        console.error("Internal server error", e);
        res.status(500).json({message: "Internal server error"});
    }
}

exports.readHiddenGemById = async(req, res) =>{
    try{
        const {gemId} = req.params;
        const gem = await HiddenGemData.findByPk(gemId);
        if(!gem){
            return res.status(404).json({message: "Hidden gem not found"});
        }
        res.status(200).json(gem);
    }
    catch(e){
        console.error("Internal server error", e);
        res.status(500).json({message: "Internal server error"});
    }
}

exports.upvoteHiddenGem = async(req, res) =>{
    try{
        const {gemId} = req.params;
        const gem = await HiddenGemData.findByPk(gemId);
        if(!gem){
            return res.status(404).json({message: "Hidden gem not found"});
        }
        if(req.user.id === gem.added_by){
            return res.status(403).json({message: "You cannot upvote your own hidden gem"});
        }
        const existing = await HiddenGemVote.findOne({ where: { userId: req.user.id, gemId } });
        if (existing && existing.voteType === 'up') {
            return res.status(400).json({ message: "You have already upvoted this hidden gem" });
        }

        if (existing && existing.voteType === 'down') {
            await existing.update({ voteType: 'up' });
            await HiddenGemData.increment('up_vote', { where: { id: gemId } });
            await HiddenGemData.decrement('down_vote', { where: { id: gemId } });
        } else if (!existing) {
            await HiddenGemVote.create({ userId: req.user.id, gemId, voteType: 'up' });
            await HiddenGemData.increment('up_vote', { where: { id: gemId } });
        }

        res.status(200).json({message: "Hidden gem upvoted successfully"});
    }
    catch(e){
        console.error("Internal server error", e);
        res.status(500).json({message: "Internal server error"});
    }
}

exports.downvoteHiddenGem = async(req, res) =>{
    try{
        const {gemId} = req.params;
        const gem = await HiddenGemData.findByPk(gemId);
        if(!gem){
            return res.status(404).json({message: "Hidden gem not found"});
        }
        if(req.user.id === gem.added_by){
            return res.status(403).json({message: "You cannot downvote your own hidden gem"});
        }
        const existing = await HiddenGemVote.findOne({ where: { userId: req.user.id, gemId } });
        if (existing && existing.voteType === 'down') {
            return res.status(400).json({ message: "You have already downvoted this hidden gem" });
        }

        if (existing && existing.voteType === 'up') {
            await existing.update({ voteType: 'down' });
            await HiddenGemData.increment('down_vote', { where: { id: gemId } });
            await HiddenGemData.decrement('up_vote', { where: { id: gemId } });
        } else if (!existing) {
            await HiddenGemVote.create({ userId: req.user.id, gemId, voteType: 'down' });
            await HiddenGemData.increment('down_vote', { where: { id: gemId } });
        }

        res.status(200).json({message: "Hidden gem downvoted successfully"});
    }
    catch(e){
        console.error("Internal server error", e);
        res.status(500).json({message: "Internal server error"});
    }
}