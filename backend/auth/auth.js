const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET;
const logger = require('./../logger');

/**
 * Middleware to extract the bearer token from the request headers.
 *
 * @param {Object} req - request object.
 * @param {Object} res - response object.
 * @param {Function} next - next middleware function.
 */
const ensureToken = (req, res, next) => {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(" ");
        const bearerToken = bearer[1];
        req.token = bearerToken;
        logger.info("token is present", { token: req.token });
        next();
    }
    else {
        res.sendStatus(403);
    }
}

/**
 * Middleware to verify the authenticity of the provided token.
 *
 * @param {Object} req - request object with the token.
 * @param {Object} res - response object.
 * @param {Function} next - next middleware function.
 */
const verifyToken = (req, res, next) => {
    jwt.verify(req.token, SECRET_KEY, (err, decoded) => {
        if (err) {
            console.log("verifyerror", err);
            res.sendStatus(403);
        }
        else {
            req.decoded = decoded;
            next();
        }
    })
}

module.exports = { verifyToken, ensureToken };