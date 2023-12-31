const express = require('express');
const librarymodel = require('./../Models/library');
const usermodel = require('./../Models/register');
const bookmodel = require('./../Models/book');
const { verifyToken } = require('../auth/auth');
const router = express.Router();

/**
 * Route to borrow a book.
 *
 * @name POST /library/borrow
 * @function
 * @memberof module:Routes/Library
 * @inner
 * @param {Object} req - request object.
 * @param {Object} res - response object.
 * @returns {Object} - The created borrowing record.
 * @throws {Object} - Error object if the operation fails.
 */
router.post('/borrow', verifyToken, async (req, res) => {
    try {
        const isAdmin = req.decoded.isAdmin;

        if (isAdmin) {
            const { email, name } = req.body;
            const user = await usermodel.findOne({ email });
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            const book = await bookmodel.findOne({ name });

            if (!book) {
                return res.status(404).json({ message: "Book not found" });
            }

            if (book.availablequantity <= 0) {
                return res.status(404).json({ message: "No available copies of the book so unable to borrow" });
            }

            const updatedBook = await bookmodel.findOneAndUpdate(
                { name: book.name },
                { $set: { availablequantity: book.availablequantity - 1 } },
                { new: true }
            );

            if (!updatedBook) {
                return res.status(404).json({ message: "Book not found or not updated" });
            }

            const borrow = await librarymodel.create({
                user: user._id,
                book: updatedBook._id,
                returnedAt: null
            });

            return res.status(201).json(borrow);
        }
        else {
            return res.status(403).json({ message: "Forbidden" });
        }
    }
    catch (err) {
        console.log("catch error", err);
        res.status(500).json(err);
    }
});

/**
 * Route to return a borrowed book.
 *
 * @name POST /library/return
 * @function
 * @memberof module:Routes/Library
 * @inner
 * @param {Object} req - request object.
 * @param {Object} res - response object.
 * @returns {Object} - The updated borrowing record after returning the book.
 * @throws {Object} - Error object if the operation fails.
 */
router.post('/return', verifyToken, async (req, res) => {
    try {
        const { email, name } = req.body;
        const user = await usermodel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const book = await bookmodel.findOne({ name });
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        if (book.availablequantity == book.totalquantity) {
            return res.status(404).json({ message: "Unable to return" });
        }

        const updatedBook = await bookmodel.findOneAndUpdate(
            { name: book.name },
            { $set: { availablequantity: book.availablequantity + 1 } },
            { new: true }
        );

        if (!updatedBook) {
            return res.status(404).json({ message: "Book not found or not updated" });
        }

        const returnedBook = await librarymodel.findOneAndUpdate(
            { user: user._id, book: updatedBook._id, returnedAt: null },
            { returnedAt: Date.now() },
            { new: true }
        );

        return res.status(201).json(returnedBook);
    }
    catch (err) {
        res.status(500).json(err);
    }
})

/**
 * Route to get all transactions of a user.
 *
 * @name GET /library/:userid
 * @function
 * @memberof module:Routes/Library
 * @inner
 * @param {Object} req - request object.
 * @param {Object} res - response object.
 * @returns {Array} - Array of user transactions.
 * @throws {Object} - Error object if the operation fails.
 */
router.get('/:userid', verifyToken, async (req, res) => {
    try {
        const userid = req.params.userid;
        const usertransactions = await librarymodel
            .find({ user: userid })
            .populate('book')
            .populate('user');
        return res.status(200).json(usertransactions);
    }
    catch (err) {
        return res.status(500).json({ message: "Internal server error" });
    }
})

/**
 * Route to get all library transactions.
 *
 * @name GET /library
 * @function
 * @memberof module:Routes/Library
 * @inner
 * @param {Object} req - request object.
 * @param {Object} res - response object.
 * @returns {Array} - Array of all library transactions.
 * @throws {Object} - Error object if the operation fails.
 */
router.get('/', verifyToken, async (req, res) => {
    try {
        const result = await librarymodel.find()
            .populate('book')
            .populate('user');
        return res.status(200).json(result);
    }
    catch (err) {
        console.log("libary error", err);
        return res.status(500).json({ message: "Internal server error" });
    }
})

module.exports = router;