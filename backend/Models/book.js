const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    totalquantity:{
        type: Number
    },
    availablequantity:{
        type: Number
    }
})

const bookmodel = mongoose.model('Book', bookSchema);
module.exports = bookmodel;