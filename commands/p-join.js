/*
This command adds a user to the game
*/

const {SlashCommandBuilder} = require("@discordjs/builders");
const pokemonGameFunctions = require("../db/functions/pokemonGameFunctions");
const trainerFunctions = require("../db/functions/trainerFunctions");
module.exports = {
    data: new SlashCommandBuilder()
        .setName("p-join")
        .setDescription("Adds a user to the join."),
    permission: ["SEND_MESSAGES"],

    /**
     *
     * @param interaction
     * @returns {Promise<void>}
     */
    async execute(interaction) {


        if (!(await pokemonGameFunctions.getPlaying(interaction.guild.id))) return interaction.reply({
            content: "A game hasn't been started in this server.",
            ephemeral: true
        });

        const user = await trainerFunctions.getUser(interaction.user.id);
        if (user != null) return interaction.reply({
            content: "You are already in the game.",
            ephemeral: true
        });

        if (!await pokemonGameFunctions.correctChannel(interaction.guild.id, interaction.channel.id)) return interaction.reply({
            content: "Incorrect game channel.",
            ephemeral: true
        });

        await trainerFunctions.addUser(interaction.user);
        return interaction.reply({
            content: "You have been added to the game.",
            ephemeral: true
        });
    },
};
