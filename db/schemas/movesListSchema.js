const mongoose = require("mongoose");
const {Schema} = mongoose;

//database table for all pokemon moves

const movesListSchema = new Schema({
    id: Number,
    name: String,
    acc: Number,
    category: String,
    effect_chance: Number,
    flavorText: String,
    pp: Number,
    priority: Number,
    pwr: Number,
    type: String
});

module.exports = mongoose.model("movesList", movesListSchema);
