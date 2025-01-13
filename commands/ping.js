/*
This command sends a simple message to check if the bot is active
*/

const {PermissionsBitField} = require('discord.js');

const {SlashCommandBuilder} = require("@discordjs/builders");
module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Use to check if bot is active"),
    permission: [PermissionsBitField.Flags.SendMessages],

    /**
     * Responds to the /ping command to check bot activity and measure latency.
     *
     * @param {import("discord.js").Interaction} interaction - The interaction object representing the user's command.
     * @returns {Promise<void>} - Resolves when the command execution is complete.
     */
    async execute(interaction) {
        const sent = await interaction.reply({
            content: "Pinging...",
            fetchReply: true,
        });

        await interaction.editReply(
            `\n Roundtrip latency: ${
                sent.createdTimestamp - interaction.createdTimestamp
            }ms \n Websocket heartbeat: ${interaction.client.ws.ping}ms.`
        );
    },
};
