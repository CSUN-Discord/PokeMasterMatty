/*
This command sends a simple message to check if the bot is active
*/

const { SlashCommandBuilder } = require("@discordjs/builders");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("test")
    .setDescription("Tests things"),
  permission: ["ADMINISTRATOR"],

  /**
   *
   * @param interaction
   * @returns {Promise<void>}
   */
  async execute(interaction) {
    interaction.reply({ content: "pong",  ephemeral: true});
  },
};
