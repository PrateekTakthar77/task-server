require('dotenv').config()
const createError = require('http-errors');
const express = require('express');
const { Collection, default: mongoose } = require('mongoose');
const app = express()
const authRouter = require("./routes/Auth.routes");

const MONGO_URL = process.env.MONGO_URL
const PORT = process.env.PORT || 3000

app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// Enable CORS for all origins (you can restrict it to your frontend's origin)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000'); // Replace with your frontend's URL
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use("/api/auth", authRouter);

app.get('/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        message: 'working'
    })
})



app.use(function (req, res, next) {
    next(createError.BadRequest);
});

app.use((err, req, res, next) => {
    res.json({
        message: err.message,
        ok: false,
    }).status(err.status || 500)
})



mongoose.connect(MONGO_URL)
    .then(() => {
        console.log("Database connected succesfully :)");
        app.listen(PORT, (err) => {
            if (err) console.log(err.message)
            console.log('app is running on port', PORT)
        })
    }).catch((error) => {
        console.log("error while connecting to the database ", error);
    })