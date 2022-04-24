if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
const exp = require('constants');
const express = require('express');
const ejsmate = require('ejs-mate')
const req = require('express/lib/request');
const res = require('express/lib/response');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const methodOverride = require("method-override")
const ExpressError = require('./utils/ExpressError');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');
const MongoStore = require('connect-mongo');
const dbUrl = process.env.dbUrl || 'mongodb://localhost:27017/yelp-camp';
const secret = process.env.secret || 'thisisasecret';


const campgroundRoutes = require('./routes/campground.js')
const reviewRoutes = require('./routes/reviews.js')
const userRoutes = require('./routes/users.js');

app.set("view engine", 'ejs');
app.set('views', path.join(__dirname, 'views'))

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db = mongoose.connection;
db.on('error', () => { console.log("Connection Error!") }
);
db.once('open', () => {
    console.log("Database Connected!")
});

app.engine('ejs', ejsmate)
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());

const store = MongoStore.create({
    mongoUrl: dbUrl,
    secret: secret,
    touchAfter: 24 * 3600
})

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})


const sessionConfig = {
    store,
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentuser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/', userRoutes);
app.use('/campground', campgroundRoutes);
app.use('/campground/:id/reviews', reviewRoutes);

app.get('/', (req, res) => {
    currentuser = req.user;
    res.render('Home', { currentuser });
})

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Something went wrong!";
    res.status(statusCode).render('error', { err });
})


app.listen(3000, () => {
    console.log("Serving on the port 3000");
})