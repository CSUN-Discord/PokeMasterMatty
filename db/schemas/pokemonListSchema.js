const mongoose = require("mongoose");
const {Schema} = mongoose;

//database table for each default pokemon qualities

const pokemonListSchema = new Schema({
    pokeId: Number,
    name: String,
    EVYield: {
        hp: Number,
        atk: Number,
        def: Number,
        spAtk: Number,
        spDef: Number,
        speed: Number
    },
    baseExperience: Number,
    baseFriendship: Number,
    catchRate: Number,
    description: String,
    height: String,
    weight: String,
    levelingRate: String,
    evolution: Number,
    spawnRate: String,
    evolutionType: String,
    //TODO: make the moves a map and refactor all the code this will make it o(1) when moves are checked on each level up
    moves: Schema.Types.Mixed,
    genderPercentage: {
        male: Number,
        female: Number,
    },
    abilities: Array,
    baseStats: {
        hp: Number,
        atk: Number,
        def: Number,
        spAtk: Number,
        spDef: Number,
        speed: Number
    },
    types: Array,
});

module.exports = mongoose.model("pokemonList", pokemonListSchema);
