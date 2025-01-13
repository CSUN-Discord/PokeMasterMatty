/*
This command stops the current game in the server
*/

const {SlashCommandBuilder} = require("@discordjs/builders");
const {cancelJob} = require("../commands/p-start");
const {MessageFlags, PermissionsBitField} = require("discord.js");
const pokemonGameFunctions = require("../db/functions/pokemonGameFunctions");
module.exports = {
    data: new SlashCommandBuilder()
        .setName("p-stop")
        .setDescription("Stops the current game."),
    permission: [PermissionsBitField.Flags.Administrator],

    /**
     * Executes the command to stop the current game in the server.
     * Cancels any related jobs and updates the game state to not playing.
     *
     * @param {import("discord.js").Interaction} interaction - The interaction object representing the slash command.
     * @returns {Promise<void>} - A promise that resolves when the operation is completed.
     */
    async execute(interaction) {
        try {
            // Cancel any ongoing game job, such as timers or scheduled tasks
            cancelJob();

            // Set the game state to 'not playing' in the database
            await pokemonGameFunctions.setPlaying(interaction.guild.id, false);

            // Send confirmation message to the user
            await interaction.reply({
                content: "Game has ended.",
                flags: MessageFlags.Ephemeral
            });
        } catch (error) {
            // Log any errors that occur during the command execution
            console.error("Error stopping the game:", error);

            // Inform the user about the failure
            await interaction.reply({
                content: "There was an error while stopping the game. Please try again later.",
                flags: MessageFlags.Ephemeral
            });
        }
    },
};
