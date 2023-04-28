/*
This command allows users to swap, view, deposit their team pokemon
*/

const {SlashCommandBuilder} = require("@discordjs/builders");
const {AttachmentBuilder, EmbedBuilder, PermissionsBitField} = require("discord.js");

// const battlingFunctions = require("../db/functions/battlingFunctions");
const trainerFunctions = require("../db/functions/trainerFunctions");
const pokemonGameFunctions = require("../db/functions/pokemonGameFunctions");
const battlingFunctions = require("../db/functions/battlingFunctions");
const pokemonFunctions = require("../globals/pokemonFunctions");
const emojiListFunctions = require("../db/functions/emojiListFunctions");
const itemListFunctions = require("../db/functions/itemListFunctions");
const pokemonListFunctions = require("../db/functions/pokemonListFunctions");
const Filter = require('bad-words');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("p-team")
        .setDescription("Manage your current pokemon team")
        .addSubcommandGroup(subcommandGroup =>
            subcommandGroup
                .setName("pokemon")
                .setDescription(`Commands related to a single pokemon on your team.`)
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('display')
                        .setDescription('Display details on a single pokemon.')
                        .addIntegerOption(option =>
                            option.setName('team_number')
                                .setDescription('Choose the team number of the pokemon.')
                                .setRequired(true)
                                .addChoices(
                                    {name: '1', value: 1},
                                    {name: '2', value: 2},
                                    {name: '3', value: 3},
                                    {name: '4', value: 4},
                                    {name: '5', value: 5},
                                    {name: '6', value: 6},
                                )
                        )
                )
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('set_nickname')
                        .setDescription('Give a pokemon a nickname.')
                        .addIntegerOption(option =>
                            option.setName('team_number')
                                .setDescription('Choose the team number of the pokemon.')
                                .setRequired(true)
                                .addChoices(
                                    {name: '1', value: 1},
                                    {name: '2', value: 2},
                                    {name: '3', value: 3},
                                    {name: '4', value: 4},
                                    {name: '5', value: 5},
                                    {name: '6', value: 6},
                                )
                        )
                        .addStringOption(option =>
                            option.setName('nickname')
                                .setDescription('Nickname of pokemon.')
                                .setRequired(true)
                                .setMinLength(1)
                                .setMaxLength(15)
                        )
                )
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('remove_nickname')
                        .setDescription("Remove a pokemon's nickname.")
                        .addIntegerOption(option =>
                            option.setName('team_number')
                                .setDescription('Choose the team number of the pokemon.')
                                .setRequired(true)
                                .addChoices(
                                    {name: '1', value: 1},
                                    {name: '2', value: 2},
                                    {name: '3', value: 3},
                                    {name: '4', value: 4},
                                    {name: '5', value: 5},
                                    {name: '6', value: 6},
                                )
                        )
                )
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('swap')
                        .setDescription('Swap the positions of pokemon on your team.')
                        .addIntegerOption(option =>
                            option.setName('pokemon_one')
                                .setDescription('First team member to swap.')
                                .setRequired(true)
                                .addChoices(
                                    {name: '1', value: 1},
                                    {name: '2', value: 2},
                                    {name: '3', value: 3},
                                    {name: '4', value: 4},
                                    {name: '5', value: 5},
                                    {name: '6', value: 6},
                                )
                        )
                        .addIntegerOption(option =>
                            option.setName('pokemon_two')
                                .setDescription('Second team member to swap.')
                                .setRequired(true)
                                .addChoices(
                                    {name: '1', value: 1},
                                    {name: '2', value: 2},
                                    {name: '3', value: 3},
                                    {name: '4', value: 4},
                                    {name: '5', value: 5},
                                    {name: '6', value: 6},
                                )
                        )
                )
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('send_to_box')
                        .setDescription('Send a pokemon to your box.')
                        .addIntegerOption(option =>
                            option.setName('team_number')
                                .setDescription('Choose the team number of the pokemon.')
                                .setRequired(true)
                                .addChoices(
                                    {name: '1', value: 1},
                                    {name: '2', value: 2},
                                    {name: '3', value: 3},
                                    {name: '4', value: 4},
                                    {name: '5', value: 5},
                                    {name: '6', value: 6},
                                )
                        )
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('View full team.')
        ),
    permission: [PermissionsBitField.Flags.SendMessages],

    /**
     *
     * @param interaction
     * @returns {Promise<void>}
     */
    async execute(interaction) {
        const user = await trainerFunctions.getUser(interaction.user.id);
        if (user == null)
            return interaction.reply({
                content: "You need to join the game. (/p-join)",
                ephemeral: true
            });

        if (!await pokemonGameFunctions.correctChannel(interaction.guild.id, interaction.channel.id))
            return interaction.reply({
                content: "Incorrect game channel.",
                ephemeral: true
            });

        if (user.battling)
            return interaction.reply({
                content: `Finish your battle first.`,
                ephemeral: true
            });

        // const selectedOption = interaction.options.get('menu').value;

        const {options} = interaction;
        const sub = options.getSubcommand();

        switch (sub) {
            case "view":
                let pokemonTeam = new EmbedBuilder()
                    .setColor('Random')
                    .setTitle(`Current Pokemon team:`)
                    .setTimestamp()

                for (let i = 0; i < user.team.length; i++) {
                    const currentPokemon = user.team[i];
                    const pokemonHpMultiplier = Math.round(pokemonFunctions.multiplierCalculation(currentPokemon.evLevels.hp));
                    const pokemonElb = Math.round(pokemonFunctions.elbCalculation(currentPokemon.base.hp, pokemonHpMultiplier, currentPokemon.level));
                    const maxHP = Math.round(pokemonFunctions.hpCalculation(currentPokemon.level, currentPokemon.base.hp, pokemonElb));
                    let currentHP = maxHP - currentPokemon.damageTaken;

                    let result;
                    if (currentPokemon.shiny)
                        result = await emojiListFunctions.getShinyGif(currentPokemon.pokeId);
                    else
                        result = await emojiListFunctions.getNormalGif(currentPokemon.pokeId);
                    pokemonTeam.addFields([
                        {
                            name: `${i + 1}) ${result} ${currentPokemon.nickname || currentPokemon.name}`,
                            value: `Level: ${currentPokemon.level}\n Health: ${currentHP}/${maxHP}`,
                            inline: true
                        }
                    ])

                }

                interaction.reply({
                    embeds: [pokemonTeam]
                })
                break;
            case "send_to_box":
                const pokemonToReturn = interaction.options.getInteger('team_number');

                if (user.team.length === 1)
                    return interaction.reply({
                        content: `You only have one pokemon left!`,
                        ephemeral: true
                    });

                if (pokemonToReturn > user.team.length)
                    return interaction.reply({
                        content: `Couldn't find the pokemon to send to your pokebox.`,
                        ephemeral: true
                    });

                const sendToBox = user.team.splice(pokemonToReturn - 1, 1);

                // console.log(user.team)

                await trainerFunctions.addPokemonToBox(user.userId, sendToBox[0]);
                await trainerFunctions.setTeam(user.userId, user.team);

                interaction.reply({
                    content: `${sendToBox[0].nickname || sendToBox[0].name} was sent to your pokebox.`,
                    ephemeral: true
                });

                break;
            case "swap":
                const swapPosOne = interaction.options.getInteger('pokemon_one');
                const swapPosTwo = interaction.options.getInteger('pokemon_two');

                if (user.team.length === 1)
                    return interaction.reply({
                        content: `You only have one pokemon!`,
                        ephemeral: true
                    });

                if (swapPosOne > user.team.length || swapPosTwo > user.team.length)
                    return interaction.reply({
                        content: `Couldn't find the pokemon to swap.`,
                        ephemeral: true
                    });

                [user.team[swapPosOne - 1], user.team[swapPosTwo - 1]] = [user.team[swapPosTwo - 1], user.team[swapPosOne - 1]];

                await trainerFunctions.setTeam(user.userId, user.team);

                interaction.reply({
                    content: `${user.team[swapPosOne - 1].nickname || user.team[swapPosOne - 1].name} and ${user.team[swapPosTwo - 1].nickname || user.team[swapPosTwo - 1].name} were swapped.`,
                    ephemeral: true
                });

                break;
            case "display":
                const team_number = interaction.options.getInteger('team_number');

                if (team_number > user.team.length)
                    return interaction.reply({
                        content: `Couldn't find the pokemon to view.`,
                        ephemeral: true
                    });

                let pokemon = user.team[team_number - 1];
                let fullPokemonDetails = await pokemonListFunctions.getPokemonFromId(pokemon.pokeId);

                let result;
                let pokeIcon;

                if (pokemon.shiny) {
                    result = await emojiListFunctions.getShinyGif(pokemon.pokeId);
                    pokeIcon = new AttachmentBuilder(`./media/pokemon/shiny-icons/${pokemon.pokeId}.png`);
                } else {
                    result = await emojiListFunctions.getNormalGif(pokemon.pokeId);
                    pokeIcon = new AttachmentBuilder(`./media/pokemon/normal-icons/${pokemon.pokeId}.png`);
                }

                let pokeBall = await itemListFunctions.getItem(pokemon.ball);
                const ballIcon = new AttachmentBuilder(`./media/items/poke-balls/${pokeBall.sprite}`);

                let pokemonEmbed = new EmbedBuilder()
                    .setColor('Random')
                    .setThumbnail(`attachment://${pokemon.pokeId}.png`)
                    .setAuthor({name: `${user.name}`, iconURL: `${interaction.user.avatarURL()}`})
                    .setDescription(`${fullPokemonDetails.description}`)
                    .setTimestamp(pokemon.receivedTimestamp)
                let pokemonStringDetails = `\n**Height:** ${fullPokemonDetails.height} **Weight:** ${fullPokemonDetails.weight} \n**Held Item:** ${pokemon.item || "nothing"} \n**Friendship:** ${pokemon.friendship} \n**Type:** `;
                for (let i = 0; i < fullPokemonDetails.types.length; i++) {
                    pokemonStringDetails += `• ${fullPokemonDetails.types[i]} `;
                }
                pokemonStringDetails += "\n**Abilities:** "
                for (let i = 0; i < fullPokemonDetails.abilities.length; i++) {
                    pokemonStringDetails += `• ${fullPokemonDetails.abilities[i].name} `;
                }
                pokemonStringDetails += `\n**Nature:** ${pokemon.nature}`

                pokemonEmbed.addFields([
                    {
                        name: '\u200b',
                        value: pokemonStringDetails,
                        inline: false
                    },
                    {
                        name: "Base Stats",
                        value: `**HP:** ${pokemon.base.hp} \n**ATK:** ${pokemon.base.attack} \n**DEF:** ${pokemon.base.defense} \n**SPATK:** ${pokemon.base['special-attack']} \n**SPDEF:** ${pokemon.base['special-defense']} \n**SPEED:** ${pokemon.base.speed}`,
                        inline: true
                    },
                    {
                        name: "IV Stats",
                        value: `**HP:** ${pokemon.ivStats.hp} \n**ATK:** ${pokemon.ivStats.atk} \n**DEF:** ${pokemon.ivStats.def} \n**SPATK:** ${pokemon.ivStats.spAtk} \n**SPDEF:** ${pokemon.ivStats.spDef} \n**SPEED:** ${pokemon.ivStats.speed}`,
                        inline: true
                    },
                    {
                        name: "EV Stats",
                        value: `**HP:** ${pokemon.evLevels.hp} \n**ATK:** ${pokemon.evLevels.atk} \n**DEF:** ${pokemon.evLevels.def} \n**SPATK:** ${pokemon.evLevels.spAtk} \n**SPDEF:** ${pokemon.evLevels.spDef} \n**SPEED:** ${pokemon.evLevels.speed}`,
                        inline: true
                    },
                ])
                const currentMoves = pokemon.currentMoves;

                for (let i = 0; i < currentMoves.length; i++) {
                    pokemonEmbed.addFields([
                        {
                            name: `${currentMoves[i].name}`,
                            value: `${currentMoves[i].flavorText}`
                        },
                        {
                            name: 'PP',
                            value: `${currentMoves[i].currentPP}/${currentMoves[i].pp}`,
                            inline: true
                        },
                    ])
                    if (currentMoves[i].pwr == null)
                        pokemonEmbed.addFields([{name: 'Power', value: `0`, inline: true}])
                    else
                        pokemonEmbed.addFields([{name: 'Power', value: `${currentMoves[i].pwr}`, inline: true}])

                    // let category = await emojiListFunctions.getMoveCategory(currentMoves[i].category);
                    pokemonEmbed.addFields([
                        {
                            name: 'Type',
                            value: `${currentMoves[i].type}`,
                            inline: true
                        },
                        {
                            name: 'Category',
                            value: currentMoves[i].category,
                            inline: true
                        }
                    ])
                }

                const pokemonHpMultiplier = Math.round(pokemonFunctions.multiplierCalculation(pokemon.evLevels.hp));
                const pokemonElb = Math.round(pokemonFunctions.elbCalculation(pokemon.base.hp, pokemonHpMultiplier, pokemon.level));
                const maxHP = Math.round(pokemonFunctions.hpCalculation(pokemon.level, pokemon.base.hp, pokemonElb));
                let currentHP = maxHP - pokemon.damageTaken;

                let levelingRate = fullPokemonDetails.levelingRate;
                let xpNeededForNextLevel = pokemonFunctions.getCurrentTotalXpAtLevel(levelingRate, pokemon.level + 1) - pokemonFunctions.getCurrentTotalXpAtLevel(levelingRate, pokemon.level);


                if (pokemon.male) {
                    pokemonEmbed.setTitle(`♀️ No. ${pokemon.pokeId} ${pokemon.nickname || pokemon.name} ${result} LVL: ${pokemon.level} HP: ${currentHP}/${maxHP} EXP: ${pokemon.exp}/${xpNeededForNextLevel}`);
                } else {
                    pokemonEmbed.setTitle(`♂️ No. ${pokemon.pokeId} ${pokemon.nickname || pokemon.name} ${result} LVL: ${pokemon.level} HP: ${currentHP}/${maxHP} EXP: ${pokemon.exp}/${xpNeededForNextLevel}`);
                }

                if (pokemon.receivedTimestamp === pokemon.caughtTimestamp) {
                    pokemonEmbed.setFooter({
                        iconURL: `attachment://${pokeBall.sprite}`,
                        text: 'Caught',
                    })
                } else {
                    pokemonEmbed.setFooter({
                        iconURL: `attachment://${pokeBall.sprite}`,
                        text: 'Traded',
                    })
                }


                interaction.reply({
                    embeds: [pokemonEmbed],
                    files: [ballIcon, pokeIcon]
                })
                break;
            case "set_nickname":
                const setNickname = interaction.options.getInteger('team_number');
                const nickname = interaction.options.getString('nickname');
                if (setNickname > user.team.length)
                    return interaction.reply({
                        content: `Incorrect team number.`,
                        ephemeral: true
                    });
                let filter = new Filter();
                if (filter.isProfane(nickname))
                    return interaction.reply({
                        content: `Incorrect nickname value.`,
                        ephemeral: true
                    });
                user.team[setNickname - 1].nickname = nickname;
                await trainerFunctions.setTeam(user.userId, user.team);

                interaction.reply({
                    content: `${user.team[setNickname - 1].name}'s nickname was set to ${user.team[setNickname - 1].nickname}.`,
                    ephemeral: true
                });

                break
            case "remove_nickname":
                const removeNickname = interaction.options.getInteger('team_number');
                if (removeNickname > user.team.length)
                    return interaction.reply({
                        content: `Incorrect team number.`,
                        ephemeral: true
                    });
                user.team[removeNickname - 1].nickname = null;
                await trainerFunctions.setTeam(user.userId, user.team);

                interaction.reply({
                    content: `${user.team[removeNickname - 1].name}'s nickname was removed.`,
                    ephemeral: true
                });
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
