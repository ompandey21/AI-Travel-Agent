const axios = require("axios");
require('dotenv').config();     

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL = process.env.EMAIL_USER; 

const sendEmail = async (email, subject, body) => {
    try {
        const response = await axios.post(
            'https://api.brevo.com/v3/smtp/email',
            {
                sender: { 
                    name: "Iternation Team", 
                    email: SENDER_EMAIL 
                },
                to: [
                    { 
                        email: email
                    }
                ],
                subject: subject,
                htmlContent: body,
            },
            {
                headers: {
                    'accept': 'application/json',
                    'api-key': BREVO_API_KEY,
                    'content-type': 'application/json'
                }
            }
        );
        
        console.log("Email sent successfully via Brevo HTTP API!");
        return response.data;
    } catch (err) {
        console.error("Brevo API error:", err.response ? err.response.data : err.message);
        throw err;
    }
};

module.exports = sendEmail;