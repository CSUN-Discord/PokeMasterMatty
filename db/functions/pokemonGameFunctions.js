const pokemonGameSchema = require("../schemas/pokemonGameSchema");

module.exports = {
    setGameChannel: async function (guildId, gameChannelId) {
        try {
            await pokemonGameSchema
                .findOneAndUpdate(
                    {
                        guildId: guildId,
                    },
                    {
                        $set: {
                            gameChannel: gameChannelId,
                            guildDefaultTimer: 60000,
                            messageCounter: 0,
                            playing: false
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

    setPlaying: async function (guildId, playing) {
        try {
            await pokemonGameSchema
                .findOneAndUpdate(
                    {
                        guildId: guildId,
                    },
                    {
                        $set: {
                            playing: playing
                        },
                    },
                    {
                        upsert: false,
                    }
                )
                .exec();
        } catch (e) {
            console.log(e);
        }
    },

    getPokemonDocument: async function (guildId) {
        try {
            return await pokemonGameSchema
                .findOne(
                    {
                        guildId: guildId,
                    }
                )
                .exec();
        } catch (e) {
            console.log(e);
        }
    },

    resetTimer: async function (guildId) {
        try {
            const document = await module.exports.getPokemonDocument(guildId)

            try {
                await pokemonGameSchema
                    .findOneAndUpdate(
                        {
                            guildId: guildId,
                        },
                        {
                            $set: {
                                spawnTime: document.guildDefaultTimer
                            },
                        },
                        {
                            upsert: false,
                        }
                    )
                    .exec();
            } catch (e) {
                console.log(e);
            }

        } catch (e) {
            console.log(e);
        }
    },

    resetMessages: async function (guildId) {
        try {
            await pokemonGameSchema
                .findOneAndUpdate(
                    {
                        guildId: guildId,
                    },
                    {
                        $set: {
                            messageCounter: 0
                        },
                    },
                    {
                        upsert: false,
                    }
                )
                .exec();

        } catch (e) {
            console.log(e);
        }
    },

    setTimer: async function (guildId, timer) {
        try {
            await pokemonGameSchema
                .findOneAndUpdate(
                    {
                        guildId: guildId,
                    },
                    {
                        $set: {
                            spawnTime: timer
                        },
                    },
                    {
                        upsert: false,
                    }
                )
                .exec();
        } catch (e) {
            console.log(e);
        }
    },

    resetAllGames: function () {
        try {
            pokemonGameSchema
                .updateMany(
                    {}, {
                        $set: {
                            playing: false,
                            messageCounter: 0
                        }
                    }, (err, res) => {
                        if (err) console.log(err);
                        else console.log(`Reset ${res.modifiedCount} games.`)
                    });
        } catch (e) {
            console.log(e);
        }
    },

    incrementMessageCounter: async function (guildId) {
        try {
            await pokemonGameSchema
                .findOneAndUpdate(
                    {
                        guildId: guildId,
                    },
                    {
                        $inc: {
                            messageCounter: 1
                        },
                    },
                    {
                        upsert: false,
                    }
                )
                .exec();
        } catch (e) {
            console.log(e);
        }
    },

    setSpawned: async function (guildId, pokemon) {
        try {
            await pokemonGameSchema
                .findOneAndUpdate(
                    {
                        guildId: guildId,
                    },
                    {
                        $set: {
                            spawnedPokemon: pokemon
                        },
                    },
                    {
                        upsert: false,
                    }
                )
                .exec();

        } catch (e) {
            console.log(e);
        }
    },

    getPlaying: async function (guildId) {
        try {
            const document = await pokemonGameSchema
                .findOne(
                    {
                        guildId: guildId,
                    })

            return document.playing;
        } catch (e) {
            console.log("Game not started");
        }
    },

    correctChannel: async function (guildId, channelId) {
        const document = await module.exports.getPokemonDocument(guildId)

        return document.gameChannel === channelId;
    }
}