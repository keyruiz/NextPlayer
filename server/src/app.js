const express = require('express')
const session = require('express-session')
const passport = require('./passport')
const authRoutes = require('./routers/authRoutes')

const app = express()

app.use(session({
    secret:process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized:false
}))

app.use(passport.initialize());
app.use(passport.session());

app.use('api/auth', authRoutes)

const PORT =3000;
app.listen(PORT, () => {
    console.log(`Servidor funcionando en http://localhost:${PORT}`)
})