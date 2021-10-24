const pokemonGameSchema = require("../schemas/pokemonGameSchema");

module.exports = {
    setGameChannel: async function (guildId, gameChannelId) {
        try {
            await pokemonGameSchema
                .findOneAndUpdate(
                    {
                        guildId: "479412163702685725",
                    },
                    {
                        $set: {
                            gameChannel: gameChannelId
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
                        guildId: "479412163702685725",
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
}