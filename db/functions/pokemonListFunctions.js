const pokemonListSchema = require("../schemas/pokemonListSchema");
const moveListFunctions = require("./moveListFunctions");

module.exports = {
    getAllPokemon: function () {
        try {
            pokemonListSchema
                .find(
                    {}, (err, docs) => {
                        if (err) console.log(err)
                        else {
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
}