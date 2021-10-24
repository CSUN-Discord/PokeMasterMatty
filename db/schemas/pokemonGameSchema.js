const mongoose = require("mongoose");
const { Schema } = mongoose;

//database table for movies

const pokemonGameSchema = new Schema({
  guildId: String,
  gameChannel: String,
  playing: Boolean,
});

module.exports = mongoose.model("pokemonGame", pokemonGameSchema);
