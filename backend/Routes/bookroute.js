const express = require("express");
const bookmodel = require("./../Models/book");
const router = express.Router();
const { verifyToken } = require("./../auth/auth");

/**
 * Route to create a new book.
 *
 * @name POST /books
 * @function
 * @memberof module:Routes/Books
 * @inner
 * @param {Object} req - request object.
 * @param {Object} res - response object.
 * @returns {Object} - The created book.
 * @throws {Object} - Error object if the operation fails.
 */
router.post("/", verifyToken, async (req, res) => {
  try {
    const isAdmin = req.decoded.isAdmin;
    if (isAdmin) {
      const { name, author, totalquantity } = req.body;
      const alreadyexits = await bookmodel.findOne({ name });
      if (alreadyexits) {
        return res.status(404).json({ message: "Book already exists" });
      }
      const book = await bookmodel.create({
        name,
        author,
        totalquantity,
        availablequantity: totalquantity,
      });
      res.status(201).json(book);
    } else {
      return res.status(403).json({ message: "Forbidden" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

/**
 * Route to update an existing book by ID.
 *
 * @name PUT /books/:id
 * @function
 * @memberof module:Routes/Books
 * @inner
 * @param {Object} req - request object.
 * @param {Object} res - response object.
 * @returns {Object} - The updated book.
 * @throws {Object} - Error object if the operation fails.
 */
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const isAdmin = req.decoded.isAdmin;
    if (isAdmin) {
      const id = req.params.id;
      const { name, author, totalquantity } = req.body;
      const existingBook = await bookmodel.findOne({ _id: id });

      if (!existingBook) {
        return res.status(404).json({ message: "Book not found" });
      }

      const updatedBook = await bookmodel.findOneAndUpdate(
        { _id: id },
        {
          name,
          author,
          totalquantity: totalquantity + existingBook.totalquantity,
          availablequantity: totalquantity + existingBook.availablequantity,
        },
        { new: true }
      );

      res.status(201).json(updatedBook);
    } else {
      return res.status(403).json({ message: "Forbidden" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

/**
 * Route to get all books.
 *
 * @name GET /books
 * @function
 * @memberof module:Routes/Books
 * @inner
 * @param {Object} req - request object.
 * @param {Object} res - response object.
 * @returns {Array} - Array of books.
 * @throws {Object} - Error object if the operation fails.
 */
router.get("/", verifyToken, async (req, res) => {
  try {
    const book = await bookmodel.find();
    res.status(200).json(book);
  } catch (err) {
    res.status(500).json(err);
  }
});

/**
 * Route to get a book by ID.
 *
 * @name GET /books/:id
 * @function
 * @memberof module:Routes/Books
 * @inner
 * @param {Object} req - request object.
 * @param {Object} res - response object.
 * @returns {Object} - The requested book.
 * @throws {Object} - Error object if the operation fails.
 */
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const id = req.params.id;
    const book = await bookmodel.findOne({ _id: id });
    res.status(200).json(book);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
