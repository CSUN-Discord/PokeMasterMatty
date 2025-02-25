/*
This command starts a pokemon game in the server
*/

const {SlashCommandBuilder} = require("@discordjs/builders");
const schedule = require("node-schedule");
const {
    MessageFlags,
    EmbedBuilder,
    AttachmentBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    PermissionsBitField,
    ChannelType
} = require("discord.js");

const pokemonGameFunctions = require("../db/functions/pokemonGameFunctions");
const pokemonListFunctions = require("../db/functions/pokemonListFunctions");
const trainerFunctions = require("../db/functions/trainerFunctions");
const pokemonFunctions = require("../globals/pokemonFunctions");
const battleFunctions = require("../globals/battleFunctions");
const battlingFunctions = require("../db/functions/battlingFunctions");

let spawnJob;
let spawnedMessage;
let collector;
const shuffleBag = [];

module.exports = {
    data: new SlashCommandBuilder()
        .setName("p-start")
        .setDescription("Start a pokemon game in this server."),
    permission: [PermissionsBitField.Flags.Administrator],

    /**
     *
     * @param interaction
     * @returns {Promise<void>}
     */
    async execute(interaction) {
        const document = await pokemonGameFunctions.getPokemonDocument(interaction.guild.id);
        if (document == null) return interaction.reply({
            content: "A game channel needs to be set.",
            flags: MessageFlags.Ephemeral
        });

        if (!await pokemonGameFunctions.correctChannel(interaction.guild.id, interaction.channel.id)) return interaction.reply({
            content: "Incorrect game channel.",
            flags: MessageFlags.Ephemeral
        });

        else if (await pokemonGameFunctions.getPlaying(interaction.guild.id)) return interaction.reply({
            content: "A game is already in progress.",
            flags: MessageFlags.Ephemeral
        });
        else {
            try {
                await interaction.client.channels.fetch(document.gameChannel).then(async channel => {
                        await pokemonGameFunctions.setPlaying(interaction.guild.id, true);
                        await pokemonGameFunctions.resetMessages(interaction.guild.id);
                        await trainerFunctions.resetBattling();

                        interaction.reply({
                            content: `A game has started in ${channel.name}.`,
                            flags: MessageFlags.Ephemeral
                        });

                        // spawnJob = schedule.scheduleJob('* * * * *', async function () {
                        const gameDocument = await pokemonGameFunctions.getPokemonDocument(interaction.guild.id);

                        // console.log(gameDocument.spawnTime, gameDocument.messageCounter * 10, (gameDocument.spawnTime - (gameDocument.messageCounter * 10) - 60))

                        if ((gameDocument.spawnTime - (gameDocument.messageCounter * 10) - 60) <= 0) {
                            // console.log("PRINT POKEMON")
                            await pokemonGameFunctions.resetTimer(interaction.guild.id);
                            await pokemonGameFunctions.resetMessages(interaction.guild.id);

                            if (shuffleBag.length === 0) {
                                const commonPokemon = await pokemonListFunctions.getPokemonFromRarity("common")
                                const uncommonPokemon = await pokemonListFunctions.getPokemonFromRarity("uncommon")
                                const rarePokemon = await pokemonListFunctions.getPokemonFromRarity("rare")
                                const veryRarePokemon = await pokemonListFunctions.getPokemonFromRarity("very rare")
                                const epicPokemon = await pokemonListFunctions.getPokemonFromRarity("epic")

                                for (let i = 0; i < 575; i++) {
                                    shuffleBag.push(commonPokemon[Math.floor(Math.random() * commonPokemon.length)]);
                                }
                                for (let i = 0; i < 250; i++) {
                                    shuffleBag.push(uncommonPokemon[Math.floor(Math.random() * uncommonPokemon.length)]);
                                }
                                for (let i = 0; i < 100; i++) {
                                    shuffleBag.push(rarePokemon[Math.floor(Math.random() * rarePokemon.length)]);
                                }
                                for (let i = 0; i < 50; i++) {
                                    shuffleBag.push(veryRarePokemon[Math.floor(Math.random() * veryRarePokemon.length)]);
                                }
                                for (let i = 0; i < 25; i++) {
                                    shuffleBag.push(epicPokemon[Math.floor(Math.random() * epicPokemon.length)]);
                                }
                            }

                            if (spawnedMessage != null) {
                                try {
                                    spawnedMessage.delete();
                                    spawnedMessage = null;
                                } catch (e) {
                                    console.log(e)
                                }
                                const gameDocument = await pokemonGameFunctions.getPokemonDocument(interaction.guild.id);
                                channel.send(`All the ${gameDocument.spawnedPokemon.name}s have fled, been killed, or caught.`);

                                try {
                                    collector.stop()
                                    collector = null;
                                } catch (e) {
                                    console.log(e)
                                }
                            }


                            // const pokemon = [await pokemonListFunctions.getPokemonFromId(4)];
                            const pokemon = shuffleBag.splice(Math.floor(Math.random() * shuffleBag.length), 1);
                            let quantity = pokemonFunctions.setQuantity(pokemon[0].spawnRate);
                            await pokemonGameFunctions.setSpawned(interaction.guild.id, pokemon[0]);

                            const row = new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setCustomId('spawnBattle')
                                        .setLabel('battle')
                                        .setStyle('Primary'),
                                );

                            const icon = new AttachmentBuilder(`./media/pokemon/normal-icons/${pokemon[0].pokeId}.png`);
                            const gif = new AttachmentBuilder(`./media/pokemon/normal-gif/front/${pokemon[0].pokeId}.gif`);
                            const spawnedPokemonEmbed = new EmbedBuilder()
                                .setColor('Random')
                                .setTitle(`${pokemon[0].name} has appeared.`)
                                .setDescription(`Quantity: ${quantity}`)
                                .setThumbnail(`attachment://${pokemon[0].pokeId}.png`)
                                .setImage(`attachment://${pokemon[0].pokeId}.gif`)
                                .setTimestamp()

                            channel.send({
                                embeds: [spawnedPokemonEmbed],
                                files: [icon, gif],
                                components: [row]
                            }).then((msg) => {
                                spawnedMessage = msg;
                            })

                            try {

                                collector = channel.createMessageComponentCollector({
                                    filter: i => i.customId === 'spawnBattle',
                                    time: 840000
                                    // time: 5000
                                });

                                collector.on('collect', async i => {
                                        // if (i.customId === 'spawnBattle') {
                                        await i.deferUpdate()

                                        const user = await trainerFunctions.getUser(i.user.id);
                                        // console.log(user.name)

                                        if (user == null) {
                                            return i.followUp({
                                                content: "Join the game first before battling.",
                                                ephemeral: true
                                            });
                                        }

                                        //check if user is in battle
                                        if (user.battling) {
                                            return i.followUp({
                                                content: "Already in battle.",
                                                ephemeral: true
                                            });
                                        }

                                        //check if user has a usable pokemon
                                        const currentPokemon = user.team[0];
                                        const pokemonHpMultiplier = Math.round(pokemonFunctions.multiplierCalculation(currentPokemon.evLevels.hp));
                                        const pokemonElb = Math.round(pokemonFunctions.elbCalculation(currentPokemon.base.hp, pokemonHpMultiplier, currentPokemon.level));
                                        const maxHP = Math.round(pokemonFunctions.hpCalculation(currentPokemon.level, currentPokemon.base.hp, pokemonElb));

                                        let currentHP = maxHP - currentPokemon.damageTaken;
                                        if (currentHP < 1) return i.followUp({
                                            content: "Current starting pokemon is too weak to battle.",
                                            ephemeral: true
                                        });

                                        await trainerFunctions.setBattling(i.user.id, true);

                                        quantity--;

                                        const battlePokemon = await pokemonFunctions.createPokemonDetails(pokemonFunctions.setLevel(pokemon[0].spawnRate), pokemon[0]);
                                        // const battlePokemon = await pokemonFunctions.createPokemonDetails(5, pokemon[0]);

                                        await battlingFunctions.addPokemonRandomEncounter(i.user.id, battlePokemon)

                                        //TODO create a job check every hour to delete threads inactive for an hour, make sure it checks for threads only in the game channel
                                        const thread = await channel.threads.create({
                                            name: `${pokemon[0].name} vs ${i.user.username}`,
                                            autoArchiveDuration: 60,
                                            type: ChannelType.PrivateThread,
                                            reason: 'Battle thread.',
                                            invitable: false
                                        });
                                        thread.members.add(i.user.id);
                                        // await thread.setLocked(true);
                                        let row = await battleFunctions.setRowDefault(new ActionRowBuilder(), i)
                                        thread.send({content: "You have 10 minutes for this battle."})
                                        thread.send(`🔴🔴🔴 TURN 1 🔴🔴🔴`);

                                        let message;

                                        let battlingDetails = await battlingFunctions.getBattleFromUserId(i.user.id);
                                        battlingDetails = battlingDetails[0];
                                        const embedDetails = battleFunctions.createEmbedPVM(battlingDetails);

                                        await sleep(1000);

                                        thread.send({
                                            embeds: [embedDetails[0]],
                                            components: [row],
                                            files: [embedDetails[1]],
                                        }).then(msg => {
                                            message = msg;
                                        })


                                        const battleCollector = thread.createMessageComponentCollector({
                                            // battleFilter,
                                            filter: input => input.user.id === i.user.id,
                                            time: 600000
                                            // time: 10000
                                        });

                                        battleCollector.on('collect', async inp => {
                                            // if (inp.user.id !== i.user.id) return;
                                            try {
                                                if (i.customId !== `${battlingDetails.userOne.id}stop`) {
                                                    console.log("deleting here")
                                                    message.delete();
                                                }

                                            } catch (e) {
                                                console.log("Error on collecting battle collector" + e)
                                            }

                                            battlingDetails = await battlingFunctions.getBattleFromUserId(i.user.id);
                                            battlingDetails = battlingDetails[0];

                                            const messageValues = await battleFunctions.battlingOptions(inp, battlingDetails);
                                            if (messageValues.embedDetails[2])
                                                await sleep(1000);
                                            thread.send({
                                                content: messageValues.content,
                                                embeds: [messageValues.embedDetails[0]],
                                                files: [messageValues.embedDetails[1]],
                                                components: messageValues.components
                                            }).then(msg => {
                                                message = msg;
                                            })

                                            if (messageValues.content.includes("The battle has ended")) {
                                                battleCollector.stop();
                                                // battleCollector = null;
                                            }
                                        });

                                        battleCollector.on('end', async () => {
                                            // console.log("ended")
                                            let battlingDetails = await battlingFunctions.getBattleFromUserId(i.user.id);
                                            if (battlingDetails.length > 0) {
                                                // console.log("ended_2")
                                                try {
                                                    const receivedEmbed = message.embeds[0];
                                                    const exampleEmbed = new EmbedBuilder(receivedEmbed)
                                                        .setTitle('The pokemon fled before you had a chance to capture or kill it!')
                                                    message.channel.send({embeds: [exampleEmbed], components: []});

                                                    await battleFunctions.endRandomBattleEncounter("time", battlingDetails[0]);
                                                    // console.log("delete 2")
                                                    message.delete();
                                                } catch (e) {
                                                    console.log(e)
                                                }
                                            }
                                        });

                                        if (quantity <= 0) {
                                            spawnedMessage.channel.send(`All the ${pokemon[0].name}s have fled, been killed, or caught.`);
                                            // try {
                                            //     spawnedMessage.delete();
                                            //     spawnedMessage = null;
                                            // } catch (e) {
                                            //     console.log("error while deleting embeds" + e)
                                            // }
                                            collector.stop()
                                            collector = null;
                                        } else {
                                            //TODO: does this need to be here if the message gets deleted on collecter end, update and test code
                                            if (collector != null) {
                                                const spawnedPokemonEmbed = new EmbedBuilder()
                                                    .setColor('Random')
                                                    .setTitle(`${pokemon[0].name} has appeared.`)
                                                    .setDescription(`Quantity: ${quantity}`)
                                                    .setThumbnail(`attachment://${pokemon[0].pokeId}.png`)
                                                    .setImage(`attachment://${pokemon[0].pokeId}.gif`)
                                                    .setTimestamp()

                                                await i.editReply({
                                                    embeds: [spawnedPokemonEmbed],
                                                });
                                            }
                                        }
                                    }
                                    // }
                                )
                            } catch
                                (e) {
                                console.log(e)
                            }

                            collector.on('end', collected => {
                                try {
                                    // const receivedEmbed = spawnedMessage.embeds[0];
                                    const exampleEmbed = new EmbedBuilder()
                                        .setTitle(`All the ${pokemon[0].name}s have fled, been killed, or caught.`)
                                    spawnedMessage.channel.send({embeds: [exampleEmbed], components: []});

                                    spawnedMessage.delete();
                                    spawnedMessage = null;
                                } catch (e) {
                                    console.log(e)
                                }
                                console.log(`Collected ${collected.size} items`);
                            });

                            console.log(shuffleBag.length)
                        } else {
                            // console.log("DONT PRINT")
                            const newTimer = gameDocument.spawnTime - (gameDocument.messageCounter * 10) - 60;
                            await pokemonGameFunctions.setTimer(interaction.guild.id, newTimer)
                            await pokemonGameFunctions.resetMessages(interaction.guild.id);
                        }
                    }
                )
                // });
            } catch
                (e) {
                console.log(e)
                await interaction.editReply({
                    content: "There was an error with the game.",
                    flags: MessageFlags.Ephemeral
                });
            }
        }
    },

    cancelJob: function () {
        try {
            if (spawnJob != null) {
                spawnJob.cancel();
            }
        } catch (e) {
            console.log(`Problem while cancelling job. ${e}`)
        }
    },
};

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}