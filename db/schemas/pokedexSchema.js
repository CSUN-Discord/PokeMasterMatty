const mongoose = require("mongoose");
const {Schema} = mongoose;

//database table for all user's pokedex
// pokemon map -> pokemonId  : { seen: boolean, caught: boolean } (key : data)

const pokedexSchema = new Schema({
    userId: String,
    pokemon: Map
});

module.exports = mongoose.model("pokedex", pokedexSchema);
