const express = require("express");
const {
    registerUser,
    logInUser,
} = require("../controllers/Auth");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", logInUser);
module.exports = router;
