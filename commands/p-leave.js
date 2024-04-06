/*
This command deletes a user
*/

const {SlashCommandBuilder} = require("@discordjs/builders");
// const pokemonGameFunctions = require("../db/functions/pokemonGameFunctions");
const trainerFunctions = require("../db/functions/trainerFunctions");
const {ActionRowBuilder, ButtonBuilder, PermissionsBitField} = require("discord.js");
const pokemonFunctions = require("../globals/pokemonFunctions");
const pokemonListFunctions = require("../db/functions/pokemonListFunctions");

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
                ephemeral: true
            });
        } else {
            await trainerFunctions.removeUser(interaction.user.id);
            return interaction.reply({
                content: "Your account is removed.",
                ephemeral: true
            });
        }
    },
};
