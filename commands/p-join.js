/*
This command adds a user to the game
*/

const {SlashCommandBuilder} = require("@discordjs/builders");
const pokemonGameFunctions = require("../db/functions/pokemonGameFunctions");
const trainerFunctions = require("../db/functions/trainerFunctions");
const {ActionRowBuilder, ButtonBuilder, PermissionsBitField} = require("discord.js");
const pokemonFunctions = require("../globals/pokemonFunctions");
const pokemonListFunctions = require("../db/functions/pokemonListFunctions");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("p-join")
        .setDescription("Adds a user to the join."),
    permission: [PermissionsBitField.Flags.SendMessages],

    /**
     *
     * @param interaction
     * @returns {Promise<void>}
     */
    async execute(interaction) {


        // if (!(await pokemonGameFunctions.getPlaying(interaction.guild.id))) return interaction.reply({
        //     content: "A game hasn't been started in this server.",
        //     ephemeral: true
        // });

        const user = await trainerFunctions.getUser(interaction.user.id);
        if (user != null) return interaction.reply({
            content: "You are already in the game.",
            ephemeral: true
        });

        if (!await pokemonGameFunctions.correctChannel(interaction.guild.id, interaction.channel.id)) return interaction.reply({
            content: "Incorrect game channel.",
            ephemeral: true
        });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`${interaction.user.id}bulbasaur`)
                    .setLabel('bulbasaur')
                    .setStyle('Success'),
            )
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`${interaction.user.id}charmander`)
                    .setLabel('charmander')
                    .setStyle('Danger'),
            )
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`${interaction.user.id}squirtle`)
                    .setLabel('squirtle')
                    .setStyle('Primary'),
            );

        interaction.reply({
            content: "Choose your starter.",
            components: [row]
        })

        const filter = i => i.user.id === interaction.user.id;
        const starterCollector = interaction.channel.createMessageComponentCollector({filter, time: 60000});

        starterCollector.on('collect', async i => {
            if (i.customId === `${i.user.id}bulbasaur`) {

                const bulbasaur = await pokemonListFunctions.getPokemonFromId(1);
                const userBulbasaur = await pokemonFunctions.createStarterPokemonDetails(10, bulbasaur, i.user);

                await trainerFunctions.addPokemonToUser(i.user, userBulbasaur);

                await i.update({content: 'You have been added to the game.', components: []});
            } else if (i.customId === `${i.user.id}charmander`) {
                const charmander = await pokemonListFunctions.getPokemonFromId(4);
                const userCharmander = await pokemonFunctions.createStarterPokemonDetails(10, charmander, i.user);

                await trainerFunctions.addPokemonToUser(i.user, userCharmander);

                await i.update({content: 'You have been added to the game.', components: []});
            } else if (i.customId === `${i.user.id}squirtle`) {

                const squirtle = await pokemonListFunctions.getPokemonFromId(7);
                const userSquirtle = await pokemonFunctions.createStarterPokemonDetails(10, squirtle, i.user);

                await trainerFunctions.addPokemonToUser(i.user, userSquirtle);

                await i.update({content: 'You have been added to the game.', components: []});
            }
        });
    },
};
