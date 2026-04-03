const nodemailer = require("nodemailer");

let transporter = null;
if(process.env.EMAIL_USER && process.env.EMAIL_PASS){
    transporter = nodemailer.createTransport({
        service: "gmail",
        auth:{
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
}

async function sendEmail(to, subject, text){
    if(!transporter){
        console.warn("sendEmail: transporter not configured, skipping send to", to);
        return;
    }
    try{
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            text,
        });
        console.log("Email Sent");
    }
    catch(e){
        console.error("sendEmail error:", e && e.message ? e.message : e);
    }
}

module.exports = sendEmail;