/*
This command allows users to swap, view, deposit their team pokemon
*/

const {SlashCommandBuilder} = require("@discordjs/builders");
const {AttachmentBuilder, EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder} = require("discord.js");

const trainerFunctions = require("../db/functions/trainerFunctions");
const pokemonGameFunctions = require("../db/functions/pokemonGameFunctions");
const pokemonFunctions = require("../globals/pokemonFunctions");
const pokemonListFunctions = require("../db/functions/pokemonListFunctions");
const generalFunctions = require("../globals/generalFunctions");
const emojiListFunctions = require("../db/functions/emojiListFunctions");

let boxMin = 0;
let currentBox = [];
//TODO: use ephemeral: true for commands on the main channel
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

        switch (sub) {
            case "display":
                const box_number = options.getInteger('box_number');

                if (box_number > user.pokebox.length)
                    return interaction.reply({
                        content: `Couldn't find the pokemon to view.`,
                        ephemeral: true
                    });

                let pokemon = user.pokebox[box_number - 1];
                let fullPokemonDetails = await pokemonListFunctions.getPokemonFromId(pokemon.pokeId);

                await pokemonFunctions.createPokemonDetailsEmbed(pokemon, fullPokemonDetails, interaction, user);

                break;
            case "send_to_team":
                const pokemonToSend = options.getInteger("box_number");

                if (pokemonToSend > user.pokebox.length)
                    return interaction.reply({
                        content: `Couldn't find the pokemon to send to your team.`,
                        ephemeral: true
                    });

                if (user.team.length > 5) {
                    return interaction.reply({
                        content: `Team is full.`,
                        ephemeral: true
                    });
                }

                const sendToTeam = user.pokebox.splice(pokemonToSend - 1, 1);
                // console.log(sendToTeam)

                await trainerFunctions.addPokemonToTeam(user.userId, sendToTeam[0]);
                await trainerFunctions.setBox(user.userId, user.pokebox);

                interaction.reply({
                    content: `${sendToTeam[0].nickname || sendToTeam[0].name} was added to your team.`,
                    ephemeral: true
                });
                break;
            case "view":
                const filter_id = options.getInteger('filter_id');
                const filter_name = options.getString('filter_name');
                const filter_rarity = options.getString('filter_rarity');
                const sort_by = options.getString('sort_by');

                boxMin = 0;
                currentBox = user.pokebox;

                await createBox(filter_id, filter_name, filter_rarity, sort_by)
                const embed = await createBoxEmbed();
                const rows = createBoxRows();
                // currentBox.forEach(pokemon => {
                //     console.log(pokemon.name, pokemon.level)
                // })

                const response = await interaction.reply({
                    embeds: [embed],
                    components: rows,
                    ephemeral: true
                });

                const collectorFilter = i => i.user.id === interaction.user.id;
                const collector = response.createMessageComponentCollector({
                    filter: collectorFilter,
                    time: 300//000//3_600_000
                });

                collector.on('collect', async i => {
                    if (i.customId === `itemsLeft`) {
                        boxMin = Math.max(0, boxMin - 20);
                    } else if (i.customId === `itemsRight`) {
                        if (boxMin + 20 < currentBox.length) {
                            boxMin = Math.min(currentBox.length - 20, boxMin + 20);
                        }
                    } else if (i.customId === `items100Left`) {
                        boxMin = Math.max(0, boxMin - 100);
                    } else if (i.customId === `items100Right`) {
                        if (boxMin + 100 < currentBox.length) {
                            boxMin = Math.min(currentBox.length - 20, boxMin + 100);
                        } else {
                            boxMin = Math.max(0, currentBox.length - 20);
                        }
                    } else if (i.customId === `itemsFirst`) {
                        boxMin = 0;
                    } else if (i.customId === `itemsLast`) {
                        boxMin = Math.max(0, currentBox.length - 20);
                    }

                    const embed = await createBoxEmbed();
                    const rows = createBoxRows();
                    await response.edit({
                        embeds: [embed],
                        components: rows,
                        ephemeral: true
                    });
                    await i.deferUpdate()
                });

                //TODO: add an end event to remove all buttons when interactions ends to clean things up
                collector.on('end', async i => {
                    await interaction.editReply({components: []});
                })
                // collector.on('end', async () => {
                //     await response.edit({
                //         components: [],
                //     });
                // });

                break;
            default:
                interaction.reply({
                    content: "Couldn't process command.",
                    ephemeral: true
                });
                break;
        }
    },
};

async function createBox(filter_id = null, filter_name = null, filter_rarity = null, sort_by = null) {
    if (filter_id != null) {
        currentBox = currentBox.filter(pokemon => {
            return pokemon.pokeId === filter_id;
        });
    } else if (filter_name != null) {
        currentBox = currentBox.filter(pokemon => {
            return pokemon.name === filter_name;
        });
    } else if (filter_rarity != null) {
        let tempBox = [];
        for (let i = 0; i < currentBox.length; i++) {
            const pokemon = currentBox[i];
            let fullPokemonDetails = await pokemonListFunctions.getPokemonFromId(pokemon.pokeId);

            // console.log(fullPokemonDetails.spawnRate, filter_rarity)
            if (fullPokemonDetails.spawnRate === filter_rarity) {
                tempBox.push(pokemon);
            }
        }
        currentBox = tempBox;
    }
    if (sort_by != null && sort_by === "reverse") {
        currentBox.reverse();
    }
}

async function createBoxEmbed() {
    let pokemonBoxEmbed = new EmbedBuilder()
        .setColor('Random')
        .setTitle(`Pokemon Box:`)
        .setTimestamp()

    for (let i = boxMin; i < Math.min(boxMin + 20, currentBox.length); i++) {
        const currentPokemon = currentBox[i];
        const pokemonHpMultiplier = Math.round(pokemonFunctions.multiplierCalculation(currentPokemon.evLevels.hp));
        const pokemonElb = Math.round(pokemonFunctions.elbCalculation(currentPokemon.base.hp, pokemonHpMultiplier, currentPokemon.level));
        const maxHP = Math.round(pokemonFunctions.hpCalculation(currentPokemon.level, currentPokemon.base.hp, pokemonElb));
        let currentHP = maxHP - currentPokemon.damageTaken;

        let result;
        if (currentPokemon.shiny)
            result = await emojiListFunctions.getShinyGif(currentPokemon.pokeId);
        else
            result = await emojiListFunctions.getNormalGif(currentPokemon.pokeId);
        pokemonBoxEmbed.addFields([
            {
                name: `${i + 1}) ${result} ${currentPokemon.nickname || currentPokemon.name}`,
                value: `Level: ${currentPokemon.level}\n Health: ${currentHP}/${maxHP}`,
                inline: true
            }
        ])
    }
    return pokemonBoxEmbed;
}

function createBoxRows() {
    let rows = [];
    const arrowOneRow = new ActionRowBuilder();
    arrowOneRow.addComponents(
        new ButtonBuilder()
            .setCustomId(`itemsLeft`)
            .setLabel(`◀`)
            .setStyle('Secondary'),
        new ButtonBuilder()
            .setCustomId(`itemsRight`)
            .setLabel(`▶`)
            .setStyle('Secondary'),
        // new ButtonBuilder()
        //     .setCustomId(`${inp.user.id}back`)
        //     .setLabel(`back`)
        //     .setStyle('Danger'),
    )
    rows.push(arrowOneRow);

    const arrowTenRow = new ActionRowBuilder();
    arrowTenRow.addComponents(
        new ButtonBuilder()
            .setCustomId(`items100Left`)
            .setLabel(`⏪`)
            .setStyle('Secondary'),
        new ButtonBuilder()
            .setCustomId(`items100Right`)
            .setLabel(`⏩`)
            .setStyle('Secondary'),
    )
    rows.push(arrowTenRow);

    const arrowEndsRow = new ActionRowBuilder();
    arrowEndsRow.addComponents(
        new ButtonBuilder()
            .setCustomId(`itemsFirst`)
            .setLabel(`⏮`)
            .setStyle('Secondary'),
        new ButtonBuilder()
            .setCustomId(`itemsLast`)
            .setLabel(`⏭`)
            .setStyle('Secondary'),
    )
    rows.push(arrowEndsRow);

    return rows;
}