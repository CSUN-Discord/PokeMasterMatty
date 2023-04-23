const mongoose = require("mongoose");
const {Schema} = mongoose;

//database table for all battles

const battlingSchema = new Schema({
    turnCounter: Number,
    userOne: Schema.Types.Mixed,
    userOneTeam: Array,
    userOneBag: Map,
    userOneCurrentPokemon: Number,
    userTwo: Schema.Types.Mixed,
    userTwoTeam: Array,
    userTwoBag: Map,
    userTwoCurrentPokemon: Number,
    battleType: String,
    fleeCount: Number,
    userOneStatStage: {
        atk: Number,
        def: Number,
        spAtk: Number,
        spDef: Number,
        speed: Number,
        evasion: Number,
        accuracy: Number,
        crit: Number,
    },
    userTwoStatStage: {
        atk: Number,
        def: Number,
        spAtk: Number,
        spDef: Number,
        speed: Number,
        evasion: Number,
        accuracy: Number,
        crit: Number,
    },
    userOneVolatileStatus: {
        badlyPoisonTurn: Number,
        sleepTurnLength: Number,
        bound: {
            name: String,
            length: Number
        },
        escapePrevention: {
            name: String,
            enabled: Boolean
        },
        confusionLength: Number,
        cursed: Boolean,
        drowsy: Number,
        embargoLength: Number,
        encore: {
            moveToRepeat: String,
            encoreLength: Number,
        },
        flinch: Boolean,
        healBlockLength: Number,
        identified: {
            name: String,
            activated: Boolean,
        },
        infatuation: Boolean,
        leechSeed: Boolean,
        nightmare: Boolean,
        perishSongLength: Number,
        tauntLength: Number,
        telekinesisLength: Number,
        torment: {
            lastMove: String,
            enabled: Boolean
        },
        typeChange: String,
        aquaRing: Boolean,
        bracing: Boolean,
        chargingMove: {
            name: String,
            chargingLength: Number,
        },
        centerOfAttention: Boolean,
        defenseCurl: Boolean,
        rooting: Boolean,
        magicCoat: Boolean,
        magneticLevitationLength: Number,
        mimicLastOpponentMove: String,
        minimized: Boolean,
        protection: {
            enabled: Boolean,
            length: Number,
        },
        recharging: {
            name: String,
            enabled: Boolean,
        },
        semiInvulnerable: Boolean,
        substituteHP: Number,
        takingAim: Number,
        thrashing: {
            name: String,
            length: Number
        },
        disable: {
            name: String,
            length: Number
        },
        mistLength: Number,
        transform: {
            enabled: Boolean,
            details: {
                pokeId: Number,
                name: String,
                currentMoves: Schema.Types.Mixed,
                ivStats: Schema.Types.Mixed,
                evLevels: Schema.Types.Mixed,
                base: Schema.Types.Mixed
            }
        },
        counter: Number,
        lightScreenLength: Number,
        reflectLength: Number,
        conversion: Boolean,
        previousMove: String,
        spikes: Boolean,
        destinyBond: Number,
    },
    userTwoVolatileStatus: {
        badlyPoisonTurn: Number,
        sleepTurnLength: Number,
        bound: {
            name: String,
            length: Number
        },
        escapePrevention: {
            name: String,
            enabled: Boolean
        },
        confusionLength: Number,
        cursed: Boolean,
        drowsy: Number,
        embargoLength: Number,
        encore: {
            moveToRepeat: String,
            encoreLength: Number,
        },
        flinch: Boolean,
        healBlockLength: Number,
        identified: {
            name: String,
            activated: Boolean,
        },
        infatuation: Boolean,
        leechSeed: Boolean,
        nightmare: Boolean,
        perishSongLength: Number,
        tauntLength: Number,
        telekinesisLength: Number,
        torment: {
            lastMove: String,
            enabled: Boolean
        },
        typeChange: String,
        aquaRing: Boolean,
        bracing: Boolean,
        chargingMove: {
            name: String,
            chargingLength: Number,
        },
        centerOfAttention: Boolean,
        defenseCurl: Boolean,
        rooting: Boolean,
        magicCoat: Boolean,
        magneticLevitationLength: Number,
        mimicLastOpponentMove: String,
        minimized: Boolean,
        protection: {
            enabled: Boolean,
            length: Number,
        },
        recharging: {
            name: String,
            enabled: Boolean,
        },
        semiInvulnerable: Boolean,
        substituteHP: Number,
        takingAim: Number,
        thrashing: {
            name: String,
            length: Number
        },
        disable: {
            name: String,
            length: Number
        },
        mistLength: Number,
        transform: {
            enabled: Boolean,
            details: {
                pokeId: Number,
                name: String,
                currentMoves: Schema.Types.Mixed,
                ivStats: Schema.Types.Mixed,
                evLevels: Schema.Types.Mixed,
                base: Schema.Types.Mixed
            }
        },
        counter: Number,
        lightScreenLength: Number,
        reflectLength: Number,
        conversion: Boolean,
        previousMove: String,
        spikes: Boolean,
        destinyBond: Number,
    }
});

module.exports = mongoose.model("battling", battlingSchema);
