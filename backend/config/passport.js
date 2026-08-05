const GoogleStrategy = require("passport-google-oauth20").Strategy;
const bcrypt = require("bcryptjs");
const { UserAuth } = require("./db");

async function initializePassport(passport){
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URL,
            },
            async (accessToken, refreshToken, profile, done) => {
                try{
                    const user = await UserAuth.findOne({
                        where : { email: profile.emails[0].value },
                    })
                    if(user) return done(null, user);
                    const randomPassword = 
                        Math.random().toString(36).slice(-8) +
                        Math.random().toString(36).slice(-8);

                        const salt = await bcrypt.genSalt(10);
                        const hashedPassword = await bcrypt.hash(randomPassword, salt);

                        const newUser = await UserAuth.create({
                            name: profile.displayName,
                            email: profile.emails[0].value,
                            password: hashedPassword
                        })
                        return done(null, newUser);
                }
                catch(err){
                    console.error(err);
                    return done(err, null);
                }
            }
        )
    )
}

module.exports = initializePassport;