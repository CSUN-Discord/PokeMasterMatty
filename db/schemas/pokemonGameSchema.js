const mongoose = require("mongoose");
const {Schema} = mongoose;

//database table for each pokemon game, 1 per server

const pokemonGameSchema = new Schema({
    guildId: String,
    gameChannel: String,
    guildDefaultTimer: Number,
    playing: Boolean,
    spawnTime: Number,
    messageCounter: Number,
    users: Map,
    spawned: {
        amount: Number,
        pokemon: Schema.Types.Mixed
    }
});

module.exports = mongoose.model("pokemonGame", pokemonGameSchema);
