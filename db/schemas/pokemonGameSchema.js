const mongoose = require("mongoose");
const { Schema } = mongoose;

//database table for movies

const pokemonGameSchema = new Schema({
  guildId: String,
  gameChannel: String,
  guildDefaultTimer: Number,
  playing: Boolean,
  spawnTime: Number,
  messageCounter: Number,
  users: Map
});

module.exports = mongoose.model("pokemonGame", pokemonGameSchema);
