const Joi = require("joi");
const bcrypt = require("bcrypt");
const User = require("../models/User.model");
const { generateJwtToken } = require("../JWT");
const jwt = require('jsonwebtoken');

const loginSchema = Joi.object({
    email: Joi.string().email(),
    mobile: Joi.number(),
    password: Joi.string().required(),
});

const logInUser = async (req, res) => {
    try {
        const { error } = loginSchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                message:
                    error.details[0].message || "An error occurred during validation",
                payload: null,
            });
        }

        const { mobile, password, email } = req.body;

        if (!mobile && !email) {
            return res.status(400).json({ message: "mobile or email is required" });
        }

        const user = await User.findOne({ $or: [{ mobile }, { email }] });

        if (!user) {
            return res.status(401).json({
                message: "Invalid mobile or Email",
                email,
                mobile,
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        const isEmailVerified = user.isEmailVerified;

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid mobile or Email or password or not a user",
                email,
                mobile,
                password,
            });
        }
        // if (!isEmailVerified) {
        //   return res.status(401).json({ message: "Email not verified" });
        // }
        const payload = {
            name: user.name,
            mobile: user.mobile,
            email: user.email,
            _id: user.id,
            role: user.role
        };

        const token = generateJwtToken(payload);

        res.status(200).json({ message: "Login successful", token, user: payload });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || "An error occurred" });
    }
};

const registerUserSchema = Joi.object({
    name: Joi.string().required(),
    mobile: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    role: Joi.string().required(),
    count: Joi.number()
});

const registerUser = async (req, res) => {
    try {
        const { error } = registerUserSchema.validate(req.body);

        if (error) {
            console.error(error);
            return res.status(400).json({
                payload: null,
                message:
                    error.details[0].message || "An error occurred during validation",
            });
        }

        const { name, mobile, email, password, role } = req.body;
        const userExistsWithMobile = await User.findOne({ mobile });
        const userExistsWithEmail = await User.findOne({ email });

        if (userExistsWithEmail) {
            return res.status(409).json({
                payload: null,
                message: "Looks like your Email already Exists.",
            });
        }

        if (userExistsWithMobile) {
            return res.status(407).json({
                payload: null,
                message: "Looks like your mobile already Exists.",
            });
        }

        // Generate a hash for the user's password
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            mobile,
            email,
            password: hashedPassword, // Use the hashed password
            role,
        });

        const payload = {
            name: newUser.name,
            email: newUser.email,
            _id: newUser.id,
            userCount: newUser.userCount,
            mobile: newUser.mobile
        };
        const token = generateJwtToken(payload);
        return res.status(201).json({
            message: "User created successfully",
            payload,
            userId: newUser.id,
            token,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            payload: null,
            message: error.message || "An error occurred",
        });
    }
};


module.exports = {
    registerUser,
    logInUser,
};