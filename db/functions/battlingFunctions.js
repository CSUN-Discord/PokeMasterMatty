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
                            userTwo: pokemon,
                            battleType: "pokemonRandomEncounter"
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

}