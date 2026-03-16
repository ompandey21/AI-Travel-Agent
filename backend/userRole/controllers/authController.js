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
        res.cookie('token', token, {
            httpOnly: true, 
            sameSite: 'strict', 
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 1000 
        });
        res.status(201).json({ message: 'User created successfully', id: user.id, name: user.name, email: user.email });

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
            res.cookie('token', token, { 
                httpOnly: true,
                sameSite: 'lax', 
                secure: process.env.NODE_ENV === 'production', 
                maxAge: 60 * 60 * 1000 
            });
            res.status(200).json({
                message: "Login successfull",
                id: findUser.id,
                name: findUser.name,
                email: findUser.email,
                createdAt: findUser.createdAt
            });
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

exports.forgetPassword = async(req, res) =>{
    try{
        const {email} = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email fields is required." });
        }

        const findUser = await UserAuth.findOne({where: {email}});
        if(!findUser){
            return res.status(404).json({message: "user not found"});
        }

        const resetToken = jwt.sign({email}, jwt_secret, {expiresIn : 120});
        const url = `http://localhost:8080/api/auth/createpassword/${resetToken}`;

        return res.status(200).json({message : "token generated", url});
    }
    catch(e){
        console.error("Internal server error", e);
        res.status(500).json({message : "Internal server error"});
    }
}

exports.createpassword = async(req, res) =>{
    try{
        const {token} = req.params;
        const {password, cpassword} = req.body;
        if(!password || !cpassword){
            return res.status(400).json({ message: "All fields are required" });
        }
        if(password != cpassword){
            return res.status(400).json({ message: "Passwords do not match." });
        }
        const tokenIsValid = jwt.verify(token, jwt_secret);
        if(!tokenIsValid){
            return res.status(401).json({ message: "Invalid or expired token." });
        }
        const user = await UserAuth.findOne({where: {email: tokenIsValid.email}});
        if(!user){
            res.status(404).json({message: "User not found"});
        }
        const hashedPass = await hashPass(password);
        user.password = hashedPass;
        user.save();
        return res.status(200).json({message: "Password updated successfully"});
    }
    catch(e){
        console.error("Internal server error", e);
        res.status(500).json({message : "Internal server error"});
    }
}

exports.logout = async (req, res) => {
    try {
        const cookieOptions = { 
            httpOnly: true, 
            sameSite: 'strict', 
            secure: process.env.NODE_ENV === 'production', 
            path: '/' 
        };
        res.clearCookie('token', cookieOptions);
        res.cookie('token', '', { ...cookieOptions, expires: new Date(0) });
        return res.status(200).json({ message: 'Logged out' });
    } catch (e) {
        console.error('Logout error', e);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

exports.getMe = async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const decoded = jwt.verify(token, jwt_secret);
        const user = await UserAuth.findByPk(decoded.id, { attributes: ['id', 'name', 'email', 'createdAt'] });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json(user);
    } 
    catch (e){
        console.error('Error fetching current user', e);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    hashPass,
    verifyUser,
    createUser: exports.createUser,
    loginUser: exports.loginUser,
    forgetPassword: exports.forgetPassword,
    createpassword: exports.createpassword,
    logout: exports.logout,
    getMe: exports.getMe
}