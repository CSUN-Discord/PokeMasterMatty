const battlingSchema = require("../schemas/battlingSchema");
const trainerFunctions = require("./trainerFunctions");

module.exports = {

    addPokemonRandomEncounter: async function (userId, pokemon) {
        const player = await trainerFunctions.getUser(userId)
        try {
            await battlingSchema
                .findOneAndUpdate(
                    {},
                    {
                        $set: {
                            userOne: player,
                            userOneTeam: player.team,
                            userOneBag: player.bag,
                            userOneCurrentPokemon: 1,
                            userTwoTeam: [pokemon],
                            userTwoCurrentPokemon: 1,
                            battleType: "pokemonRandomEncounter",
                            fleeCount: 0,
                            userTwoStatStage: {
                                atk: 0,
                                def: 0,
                                spAtk: 0,
                                spDef: 0,
                                speed: 0,
                                evasion: 0,
                                accuracy: 0
                            },
                            userOneStatStage: {
                                atk: 0,
                                def: 0,
                                spAtk: 0,
                                spDef: 0,
                                speed: 0,
                                evasion: 0,
                                accuracy: 0
                            },
                            userOneVolatileStatus: {
                                badlyPoisonTurn: 0,
                                sleepTurnLength: 0,
                                bound: {
                                    name: "",
                                    length: 0
                                },
                                escapePrevention: {
                                    name: "",
                                    enabled: false
                                },
                                confusionLength: 0,
                                cursed: false,
                                drowsy: 0,
                                embargoLength: 0,
                                encore: {
                                    moveToRepeat: "",
                                    encoreLength: 0,
                                },
                                flinch: false,
                                healBlockLength: 0,
                                identified: {
                                    name: "",
                                    activated: false,
                                },
                                infatuation: false,
                                leechSeed: false,
                                nightmare: false,
                                perishSongLength: 0,
                                tauntLength: 0,
                                telekinesisLength: 0,
                                torment: {
                                    lastMove: "",
                                    enabled: false
                                },
                                typeChange: "",
                                aquaRing: false,
                                bracing: false,
                                chargingMove: {
                                    name: "",
                                    chargingLength: 0,
                                },
                                centerOfAttention: false,
                                defenseCurl: false,
                                rooting: false,
                                magicCoat: false,
                                magneticLevitationLength: 0,
                                mimicLastOpponentMove: "",
                                minimized: false,
                                protection: false,
                                recharging: {
                                    name: "",
                                    enabled: false,
                                },
                                semiInvulnerable: false,
                                substituteHP: 0,
                                takingAim: 0,
                                thrashing: {
                                    name: "",
                                    length: 0
                                },
                                transformed: false,
                            },
                            userTwoVolatileStatus: {
                                badlyPoisonTurn: 0,
                                sleepTurnLength: 0,
                                bound: {
                                    name: "",
                                    length: 0
                                },
                                escapePrevention: {
                                    name: "",
                                    enabled: false
                                },
                                confusionLength: 0,
                                cursed: false,
                                drowsy: 0,
                                embargoLength: 0,
                                encore: {
                                    moveToRepeat: "",
                                    encoreLength: 0,
                                },
                                flinch: false,
                                healBlockLength: 0,
                                identified: {
                                    name: "",
                                    activated: false,
                                },
                                infatuation: false,
                                leechSeed: false,
                                nightmare: false,
                                perishSongLength: 0,
                                tauntLength: 0,
                                telekinesisLength: 0,
                                torment: {
                                    lastMove: "",
                                    enabled: false
                                },
                                typeChange: "",
                                aquaRing: false,
                                bracing: false,
                                chargingMove: {
                                    name: "",
                                    chargingLength: 0,
                                },
                                centerOfAttention: false,
                                defenseCurl: false,
                                rooting: false,
                                magicCoat: false,
                                magneticLevitationLength: 0,
                                mimicLastOpponentMove: "",
                                minimized: false,
                                protection: false,
                                recharging: {
                                    name: "",
                                    enabled: false,
                                },
                                semiInvulnerable: false,
                                substituteHP: 0,
                                takingAim: 0,
                                thrashing: {
                                    name: "",
                                    length: 0
                                },
                                transformed: false,
                            },
                        },
                    },
                    {
                        upsert: true,
                    }
                )
                .exec();
        } catch (e) {
            console.log(e);
        }
    },

    getBattleFromUserId: async function (userId) {
        try {
            return await battlingSchema
                .find(
                    {
                        'userOne.userId': userId
                    });
        } catch (e) {
            console.log(e);
        }
    },

    deleteAllBattles: function () {
        try {
            battlingSchema
                .deleteMany({},
                    (err, res) => {
                        if (err) console.log(err);
                        else console.log(`Reset ${res.modifiedCount || 0} battles.`)
                    });
        } catch (e) {
            console.log(e);
        }
    },

    deletePVMBattle: function (battleID) {
        try {
            battlingSchema
                .deleteOne({
                        _id: battleID
                    },
                    (err, res) => {
                        if (err) console.log(err);
                    });
        } catch (e) {
            console.log(e);
        }
    },

    setFleeCount: function (battleID, count) {
        try {
            battlingSchema
                .findOneAndUpdate({
                        _id: battleID
                    },
                    {
                        $set: {
                            fleeCount: count
                        }
                    },
                    (err, res) => {
                        if (err) console.log(err);
                    });
        } catch (e) {
            console.log(e);
        }
    },

    updatePokemonRandomEncounterBattle: function (objectId, userOneBag, userOneCurrentPokemon, userOneStatStage, userOneTeam, userOneVolatileStatus, userTwoStatStage, userTwoTeam, userTwoVolatileStatus, userOne) {
        try {
            battlingSchema
                .updateOne({
                        _id: objectId
                    },
                    {
                        userOne: userOne,
                        userOneBag: userOneBag,
                        userOneCurrentPokemon: userOneCurrentPokemon,
                        userOneStatStage: userOneStatStage,
                        userOneTeam: userOneTeam,
                        userOneVolatileStatus: userOneVolatileStatus,
                        userTwoStatStage: userTwoStatStage,
                        userTwoTeam: userTwoTeam,
                        userTwoVolatileStatus: userTwoVolatileStatus
                    },
                    (err, res) => {
                        if (err) console.log(err);
                        else console.log(`Updated ${res.modifiedCount || 0} battles.`)
                    });
        } catch (e) {
            console.log(e);
        }
    }
}