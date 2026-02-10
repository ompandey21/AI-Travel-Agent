const { UserAuth } = require("../../config/db");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const saltRounds = 10;
const jwt_secret = process.env.JWT_SECRET;

async function hashPass(password){
    try{
        const salt = await bcrypt.genSalt(saltRounds);
        const hash = await bcrypt.hash(password, salt);
        return hash;
    }
    catch(e){
        console.error("error hashing password", e);
        throw e;
    }
}

async function verifyUser(plainPass, hashedPass){
    try{
        const match = await bcrypt.compare(plainPass, hashedPass);
        return match;
    }
    catch(e){
        console.error("user not verified", e);
        throw e;
    }
}

exports.createUser = async (req, res) =>{
    try{
        const {name, email, password} = req.body;
        const existUser = await UserAuth.findOne({ where: { email } });
        if(existUser){
            return res.status(400).json({message: "User already created"});
        }
        const hashedPass = await hashPass(password);
        const user = await UserAuth.create({name, email, password: hashedPass});
        const payload = { id: user.id };
        const token = jwt.sign(payload, jwt_secret, { expiresIn: '1h' });
        res.status(201).json({ message: 'User created successfully', token, id: user.id, name: user.name, email: user.email });

    }
    catch(e){
        console.error("error creating user", e.message);
        res.status(500).json({message:`Internal server error ${e.message}`});
    }
}

exports.loginUser = async (req, res) =>{
    try{
        const {email, password} = req.body;
        const findUser = await UserAuth.findOne({ where: { email } });
        if(!findUser){
            return res.status(400).json({message: "user does not exist"});
            
        }
        const match = await verifyUser(password, findUser.password);
        if(match){
            const payLoad = {
                id: findUser.id,
            }
            const token = jwt.sign(
                payLoad,
                jwt_secret,
                {expiresIn: '1h'}
            )
            res.status(200).json(
                {
                    message: "Login successfull",
                    token,
                    id: findUser.id,
                    name: findUser.name,
                    email: findUser.email,
                    createdAt: findUser.createdAt
                }
            )
        }
        else{
            res.status(401).json({message: "Invalid credentials"});
        }
    }
    catch(e){
        console.error("Internal server error", e);
        res.status(500).json({message:"Internal server error"});
    }
}

module.exports = {
    hashPass,
    verifyUser,
    createUser: exports.createUser,
    loginUser: exports.loginUser
}