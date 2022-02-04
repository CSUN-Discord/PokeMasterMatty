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
    spawnedPokemon: Schema.Types.Mixed,
    temporaryShop: {
        users: Map,
        items: Map,
    }
});

module.exports = mongoose.model("pokemonGame", pokemonGameSchema);
