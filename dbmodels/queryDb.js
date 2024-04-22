const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const searchSchema = new Schema({
    query: String,
    result: {
        query: String,
        data: Object,
        image: Object
    },
    file: {
        url: String,
        filename: String,
    },
});


const search = mongoose.model('search', searchSchema);
module.exports = search;
