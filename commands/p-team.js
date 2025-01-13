/*
This command allows users to swap, view, deposit their team pokemon
*/

const {SlashCommandBuilder} = require("@discordjs/builders");
const {MessageFlags, EmbedBuilder, PermissionsBitField} = require("discord.js");

const trainerFunctions = require("../db/functions/trainerFunctions");
// const pokemonGameFunctions = require("../db/functions/pokemonGameFunctions");
const pokemonFunctions = require("../globals/pokemonFunctions");
const emojiListFunctions = require("../db/functions/emojiListFunctions");
const pokemonListFunctions = require("../db/functions/pokemonListFunctions");
const Filter = require('bad-words');
const generalFunctions = require("../globals/generalFunctions");

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
        if (!await generalFunctions.allowedToUseCommand(user, interaction)) {
            return;
        }

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
                    const maxHP = pokemonFunctions.calculatePokemonHP(currentPokemon);
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
                    embeds: [pokemonTeam],
                    flags: MessageFlags.Ephemeral
                })
                break;
            case "send_to_box":
                const pokemonToReturn = options.getInteger('team_number');

                if (user.team.length === 1)
                    return interaction.reply({
                        content: `You only have one pokemon left!`,
                        flags: MessageFlags.Ephemeral
                    });

                if (pokemonToReturn > user.team.length)
                    return interaction.reply({
                        content: `Couldn't find the pokemon to send to your pokebox.`,
                        flags: MessageFlags.Ephemeral
                    });

                const sendToBox = user.team.splice(pokemonToReturn - 1, 1);
                // sendToBox[0].damageTaken = 0;
                // console.log(sendToBox[0])
                // console.log(user.team)

                await trainerFunctions.addPokemonToBox(user.userId, sendToBox[0]);
                await trainerFunctions.setTeam(user.userId, user.team);

                interaction.reply({
                    content: `${sendToBox[0].nickname || sendToBox[0].name} was sent to your pokebox.`,
                    flags: MessageFlags.Ephemeral
                });

                break;
            case "swap":
                const swapPosOne = interaction.options.getInteger('pokemon_one');
                const swapPosTwo = interaction.options.getInteger('pokemon_two');

                if (user.team.length === 1)
                    return interaction.reply({
                        content: `You only have one pokemon!`,
                        flags: MessageFlags.Ephemeral
                    });

                if (swapPosOne > user.team.length || swapPosTwo > user.team.length)
                    return interaction.reply({
                        content: `Couldn't find the pokemon to swap.`,
                        flags: MessageFlags.Ephemeral
                    });

                [user.team[swapPosOne - 1], user.team[swapPosTwo - 1]] = [user.team[swapPosTwo - 1], user.team[swapPosOne - 1]];

                await trainerFunctions.setTeam(user.userId, user.team);

                interaction.reply({
                    content: `${user.team[swapPosOne - 1].nickname || user.team[swapPosOne - 1].name} and ${user.team[swapPosTwo - 1].nickname || user.team[swapPosTwo - 1].name} were swapped.`,
                    flags: MessageFlags.Ephemeral
                });

                break;
            case "display":
                const team_number = options.getInteger('team_number');

                if (team_number > user.team.length)
                    return interaction.reply({
                        content: `Couldn't find the pokemon to view.`,
                        flags: MessageFlags.Ephemeral
                    });

                let pokemon = user.team[team_number - 1];
                let fullPokemonDetails = await pokemonListFunctions.getPokemonFromId(pokemon.pokeId);

                await pokemonFunctions.createPokemonDetailsEmbed(pokemon, fullPokemonDetails, interaction, user);
                break;
            case "set_nickname":
                const setNickname = options.getInteger('team_number');
                const nickname = options.getString('nickname');
                if (setNickname > user.team.length)
                    return interaction.reply({
                        content: `Incorrect team number.`,
                        flags: MessageFlags.Ephemeral
                    });
                let filter = new Filter();
                if (filter.isProfane(nickname))
                    return interaction.reply({
                        content: `Incorrect nickname value.`,
                        flags: MessageFlags.Ephemeral
                    });
                user.team[setNickname - 1].nickname = nickname;
                await trainerFunctions.setTeam(user.userId, user.team);

                interaction.reply({
                    content: `${user.team[setNickname - 1].name}'s nickname was set to ${user.team[setNickname - 1].nickname}.`,
                    flags: MessageFlags.Ephemeral
                });

                break
            case "remove_nickname":
                const removeNickname = options.getInteger('team_number');
                if (removeNickname > user.team.length)
                    return interaction.reply({
                        content: `Incorrect team number.`,
                        flags: MessageFlags.Ephemeral
                    });
                user.team[removeNickname - 1].nickname = null;
                await trainerFunctions.setTeam(user.userId, user.team);

                interaction.reply({
                    content: `${user.team[removeNickname - 1].name}'s nickname was removed.`,
                    flags: MessageFlags.Ephemeral
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
