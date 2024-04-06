/*
event that listens for message creation
 */

const pokemonGameFunctions = require("../db/functions/pokemonGameFunctions");
const trainerFunctions = require("../db/functions/trainerFunctions");
module.exports = {
    name: "messageCreate",

    /**
     *
     * @param message
     * @returns {Promise<void>}
     */
    async execute(message) {
        if (message.author.bot) return;

        try {
            if (!(await pokemonGameFunctions.getPlaying(message.guild.id))) return;

            const user = await trainerFunctions.getUser(message.author.id);
            if (user == null) return;

            await pokemonGameFunctions.incrementMessageCounter(message.guild.id);
        } catch (e) {
            console.log("No game started in server")
        }
    },
};
