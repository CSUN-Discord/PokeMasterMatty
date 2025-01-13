/*
This command deletes a user
*/

const {SlashCommandBuilder} = require("@discordjs/builders");
const trainerFunctions = require("../db/functions/trainerFunctions");
const {MessageFlags, PermissionsBitField} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("p-leave")
        .setDescription("Deletes user's trainer account."),
    permission: [PermissionsBitField.Flags.SendMessages],

    /**
     *
     * @param interaction
     * @returns {Promise<void>}
     */
    async execute(interaction) {

        const user = await trainerFunctions.getUser(interaction.user.id);
        if (user == null) {
            return interaction.reply({
                content: "You are not in the game.",
                flags: MessageFlags.Ephemeral
            });
        } else {
            //TODO: Maybe add a confirmation
            await trainerFunctions.removeUser(interaction.user.id);
            return interaction.reply({
                content: "Your account is removed.",
                flags: MessageFlags.Ephemeral
            });
        }
    },
};
