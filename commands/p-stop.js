/*
This command sends a simple message to check if the bot is active
*/

const {SlashCommandBuilder} = require("@discordjs/builders");
const {cancelJob} = require("../commands/p-start");
const {PermissionsBitField} = require("discord.js");
const pokemonGameFunctions = require("../db/functions/pokemonGameFunctions");
module.exports = {
    data: new SlashCommandBuilder()
        .setName("p-stop")
        .setDescription("Stops the current game."),
    permission: [PermissionsBitField.Flags.Administrator],

    /**
     *
     * @param interaction
     * @returns {Promise<void>}
     */
    async execute(interaction) {
        cancelJob();
        await pokemonGameFunctions.setPlaying(interaction.guild.id, false);

        interaction.reply({
            content: "Game has ended.",
            ephemeral: true
        });
    },
};
