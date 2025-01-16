/*
This command allows users to swap, view, deposit their team pokemon
*/

const {SlashCommandBuilder} = require("@discordjs/builders");
const {
    EmbedBuilder,
    PermissionsBitField,
    ActionRowBuilder,
    ButtonBuilder,
    MessageFlags
} = require("discord.js");
const trainerFunctions = require("../db/functions/trainerFunctions");
// const pokemonGameFunctions = require("../db/functions/pokemonGameFunctions");
const pokemonFunctions = require("../globals/pokemonFunctions");
const pokemonListFunctions = require("../db/functions/pokemonListFunctions");
const generalFunctions = require("../globals/generalFunctions");
const emojiListFunctions = require("../db/functions/emojiListFunctions");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("p-box")
        .setDescription("Manage the pokemon in your box")
        .addSubcommand(subcommand =>
            subcommand
                .setName('display')
                .setDescription('Display details on a single pokemon.')
                .addIntegerOption(option =>
                    option.setName('box_number')
                        .setDescription('Choose the box number of the pokemon.')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('send_to_team')
                .setDescription('Send the pokemon to your team.')
                .addIntegerOption(option =>
                    option.setName('box_number')
                        .setDescription('Choose the box number of the pokemon.')
                        .setRequired(true)
                )
        )
        //TODO: Add a grand exchange
        // .addSubcommand(subcommand =>
        //     subcommand
        //         .setName('grand_exchange')
        //         .setDescription("Sell a pokemon on the grand exchange.")
        //         .addIntegerOption(option =>
        //             option.setName('box_number')
        //                 .setDescription('Choose the team number of the pokemon.')
        //                 .setRequired(true)
        //         )
        //         .addIntegerOption(option =>
        //             option.setName('selling_price')
        //                 .setDescription('Choose how much you want to sell the pokemon for.')
        //                 .setRequired(true)
        //         )
        // )
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('View full box.')
                .addIntegerOption(option =>
                    option.setName('filter_id')
                        .setDescription('Filter by a specific pokemon id.')
                        .setRequired(false)
                )
                .addStringOption(option =>
                    option.setName('filter_name')
                        .setDescription('Filter by a specific pokemon name.')
                        .setRequired(false)
                )
                .addStringOption(option =>
                    option.setName('filter_rarity')
                        .setDescription('Filter by pokemon rarity.')
                        .setRequired(false)
                        .addChoices(
                            {name: 'common', value: "common"},
                            {name: 'uncommon', value: 'uncommon'},
                            {name: 'rare', value: 'rare'},
                            {name: 'very rare', value: 'very rare'},
                            {name: 'epic', value: 'epic'},
                        )
                )
                .addStringOption(option =>
                    option.setName('sort_by')
                        .setDescription('Choose sorting preference.')
                        .setRequired(false)
                        .addChoices(
                            {name: '⬆', value: "normal"},
                            {name: '⬇', value: 'reverse'},
                        )
                )
        ),
    permission: [PermissionsBitField.Flags.SendMessages],

    /**
     * Executes the p-box command based on subcommand.
     * @param {import("discord.js").Interaction} interaction - The interaction object.
     * @returns {Promise<void>}
     */
    async execute(interaction) {
        const user = await trainerFunctions.getUser(interaction.user.id);
        if (!await generalFunctions.allowedToUseCommand(user, interaction)) {
            return;
        }

        const {options} = interaction;
        const sub = options.getSubcommand();
        let boxMin = 0;

        switch (sub) {
            case "display":
                const box_number = options.getInteger('box_number');

                if (box_number > user.pokebox.length) {
                    return interaction.reply({
                        content: `Couldn't find the pokemon to view.`,
                        flags: MessageFlags.Ephemeral
                    });
                }

                const pokemon = user.pokebox[box_number - 1];
                const fullPokemonDetails = await pokemonListFunctions.getPokemonFromId(pokemon.pokeId);

                await pokemonFunctions.createPokemonDetailsEmbed(pokemon, fullPokemonDetails, interaction, user);
                break;

            case "send_to_team":
                const pokemonToSend = options.getInteger("box_number");

                if (pokemonToSend > user.pokebox.length) {
                    return interaction.reply({
                        content: `Couldn't find the pokemon to send to your team.`,
                        flags: MessageFlags.Ephemeral
                    });
                }

                if (user.team.length > 5) {
                    return interaction.reply({
                        content: `Team is full.`,
                        flags: MessageFlags.Ephemeral
                    });
                }

                const sendToTeam = user.pokebox.splice(pokemonToSend - 1, 1);
                await trainerFunctions.addPokemonToTeam(user.userId, sendToTeam[0]);
                await trainerFunctions.setBox(user.userId, user.pokebox);

                await interaction.reply({
                    content: `${sendToTeam[0].nickname || sendToTeam[0].name} was added to your team.`,
                    flags: MessageFlags.Ephemeral
                });
                break;

            case "view":
                const filter_id = options.getInteger('filter_id');
                const filter_name = options.getString('filter_name');
                const filter_rarity = options.getString('filter_rarity');
                const sort_by = options.getString('sort_by');

                const filters = {filter_id, filter_name, filter_rarity, sort_by};
                const [filteredBox, originalBoxIndex] = await createBox(user.pokebox, filters);

                const embed = await createBoxEmbed(filteredBox, boxMin, originalBoxIndex);
                const rows = createBoxRows();
                const response = await interaction.reply({
                    embeds: [embed],
                    components: rows,
                    flags: MessageFlags.Ephemeral
                });

                const buttonIds = new Set([
                    'itemsLeft',
                    'itemsRight',
                    'items100Left',
                    'items100Right',
                    'itemsFirst',
                    'itemsLast'
                ]);
                const collector = response.createMessageComponentCollector({
                    filter: i => (i.user.id === interaction.user.id) && buttonIds.has(i.customId),
                    time: 600000
                });

                collector.on('collect', async i => {
                    if (i.customId === `itemsLeft`) {
                        boxMin = Math.max(0, boxMin - 20);
                    } else if (i.customId === `itemsRight`) {
                        if (boxMin + 20 < filteredBox.length) {
                            boxMin = Math.min(filteredBox.length - 20, boxMin + 20);
                        }
                    } else if (i.customId === `items100Left`) {
                        boxMin = Math.max(0, boxMin - 100);
                    } else if (i.customId === `items100Right`) {
                        if (boxMin + 100 < filteredBox.length) {
                            boxMin = Math.min(filteredBox.length - 20, boxMin + 100);
                        } else {
                            boxMin = Math.max(0, filteredBox.length - 20);
                        }
                    } else if (i.customId === `itemsFirst`) {
                        boxMin = 0;
                    } else if (i.customId === `itemsLast`) {
                        boxMin = Math.max(0, filteredBox.length - 20);
                    }


                    const updatedEmbed = await createBoxEmbed(filteredBox, boxMin, originalBoxIndex);
                    await response.edit({embeds: [updatedEmbed], components: rows});
                    try {
                        await i.deferUpdate();
                    } catch (e) {
                        console.error("Couldn't update box", e)
                    }
                });

                collector.on('end', () => {
                    interaction.editReply({
                        components: []
                    });
                });

                break;

            default:
                await interaction.reply({
                    content: "Couldn't process command.",
                    flags: MessageFlags.Ephemeral
                });
                break;
        }
    },
};

/**
 * Filters the Pokémon box based on given filters and sorting preferences.
 * @param {Array} pokebox - The Pokémon box array to filter.
 * @param {Object} filters - An object containing the filtering criteria.
 * @returns {Promise<[Array, Map]>} - A promise that resolves to an array containing:
 *   1. The filtered Pokémon box (Array).
 *   2. A Map of original indices where keys are Pokémon IDs and values are their original positions in the filtered box.
 */
async function createBox(pokebox, filters = {}) {
    let originalBoxIndex = new Map();
    const {filter_id, filter_name, filter_rarity, sort_by} = filters;

    try {
        let filteredBox = pokebox.filter((pokemon, index) => {
            originalBoxIndex.set(pokemon.uniqueId, index);
            return !((filter_id && pokemon.pokeId !== filter_id) || (filter_name && pokemon.name !== filter_name));
        });

        // Check if we need to filter by rarity and do so asynchronously
        if (filter_rarity) {
            filteredBox = await Promise.all(
                filteredBox.map(async (pokemon) => {
                    const fullDetails = await pokemonListFunctions.getPokemonFromId(pokemon.pokeId);
                    return fullDetails.spawnRate === filter_rarity ? pokemon : null;
                })
            ).then(results => results.filter(pokemon => pokemon !== null));
        }

        // Sort by reverse if specified
        if (sort_by === "reverse") {
            filteredBox.reverse();
        }

        // Return as an array containing filteredBox and originalBoxIndex as a Map
        return [
            filteredBox,
            originalBoxIndex
        ];
    } catch (err) {
        console.error("Error filtering Pokémon box:", err);
        return [];
    }
}

/**
 * Creates an embed displaying the Pokémon in the box.
 * @param {Array} currentBox - The filtered or full Pokémon box.
 * @param {number} boxMin - The starting index for the Pokémon to be displayed.
 * @param {Map} originalBoxIndex - The original index of the Pokémon.
 * @returns {Promise<EmbedBuilder>} - The embed object with Pokémon details.
 */
async function createBoxEmbed(currentBox, boxMin, originalBoxIndex) {
    const embed = new EmbedBuilder()
        .setColor('Random')
        .setTitle('Pokemon Box:')
        .setTimestamp();

    const fields = await Promise.all(
        currentBox.slice(boxMin, boxMin + 20).map(async (pokemon, index) => {
            const pokemonHpMultiplier = Math.round(pokemonFunctions.multiplierCalculation(pokemon.evLevels.hp));
            const pokemonElb = Math.round(pokemonFunctions.elbCalculation(pokemon.base.hp, pokemonHpMultiplier, pokemon.level));
            const maxHP = Math.round(pokemonFunctions.hpCalculation(pokemon.level, pokemon.base.hp, pokemonElb));
            let currentHP = maxHP - pokemon.damageTaken;

            const sprite = pokemon.shiny
                ? await emojiListFunctions.getShinyGif(pokemon.pokeId)
                : await emojiListFunctions.getNormalGif(pokemon.pokeId);

            // return {
            //     name: `${boxMin + index + 1}) ${sprite} ${pokemon.nickname || pokemon.name}`,
            //     value: `Level: ${pokemon.level}\nHealth: ${currentHP}/${maxHP}`,
            //     inline: true,
            // };

            return (originalBoxIndex.get(pokemon.uniqueId) === boxMin + index) ?
                {
                    name: `${boxMin + index + 1}) ${sprite} ${pokemon.nickname || pokemon.name}`,
                    value: `Level: ${pokemon.level}\nHealth: ${currentHP}/${maxHP}`,
                    inline: true,
                } :
                {
                    name: `${boxMin + index + 1}) ${sprite} ${pokemon.nickname || pokemon.name}
                    \nOriginal box index: ${originalBoxIndex.get(pokemon.uniqueId) + 1}`,
                    value: `Level: ${pokemon.level}\nHealth: ${currentHP}/${maxHP}`,
                    inline: true,
                };
        })
    );

    embed.addFields(fields);
    return embed;
}

/**
 * Creates the rows of buttons for interacting with the Pokémon box.
 * @returns {ActionRowBuilder[]} - Array of action rows containing buttons.
 */
function createBoxRows() {
    const buttons = [
        {id: 'itemsLeft', label: '◀', style: 'Secondary'},
        {id: 'itemsRight', label: '▶', style: 'Secondary'},
        {id: 'items100Left', label: '⏪', style: 'Secondary'},
        {id: 'items100Right', label: '⏩', style: 'Secondary'},
        {id: 'itemsFirst', label: '⏮', style: 'Secondary'},
        {id: 'itemsLast', label: '⏭', style: 'Secondary'},
    ];

    return buttons.reduce((rows, button, index) => {
        const rowIndex = Math.floor(index / 2); // Two buttons per row
        if (!rows[rowIndex]) rows[rowIndex] = new ActionRowBuilder();
        rows[rowIndex].addComponents(new ButtonBuilder()
            .setCustomId(button.id)
            .setLabel(button.label)
            .setStyle(button.style));
        return rows;
    }, []);
}