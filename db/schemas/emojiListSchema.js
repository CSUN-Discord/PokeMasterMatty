const mongoose = require("mongoose");
const {Schema} = mongoose;

//database table for icons with their emoji code

const emojiListSchema = new Schema({
    boxIcon: Map,
    normalGif: Map,
    shinyGif: Map,
    moveType: Map,
    moveCategory: Map
});

module.exports = mongoose.model("emojiList", emojiListSchema);
