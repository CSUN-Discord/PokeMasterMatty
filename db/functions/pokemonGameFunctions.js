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
                            playing: false,
                            spawnTime: 0,
                        },
                    },
                    {
                        upsert: true,
                    }
                )
                .exec();
        } catch (e) {
            console.error("Error setting game channel:", e);
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
            console.error("Error setting playing status:", e);
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
            console.error("Error fetching Pokemon document:", e);
        }
    },

    resetTimer: async function (guildId, timer = null) {
        try {
            const document = await module.exports.getPokemonDocument(guildId);
            if (!document) {
                throw new Error("Guild document not found.");
            }
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
            console.error("Error resetting timer:", e);
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
            console.error("Error resetting messages:", e);
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
            console.error("Error setting timer:", e);
        }
    },

    resetAllGames: function () {
        try {
            pokemonGameSchema
                .updateMany(
                    {}, {
                        $set: {
                            playing: false,
                            messageCounter: 0,
                            spawnTime: 0,
                        }
                    }, (err, res) => {
                        if (err) console.error("Error resetting all games:", err);
                        else console.log(`Reset ${res.modifiedCount} games.`)
                    });
        } catch (e) {
            console.error("Error resetting all games:", e);
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
            console.error("Error incrementing message counter:", e);
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
            console.error("Error setting spawned Pokemon:", e);
        }
    },

    getPlaying: async function (guildId) {
        try {
            const document = await this.getPokemonDocument(guildId);
            return document ? document.playing : false;
        } catch (e) {
            console.error("Error getting playing status:", e);
            return false;
        }
    },

    correctChannel: async function (guildId, channelId) {
        try {
            const document = await this.getPokemonDocument(guildId);
            return document ? document.gameChannel === channelId : false;
        } catch (e) {
            console.error("Error checking correct channel:", e);
            return false;
        }
    },
}