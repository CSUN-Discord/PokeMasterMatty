const mongoose = require("mongoose");
const {Schema} = mongoose;

//database table for all items

const itemsListSchema = new Schema({
    name: String,
    sprite: String,
    description: String,
    uses: Number,
    usable: Boolean,
    fling: Number,
    category: String,
    purchase: Number,
    sell: Number,
});

module.exports = mongoose.model("itemsList", itemsListSchema);
