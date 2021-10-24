/*
This command sends a simple message to check if the bot is active
*/

const { SlashCommandBuilder } = require("@discordjs/builders");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Use to check if bot is active"),
  permission: ["SEND_MESSAGES"],

  /**
   *
   * @param interaction
   * @returns {Promise<void>}
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
