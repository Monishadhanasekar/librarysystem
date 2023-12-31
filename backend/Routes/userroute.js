const express = require("express");
const mongoose = require("mongoose");
const Register = require("./../Models/register");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
const { verifyToken } = require('./../auth/auth');
const { ensureToken } = require('./../auth/auth');
const usermodel = require('./../Models/register');
dotenv.config();
const SECRET_KEY = process.env.SECRET;

const router = express.Router();

/**
 * Validates email and password inputs.
 *
 * @param {string} email - User's email.
 * @param {string} password - User's password.
 * @throws {Error} - Throws an error if the inputs are invalid.
 */
const validateInputs = (email, password) => {
    if (!email) {
        throw new Error("EmailId is empty");
    }
    var regex = /^([a-zA-Z0-9_\.\-]+)@([\da-zA-Z\.\-]+)\.([a-zA-Z\.]{2,6})$/;
    const res = email.match(regex);
    if (!res) {
        throw new Error("Invalid email address");
    }
    if (!password) {
        throw new Error("Password is empty");
    }
    if (password.length < 8) {
        throw new Error("Minimum 8 characters");
    }
    if (!/\d/.test(password)) {
        throw new Error("Minimum one number required");
    }
    const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
    if (!specialChars.test(password)) {
        throw new Error("Minimum one special character required");
    }
}

/**
 * Route to create a new user.
 *
 * @name POST /users/register
 * @function
 * @memberof module:Routes/Users
 * @inner
 * @param {Object} req - request object.
 * @param {Object} res - response object.
 * @returns {Object} - Success message on user creation.
 * @throws {Object} - Error object if the operation fails.
 */
router.post('/register', async (req, res) => {
    try {
        const { username, name, email, password, contactno, isAdmin } = req.body;
        try {
            validateInputs(email, password)
        }
        catch (err) {
            return res.status(400).json({ message: err.message })
        }
        const alreadyexists = await Register.findOne({ email });
        if (alreadyexists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await Register.create({
            username: username,
            name: name,
            email: email,
            password: hashedPassword,
            contactno: contactno,
            isAdmin: isAdmin
        })

        return res.status(201).json({ message: "User created successfully" });
    }
    catch (err) {
        console.log("error", err);
        return res.status(500).json({ message: "Something went wrong" });
    }
})

/**
 * Route to authenticate and log in a user.
 *
 * @name POST /users/login
 * @function
 * @memberof module:Routes/Users
 * @inner
 * @param {Object} req - request object.
 * @param {Object} res - response object.
 * @returns {Object} - User details and authentication token.
 * @throws {Object} - Error object if the operation fails.
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const existinguser = await Register.findOne({ email });
        if (!existinguser) {
            return res.status(404).json({ message: "User not found" });
        }

        const matchedPassword = await bcrypt.compare(password, existinguser.password);

        if (!matchedPassword) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ email: existinguser.email, id: existinguser._id, isAdmin: existinguser.isAdmin }, SECRET_KEY);
        return res.status(200).json({ user: existinguser, token: token });
    }
    catch (err) {
        console.log("error", err);
        return res.status(500).json({ message: "Something went wrong" });
    }
})

/**
 * Route to get all users.
 *
 * @name GET /users
 * @function
 * @memberof module:Routes/Users
 * @inner
 * @param {Object} req - request object.
 * @param {Object} res - response object.
 * @returns {Array} - Array of user details.
 * @throws {Object} - Error object if the operation fails.
 */
router.get('/', ensureToken, verifyToken, async (req, res) => {
    try {
        const user = await usermodel.find();
        return res.status(200).json(user);
    }
    catch (err) {
        return res.json(err);
    }
})

/**
 * Route to get a user by ID.
 *
 * @name GET /users/:id
 * @function
 * @memberof module:Routes/Users
 * @inner
 * @param {Object} req - request object.
 * @param {Object} res - response object.
 * @returns {Object} - Details of the requested user.
 * @throws {Object} - Error object if the operation fails.
 */
router.get('/:id', ensureToken, verifyToken, async (req, res) => {
    try {
        const id = req.params.id;
        const user = await usermodel.findOne({ _id: id });
        return res.status(200).json(user);
    }
    catch (err) {
        return res.json(err);
    }
})

/**
 * Route to get details of the authenticated user.
 *
 * @name GET /users/getuser
 * @function
 * @memberof module:Routes/Users
 * @inner
 * @param {Object} req - request object.
 * @param {Object} res - response object.
 * @returns {Object} - Details of the authenticated user.
 * @throws {Object} - Error object if the operation fails.
 */
router.get('/getuser', ensureToken, verifyToken, async (req, res) => {
    try {
        const userId = req.decoded.id;
        const objectId = new mongoose.Types.ObjectId(userId);
        const user = await Register.findOne({ _id: objectId });
        return res.status(200).json({ user: user.fullname });
    } catch (err) {
        return res.status(500).json({ message: "Something went wrong" });
    }
})

module.exports = router; 