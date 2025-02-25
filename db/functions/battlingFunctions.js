const battlingSchema = require("../schemas/battlingSchema");
const trainerFunctions = require("./trainerFunctions");

module.exports = {
    addPokemonRandomEncounter: async function (userId, pokemon) {
        const player = await trainerFunctions.getUser(userId);
        const battleData = {
            turnCounter: 1,
            userOne: player,
            userOneTeam: player.team,
            userOneBag: player.bag,
            userOneCurrentPokemon: 1,
            userTwoTeam: [pokemon],
            userTwoCurrentPokemon: 1,
            battleType: "pokemonRandomEncounter",
            fleeCount: 0,
            userOneBattledPokemon: [1],
            userTwoBattledPokemon: [1],
            userTwoStatStage: {
                atk: 0,
                def: 0,
                spAtk: 0,
                spDef: 0,
                speed: 0,
                evasion: 0,
                accuracy: 0,
                crit: 0,
            },
            userOneStatStage: {
                atk: 0,
                def: 0,
                spAtk: 0,
                spDef: 0,
                speed: 0,
                evasion: 0,
                accuracy: 0,
                crit: 0,
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
                protection: {
                    enabled: false,
                    length: 1,
                },
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
                disable: {
                    name: "",
                    length: 0
                },
                mistLength: 0,
                transform: {
                    enabled: false,
                    details: {
                        pokeId: 0,
                        name: "String",
                        currentMoves: {},
                        ivStats: {},
                        evLevels: {},
                        base: {}
                    }
                },
                counter: 0,
                lightScreenLength: 0,
                reflectLength: 0,
                conversion: false,
                previousMove: "",
                spikes: false,
                destinyBond: 0,
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
                protection: {
                    enabled: false,
                    length: 1,
                },
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
                disable: {
                    name: "",
                    length: 0
                },
                mistLength: 0,
                transform: {
                    enabled: false,
                    details: {
                        pokeId: 0,
                        name: "String",
                        currentMoves: {},
                        ivStats: {},
                        evLevels: {},
                        base: {}
                    }
                },
                counter: 0,
                lightScreenLength: 0,
                reflectLength: 0,
                conversion: false,
                previousMove: "",
                spikes: false,
                destinyBond: 0,
            },
        };

        try {
            await battlingSchema.findOneAndUpdate(
                {"userOne.userId": userId},
                {$set: battleData},
                {upsert: true}
            ).exec();
        } catch (e) {
            console.error('Error updating battle:', e);
        }
    },

    getBattleFromUserId: async function (userId) {
        try {
            return await battlingSchema.find({
                'userOne.userId': userId
            });
        } catch (e) {
            console.error('Error fetching battle:', e);
        }
    },

    deleteAllBattles: function () {
        try {
            battlingSchema
                .deleteMany({},
                    (err, res) => {
                        if (err) console.error('Error deleting battles:', e);
                        else console.log(`Reset ${res.modifiedCount || 0} battles.`)
                    });
        } catch (e) {
            console.error('Error deleting battles:', e);
        }
    },

    deletePVMBattle: function (battleID) {
        try {
            battlingSchema
                .deleteOne({
                        _id: battleID
                    },
                    (err, res) => {
                        if (err) console.error('Error deleting PVM battle:', e);
                    });
        } catch (e) {
            console.error('Error deleting PVM battle:', e);
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
                        if (err) console.error('Error setting flee count:', e);
                    });
        } catch (e) {
            console.error('Error setting flee count:', e);
        }
    },

    setTurnCount: function (battleID, count) {
        try {
            battlingSchema
                .findOneAndUpdate({
                        _id: battleID
                    },
                    {
                        $set: {
                            turnCounter: count
                        }
                    },
                    (err, res) => {
                        if (err) console.error('Error setting turn count:', e);
                    });
        } catch (e) {
            console.error('Error setting turn count:', e);
        }
    },

    updatePokemonRandomEncounterBattle: function (objectId, userOneBag, userOneCurrentPokemon, userOneStatStage, userOneTeam, userOneVolatileStatus, userTwoStatStage, userTwoTeam, userTwoVolatileStatus, userOne, userOneBattledPokemon, userTwoBattledPokemon) {
        const updateData = {
            userOne,
            userOneBag,
            userOneCurrentPokemon,
            userOneStatStage,
            userOneTeam,
            userOneVolatileStatus,
            userTwoStatStage,
            userTwoTeam,
            userTwoVolatileStatus,
            userOneBattledPokemon,
            userTwoBattledPokemon
        };

        try {
            battlingSchema
                .updateOne({
                        _id: objectId
                    },
                    {
                        $set: updateData
                    },
                    (err, res) => {
                        if (err) console.log(err);
                        // else console.log(`Updated ${res.modifiedCount || 0} battles.`)
                    });
        } catch (e) {
            console.error('Error updating battle:', e);
        }
    }
}