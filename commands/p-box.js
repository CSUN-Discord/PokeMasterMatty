/*
This command allows users to swap, view, deposit their team pokemon
*/

const {SlashCommandBuilder} = require("@discordjs/builders");
const {
    // AttachmentBuilder,
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

// let boxMin = 0;
// let currentBox = [];
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
     *
     * @param interaction
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
        let currentBox = user.pokebox;

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

                interaction.reply({
                    content: `${sendToTeam[0].nickname || sendToTeam[0].name} was added to your team.`,
                    flags: MessageFlags.Ephemeral
                });
                break;

            case "view":
                //TODO: when showing filtered box results also show the total box number
                // need the pokemon to have a unique id

                const filter_id = options.getInteger('filter_id');
                const filter_name = options.getString('filter_name');
                const filter_rarity = options.getString('filter_rarity');
                const sort_by = options.getString('sort_by');

                const filters = {filter_id, filter_name, filter_rarity, sort_by};
                currentBox = await createBox(user.pokebox, filters);

                const embed = await createBoxEmbed(currentBox, boxMin);
                const rows = createBoxRows();
                const response = await interaction.reply({
                    embeds: [embed],
                    components: rows,
                    flags: MessageFlags.Ephemeral
                });

                const collector = response.createMessageComponentCollector({
                    filter: i => i.user.id === interaction.user.id,
                    time: 600000
                });

                collector.on('collect', async i => {
                    boxMin = updateBoxMin(i.customId, boxMin, currentBox.length);
                    const updatedEmbed = await createBoxEmbed(currentBox, boxMin);
                    await response.edit({embeds: [updatedEmbed], components: rows});
                    await i.deferUpdate();
                });

                collector.on('end', async () => {
                    await interaction.editReply({components: []});
                });

                break;

            default:
                interaction.reply({
                    content: "Couldn't process command.",
                    flags: MessageFlags.Ephemeral
                });
                break;
        }
    },
};

async function createBox(pokebox, filters = {}) {
    const {filter_id, filter_name, filter_rarity, sort_by} = filters;

    try {
        let filteredBox = pokebox.filter(pokemon => {
            return !((filter_id && pokemon.pokeId !== filter_id) || (filter_name && pokemon.name !== filter_name));
        });

        if (filter_rarity) {
            filteredBox = await Promise.all(
                filteredBox.map(async pokemon => {
                    const fullDetails = await pokemonListFunctions.getPokemonFromId(pokemon.pokeId);
                    return fullDetails.spawnRate === filter_rarity ? pokemon : null;
                })
            ).then(results => results.filter(pokemon => pokemon !== null));
        }

        if (sort_by === "reverse") {
            filteredBox.reverse();
        }

        return filteredBox;
    } catch (err) {
        console.error("Error filtering Pokémon box:", err);
        return [];
    }
}

async function createBoxEmbed(currentBox, boxMin) {
    const embed = new EmbedBuilder()
        .setColor('Random')
        .setTitle('Pokemon Box:')
        .setTimestamp();

    const fields = await Promise.all(
        currentBox.slice(boxMin, boxMin + 20).map(async (pokemon, index) => {
            const maxHP = pokemonFunctions.calculatePokemonHP(pokemon);
            const currentHP = maxHP - pokemon.damageTaken;

            const sprite = pokemon.shiny
                ? await emojiListFunctions.getShinyGif(pokemon.pokeId)
                : await emojiListFunctions.getNormalGif(pokemon.pokeId);

            return {
                name: `${boxMin + index + 1}) ${sprite} ${pokemon.nickname || pokemon.name}`,
                value: `Level: ${pokemon.level}\nHealth: ${currentHP}/${maxHP}`,
                inline: true,
            };
        })
    );

    embed.addFields(fields);
    return embed;
}

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

function updateBoxMin(customId, boxMin, total) {
    switch (customId) {
        case 'itemsLeft':
            return Math.max(0, boxMin - 20);
        case 'itemsRight':
            return Math.min(total - 20, boxMin + 20);
        case 'items100Left':
            return Math.max(0, boxMin - 100);
        case 'items100Right':
            return Math.min(total - 20, boxMin + 100);
        case 'itemsFirst':
            return 0;
        case 'itemsLast':
            return Math.max(0, total - 20);
        default:
            return boxMin;
    }
}