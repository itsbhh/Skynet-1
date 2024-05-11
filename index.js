require('dotenv').config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const ejsMate = require("ejs-mate");
const bodyParser = require("body-parser");
const ExpressError = require("./utils/ExpressError.js");
const passport = require("passport");
const localStartegy = require("passport-local");
const flash = require("connect-flash");
const session = require("express-session");
const user = require("./dbmodels/user.js");


const searchRouter = require("./routes/search.js");
const aiRouter = require('./routes/ai.js');
const userRouter = require('./routes/user.js');


app.use(express.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.engine('ejs', ejsMate);


const sessionOption = {
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expiers: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};


app.listen(3000, () => {
    console.log("Server is working");
});


app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStartegy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/skynet');
}

main().then(() => {
    console.log("Connected to DB");
}).catch((err) => {
    console.log(err);
});

app.use("/home", searchRouter);
app.use("/ai", aiRouter);
app.use('/user', userRouter);

app.get("/chart", (req, res) => {
    res.render('chart.ejs');
})

//BASIC ROUTES

app.get('/test', (req, res) => {
    res.render('main/skynetAI.ejs');
})

app.get("/about", (req, res) => {
    res.render("basic/about.ejs");
});

// app.get('/image', async (req, res) => {
//     const images = await getreq();
//     console.log(images);
//     res.render('main/imagesearch.ejs', { images });
// });

app.get("/feedback", (req, res) => {
    res.render("basic/feedback.ejs");
});

app.post("/feedback", async (req, res) => {
    //To Be Written
});

app.get("/privacy", (req, res) => {
    res.render("includes/privacy.ejs");
});


//ERROR Routes
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!!"));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something Went Wrong!!" } = err;
    res.status(statusCode).render("error.ejs", { err });
});
