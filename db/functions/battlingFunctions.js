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
                                    length: 0
                                },
                                confusionLength: 0,
                                cursed: false,
                                drowsy: false,
                                embargoLength: 0,
                                encoreLength: 0,
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
                                chargingLength: 0,
                                centerOfAttention: false,
                                defenseCurl: false,
                                rooting: false,
                                magicCoat: false,
                                magneticLevitationLength: 0,
                                mimicLastOpponentMove: "",
                                minimized: false,
                                protection: false,
                                recharging: false,
                                semiInvulnerable: false,
                                substituteHP: 0,
                                takingAim: false,
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
                                    length: 0
                                },
                                confusionLength: 0,
                                cursed: false,
                                drowsy: false,
                                embargoLength: 0,
                                encoreLength: 0,
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
                                chargingLength: 0,
                                centerOfAttention: false,
                                defenseCurl: false,
                                rooting: false,
                                magicCoat: false,
                                magneticLevitationLength: 0,
                                mimicLastOpponentMove: "",
                                minimized: false,
                                protection: false,
                                recharging: false,
                                semiInvulnerable: false,
                                substituteHP: 0,
                                takingAim: false,
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

    // updatePokemonRandomEncounterBattle: function (objectId, fleeCount, userOne, userOneBag, userOneCurrentPokemon, userOneStatsStage, userOneTeam, userTwooCurrentPokemon, userTwoStatsStage, userTwoTeam) {
    //     try {
    //         battlingSchema
    //             .updateOne({
    //                     _id: objectId
    //                 },
    //                 {
    //                     fleeCount: fleeCount,
    //                     userOne: userOne,
    //                     userOneBag: userOneBag,
    //                     userOneCurrentPokemon: userOneCurrentPokemon,
    //                     userOneStatsStage: userOneStatsStage,
    //                     userOneTeam: userOneTeam,
    //                     userTwoCurrentPokemon: userTwooCurrentPokemon,
    //                     userTwoStatsStage: userTwoStatsStage,
    //                     userTwoTeam: userTwoTeam
    //                 },
    //                 (err, res) => {
    //                     if (err) console.log(err);
    //                     else console.log(`Updated ${res.modifiedCount || 0} battles.`)
    //                 });
    //     } catch (e) {
    //         console.log(e);
    //     }
    // }
}