const mongoose = require("mongoose");
const {Schema} = mongoose;

//database table for all trainers

const trainerSchema = new Schema({
    userId: String,
    name: String,
    pokebox: Array,
    team: Array,
    bag: {
        "battle-effect": Map,
        "hold-items": Map,
        "poke-ball": Map,
        miscellaneous: Map,
        recovery: Map,
        vitamins: Map
    },
    storyProgress: String,
    trainerCard: {
        background: String,
        trainerSprite: String
    },
    money: Number,
    battling: Boolean,
    achievements: Map,
    badges: Map,
    trainerBattles: {
        win: Number,
        loss: Number
    },
    npc: {
        win: Number,
        loss: Number
    },
    presentReady: Boolean
});

module.exports = mongoose.model("trainer", trainerSchema);
