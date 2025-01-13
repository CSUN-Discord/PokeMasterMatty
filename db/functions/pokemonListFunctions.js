const pokemonListSchema = require("../schemas/pokemonListSchema");
const moveListFunctions = require("./moveListFunctions");

module.exports = {
    getAllPokemon: function () {
        try {
            pokemonListSchema
                .find(
                    {}, (err, docs) => {
                        if (err) {
                            console.error("Error getting pokemon list: ", err);
                        } else {
                            docs.forEach((pokemon) => {
                                console.log("checking ", pokemon.name);
                                pokemon.moves.forEach((move) => {
                                    moveListFunctions.getMove(move.name);
                                })
                            })
                        }
                    });
        } catch (e) {
            console.log(e);
        }
    },

    getPokemonFromId: async function (id) {
        try {
            return await pokemonListSchema
                .findOne(
                    {
                        pokeId: id
                    });
        } catch (e) {
            console.error("Error getting pokemon from ID: ", e);
        }
    },

    getPokemonFromRarity: async function (spawnRate) {
        try {
            return await pokemonListSchema
                .find(
                    {
                        spawnRate: spawnRate
                    });
        } catch (e) {
            console.error("Error getting pokemon from rarity: ", e);
        }
    },
}