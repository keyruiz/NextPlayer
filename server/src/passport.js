const passport = require('passport')
const SteamStrategy = require('passport-steam').Strategy
const {handleSteamReturn} = require('./controllers/authController')

passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
    try {
        const pool = require('./db')
        const res = await pool.query('SELECT * FROM users WHERE id = $1', [id])
        done(null, res.rows[0])
    } catch (err){
        done(err, null)
    }
})

passport.use(new SteamStrategy({
    returnURL: `${process.env.BACKEND_URL}/api(auth/steam/return)`,
    realm: `${process.env.BACKEND_URL}/`,
    apikey: process.env.APIKEY
    },
    handleSteamReturn
))

module.exports = passport;