/*
This command allows users to swap, view, deposit their team pokemon
*/

const {SlashCommandBuilder} = require("@discordjs/builders");
const {MessageEmbed} = require("discord.js");

// const battlingFunctions = require("../db/functions/battlingFunctions");
const trainerFunctions = require("../db/functions/trainerFunctions");
const pokemonGameFunctions = require("../db/functions/pokemonGameFunctions");
const battlingFunctions = require("../db/functions/battlingFunctions");
const pokemonFunctions = require("../globals/pokemonFunctions");
const emojiListFunctions = require("../db/functions/emojiListFunctions");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("p-team")
        .setDescription("Manage your current pokemon team"),
    permission: ["SEND_MESSAGES"],

    /**
     *
     * @param interaction
     * @returns {Promise<void>}
     */
    async execute(interaction) {

        const user = await trainerFunctions.getUser(interaction.user.id);
        if (user == null)
            return interaction.editReply({
                content: "You need to join the game. (/p-join)",
                ephemeral: true
            });

        if (!await pokemonGameFunctions.correctChannel(interaction.guild.id, interaction.channel.id))
            return interaction.editReply({
                content: "Incorrect game channel.",
                ephemeral: true
            });

        if (await battlingFunctions.getBattleFromUserId(interaction.user.id).length > 0)
            return interaction.editReply({
                content: `Finish your battle first.`,
                ephemeral: true
            });

        let pokemonTeam = new MessageEmbed()
            .setColor('RANDOM')
            .setTitle(`Current Pokemon team:`)
            .setTimestamp()

        for (let i = 0; i < user.team.length; i++) {
            const currentPokemon = user.team[i];
            const pokemonHpMultiplier = Math.round(pokemonFunctions.multiplierCalculation(currentPokemon.evLevels.hp));
            const pokemonElb = Math.round(pokemonFunctions.elbCalculation(currentPokemon.base.hp, pokemonHpMultiplier, currentPokemon.level));
            const maxHP = Math.round(pokemonFunctions.hpCalculation(currentPokemon.level, currentPokemon.base.hp, pokemonElb));
            let currentHP = maxHP - currentPokemon.damageTaken;

            const result = await emojiListFunctions.getNormalGif(currentPokemon.pokeId)
            pokemonTeam.addField(`${i + 1}) ${result} ${currentPokemon.name}`, `Level: ${currentPokemon.level}\n Health: ${currentHP}/${maxHP}`, true);
        }

        interaction.reply({
            embeds: [pokemonTeam]
        })
    },
};
