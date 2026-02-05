const express = require('express')
const passport = require('passport')
const router = express.Router();

router.get('/steam', passport.authenticate('steam'))

router.get('/steam/return',
    passport.authenticate('steam', {failureRedirect: '/'}),
    (req, res) => {
        res.redirect(`${process.env.FRONTEND_URL}`)
    }
)

router.get('/logout', (req, res) =>  {
    req.logout(() => {
        res.redirect(process.env.FRONTEND_URL)
    })
})

module.exports =router