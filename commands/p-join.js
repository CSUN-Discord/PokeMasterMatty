/*
This command adds a user to the game
*/

const {SlashCommandBuilder} = require("@discordjs/builders");
const pokemonGameFunctions = require("../db/functions/pokemonGameFunctions");
const trainerFunctions = require("../db/functions/trainerFunctions");
const {ActionRowBuilder, ButtonBuilder, PermissionsBitField, MessageFlags} = require("discord.js");
const pokemonFunctions = require("../globals/pokemonFunctions");
const pokemonListFunctions = require("../db/functions/pokemonListFunctions");

// Constants for Pokémon IDs and their names
const STARTER_POKEMONS = {
    bulbasaur: 1,
    charmander: 4,
    squirtle: 7,
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("p-join")
        .setDescription("Adds a user to the game."),
    permission: [PermissionsBitField.Flags.SendMessages],

    /**
     * Command execution to add a user to the game.
     * @param {import("discord.js").Interaction} interaction - The interaction object.
     * @returns {Promise<Message>}
     */
    async execute(interaction) {

        const user = await trainerFunctions.getUser(interaction.user.id);
        if (user != null) {
            return interaction.reply({
                content: "You are already in the game.",
                flags: MessageFlags.Ephemeral
            });
        }

        if (!await pokemonGameFunctions.correctChannel(interaction.guild.id, interaction.channel.id)) {
            return interaction.reply({
                content: "Incorrect game channel.",
                flags: MessageFlags.Ephemeral
            });
        }

        const row = createStarterButtonRow(interaction.user.id);

        await interaction.reply({
            content: "Choose your starter.",
            components: [row],
            flags: MessageFlags.Ephemeral
        })

        const filter = i => i.user.id === interaction.user.id;
        const starterCollector = interaction.channel.createMessageComponentCollector({filter, time: 60000});

        starterCollector.on("collect", async (i) => {
            const selectedPokemonId = getSelectedPokemonId(i.customId);

            if (selectedPokemonId) {
                await handlePokemonSelection(i, selectedPokemonId);
            }
        });

        starterCollector.on("end", async () => {
            await interaction.editReply({content: "You took too long to respond.", components: []});
        });
    },
};

/**
 * Creates the row with starter Pokémon buttons.
 * @param {string} userId - The ID of the user.
 * @returns {ActionRowBuilder} - The row containing the buttons.
 */
function createStarterButtonRow(userId) {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`${userId}bulbasaur`)
            .setLabel("Bulbasaur")
            .setStyle("Success"),
        new ButtonBuilder()
            .setCustomId(`${userId}charmander`)
            .setLabel("Charmander")
            .setStyle("Danger"),
        new ButtonBuilder()
            .setCustomId(`${userId}squirtle`)
            .setLabel("Squirtle")
            .setStyle("Primary")
    );
}

/**
 * Extracts the Pokémon ID based on the button custom ID.
 * @param {string} customId - The custom ID from the button click.
 * @returns {number|null} - The Pokémon ID or null if invalid.
 */
function getSelectedPokemonId(customId) {
    const match = Object.keys(STARTER_POKEMONS).find(pokemon => customId.includes(pokemon));
    return match ? STARTER_POKEMONS[match] : null;
}

/**
 * Handles the Pokémon selection and updates the user in the game.
 * @param {import("discord.js").Interaction} interaction - The interaction object from button click.
 * @param {number} pokemonId - The selected Pokémon's ID.
 * @returns {Promise<void>}
 */
async function handlePokemonSelection(interaction, pokemonId) {
    try {
        const selectedPokemon = await pokemonListFunctions.getPokemonFromId(pokemonId);
        const userPokemon = await pokemonFunctions.createStarterPokemonDetails(10, selectedPokemon, interaction.user);

        // Add the selected Pokémon to the user's collection
        await trainerFunctions.addPokemonToUser(interaction.user, userPokemon);

        // Update the user after selection
        await interaction.update({
            content: "You have been added to the game. Use /p-present for a goodie bag.",
            components: [],
        });
    } catch (error) {
        console.error("Error handling Pokémon selection:", error);
        await interaction.update({
            content: "There was an error while processing your selection. Please try again.",
            components: [],
        });
    }
}
