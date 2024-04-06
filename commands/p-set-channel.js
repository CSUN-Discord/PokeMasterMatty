/*
This command starts a pokemon game in the server
*/

const {SlashCommandBuilder} = require("@discordjs/builders");
const pokemonGameFunctions = require("../db/functions/pokemonGameFunctions");
const {cancelJob} = require("../commands/p-start");
const {PermissionsBitField} = require("discord.js");

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
     *
     * @param interaction
     * @returns {Promise<void>}
     */
    async execute(interaction) {

        const channelId = interaction.options.getString("channel-id")

        //stop previous game

        cancelJob();
        await pokemonGameFunctions.setPlaying(interaction.guild.id, false);

        await pokemonGameFunctions.setGameChannel(interaction.guild.id, channelId);
        interaction.reply({
            content: "A game channel has been set. Start the game with: \n```/p-start```",
            ephemeral: true
        });
    },
};
