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
    }

}