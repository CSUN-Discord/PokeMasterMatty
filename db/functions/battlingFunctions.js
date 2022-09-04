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
                            // userOneMove: {
                            //     type: null,
                            //     move: null,
                            //     pokemonSwap: null,
                            //     bag: {
                            //         item: null,
                            //         pokemonTeamNumber: null
                            //     }
                            // },
                            userOneCurrentPokemon: 1,
                            userTwoTeam: [pokemon],
                            userTwoCurrentPokemon: 1,
                            battleType: "pokemonRandomEncounter",
                            fleeCount: 0
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

    updatePokemonRandomEncounterBattle: function (objectId, fleeCount, userOne, userOneBag, userOneCurrentPokemon, userOneStatsStage, userOneTeam, userTwooCurrentPokemon, userTwoStatsStage, userTwoTeam) {
        try {
            battlingSchema
                .updateOne({
                        _id: objectId
                    },
                    {
                        fleeCount: fleeCount,
                        userOne: userOne,
                        userOneBag: userOneBag,
                        userOneCurrentPokemon: userOneCurrentPokemon,
                        userOneStatsStage: userOneStatsStage,
                        userOneTeam: userOneTeam,
                        userTwoCurrentPokemon: userTwooCurrentPokemon,
                        userTwoStatsStage: userTwoStatsStage,
                        userTwoTeam: userTwoTeam
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