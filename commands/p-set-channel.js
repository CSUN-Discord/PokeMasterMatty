/*
This command starts a pokemon game in the server
*/

const {SlashCommandBuilder} = require("@discordjs/builders");
const pokemonGameFunctions = require("../db/functions/pokemonGameFunctions");
const {cancelJob} = require("../commands/p-start");
const {MessageFlags, PermissionsBitField} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("p-set-channel")
        .setDescription("Set the channel for the game to be played in.")
        .addStringOption(option =>
            option.setName('channel-id')
                .setDescription('The channel id to set the game in.')
                .setRequired(true)
        ),
    permission: [PermissionsBitField.Flags.Administrator],

    /**
     * Executes the command to set the game channel for the Pokemon game in the server.
     * It stops any previous game and sets the new game channel.
     *
     * @param {import("discord.js").Interaction} interaction - The interaction object representing the slash command.
     * @returns {Promise<void>} - A promise that resolves when the operation is completed.
     */
    async execute(interaction) {
        const channelId = interaction.options.getString("channel-id")

        try {
            // Stop any previous ongoing game and cancel related jobs
            cancelJob();
            await pokemonGameFunctions.setPlaying(interaction.guild.id, false);

            // Set the new game channel for the server
            await pokemonGameFunctions.setGameChannel(interaction.guild.id, channelId);

            // Respond to the user with success message
            await interaction.reply({
                content: "A game channel has been set. Start the game with: \n```/p-start```",
                flags: MessageFlags.Ephemeral
            });
        } catch (error) {
            // Handle any errors and send an error message to the user
            console.error("Error setting game channel:", error);
            await interaction.reply({
                content: "There was an error while setting the game channel. Please try again later.",
                flags: MessageFlags.Ephemeral
            });
        }
    },
};
