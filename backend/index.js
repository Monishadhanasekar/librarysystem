const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
dotenv.config();
const PORT = process.env.PORT;
const userRouter = require("./Routes/userroute");
const bookRouter = require('./Routes/bookroute');
const libraryRouter = require('./Routes/libraryroute');
const { ensureToken } = require('./auth/auth');
const logger = require('./logger');
const SECRET_KEY = process.env.SECRET;

const app = express();
app.use(express.json());
app.use(cors());


app.use('/users', userRouter);
app.use('/books', ensureToken, bookRouter);
app.use('/library', ensureToken, libraryRouter);

/**
 * Route to handle the home page.
 *
 * @name GET /
 * @function
 * @param {Object} req - request object.
 * @param {Object} res - response object.
 */
app.get('/', (req, res) => {
    logger.log("debug", "Hello, Winston!");
    logger.debug("The is the home '/' route.");
    res.send("welcome!");
})

mongoose.connect(process.env.MONGODBURL)
    .then(() => logger.info("Connected to the database"))
    .catch((err) => logger.error(err.message))

app.listen(PORT, () => {
    logger.info(`connected to port ${PORT}`)
})