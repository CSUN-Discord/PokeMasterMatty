const mongoose = require("mongoose");
const {Schema} = mongoose;

//database table for all battles

const battlingSchema = new Schema({
    userOne: Schema.Types.Mixed,
    userOneTeam: Array,
    userOneBag: Map,
    userOneMove: {
        type: String,
        move: String,
        pokemonSwap: Number,
        bag: {
            item: String,
            pokemonTeamNumber: Number
        }
    },
    userOneCurrentPokemon: Number,
    userTwo: Schema.Types.Mixed,
    userTwoTeam: Array,
    userTwoBag: Map,
    userTwoMove: {
        type: String,
        move: String,
        pokemonSwap: Number,
        bag: {
            item: String,
            pokemonTeamNumber: Number
        }
    },
    userTwoCurrentPokemon: Number,
    battleType: String,
    currentTurn: Number,
    fleeCount: Number,
    userOneCurrentMoveStage: Number,
    userTwoCurrentMoveStage: Number,
    userOneStatStage: Array,
    userTwoStatStage: Array,
});

module.exports = mongoose.model("battling", battlingSchema);
