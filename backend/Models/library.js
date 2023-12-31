const mongoose = require('mongoose');

const librarySchema = mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "User"
    },
    book: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "Book"
    },
    duedate:{
        type: Date,
        default: () => new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
    },
    borrowedAt:{
        type: Date,
        default: Date.now 
    },
    returnedAt:{
        type: Date
    }
})

const librarymodel = mongoose.model('Library', librarySchema);
module.exports = librarymodel;