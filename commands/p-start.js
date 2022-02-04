/*
This command starts a pokemon game in the server
*/

const {SlashCommandBuilder} = require("@discordjs/builders");
const pokemonGameFunctions = require("../db/functions/pokemonGameFunctions");
const schedule = require('node-schedule');
const pokemonListFunctions = require("../db/functions/pokemonListFunctions");
const {MessageEmbed, MessageAttachment, MessageActionRow, MessageButton} = require("discord.js");
const trainerFunctions = require("../db/functions/trainerFunctions");
let spawnJob;
let spawnedMessage;
let collector;
const
    shuffleBag = [];

module.exports = {
    data: new SlashCommandBuilder()
        .setName("p-start")
        .setDescription("Start a pokemon game in this server."),
    permission: ["ADMINISTRATOR"],

    /**
     *
     * @param interaction
     * @returns {Promise<void>}
     */
    async execute(interaction) {

        if (!await pokemonGameFunctions.correctChannel(interaction.guild.id, interaction.channel.id)) return interaction.reply({
            content: "Incorrect game channel.",
            ephemeral: true
        });


        const document = await pokemonGameFunctions.getPokemonDocument(interaction.guild.id);
        if (document == null) return interaction.reply({content: "A game channel needs to be set.", ephemeral: true});

        else if (await pokemonGameFunctions.getPlaying(interaction.guild.id)) return interaction.reply({
            content: "A game is already in progress.",
            ephemeral: true
        });
        else {
            try {
                await interaction.client.channels.fetch(document.gameChannel).then(async channel => {
                    await pokemonGameFunctions.setPlaying(interaction.guild.id, true);
                    await pokemonGameFunctions.resetTimer(interaction.guild.id);
                    await pokemonGameFunctions.resetMessages(interaction.guild.id);

                    interaction.reply({content: `A game has started in ${channel.name}.`, ephemeral: true});

                    // spawnJob = schedule.scheduleJob('* * * * *', async function () {
                    const gameDocument = await pokemonGameFunctions.getPokemonDocument(interaction.guild.id);

                    if ((gameDocument.spawnTime - (gameDocument.messageCounter * 10000) - 60000) <= 0) {
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
                            channel.send(`All the ${gameDocument.spawned.pokemon.name}s fled, been killed, or caught.`);

                            try {
                                collector.stop()
                                collector = null;
                            } catch (e) {
                                console.log(e)
                            }
                        }

                        const pokemon = shuffleBag.splice(Math.floor(Math.random() * shuffleBag.length), 1);
                        let quantity = getQuantity(pokemon[0].spawnRate)
                        await pokemonGameFunctions.setSpawned(interaction.guild.id, pokemon[0]);

                        const row = new MessageActionRow()
                            .addComponents(
                                new MessageButton()
                                    .setCustomId('spawnBattle')
                                    .setLabel('battle')
                                    .setStyle('PRIMARY'),
                            );

                        const icon = new MessageAttachment(`./media/pokemon/normal-icons/${pokemon[0].pokeId}.png`);
                        const gif = new MessageAttachment(`./media/pokemon/normal-gif/front/${pokemon[0].pokeId}.gif`);
                        const spawnedPokemonEmbed = new MessageEmbed()
                            .setColor('RANDOM')
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
                            const filter = i => i.customId === 'spawnBattle';

                            collector = channel.createMessageComponentCollector({
                                filter,
                                time: 840000
                            });

                            collector.on('collect', async i => {
                                if (i.customId === 'spawnBattle') {
                                    const user = await trainerFunctions.getUser(interaction.user.id);
                                    if (user == null) return i.reply({
                                        content: "Join the game first before battling.",
                                        ephemeral: true
                                    });

                                    //check if user is in battle
                                    //check if user has a usable pokemon

                                    quantity--;
                                    const thread = await channel.threads.create({
                                        name: `${pokemon[0].name} vs ${i.user.username}`,
                                        autoArchiveDuration: 60,
                                        // type: 'GUILD_PRIVATE_THREAD',
                                        reason: 'Battle thread.',
                                        // invitable: false
                                    });
                                    thread.members.add(i.user.id);
                                    await thread.setLocked(true);
                                    const row = new MessageActionRow()
                                        .addComponents(
                                            new MessageButton()
                                                .setCustomId('spawnBattleAttack')
                                                .setLabel('attack')
                                                .setStyle('PRIMARY'),
                                        )
                                        .addComponents(
                                            new MessageButton()
                                                .setCustomId('spawnBattlePokemon')
                                                .setLabel('pokemon')
                                                .setStyle('PRIMARY'),
                                        )
                                        .addComponents(
                                            new MessageButton()
                                                .setCustomId('spawnBattleBag')
                                                .setLabel('bag')
                                                .setStyle('PRIMARY'),
                                        )
                                        .addComponents(
                                            new MessageButton()
                                                .setCustomId('spawnBattleRun')
                                                .setLabel('run')
                                                .setStyle('DANGER'),
                                        );
                                    thread.send({content: "You have 10 minutes for this battle.", components: [row]})

                                    const battleFilter = input => ((input.customId === 'spawnBattleAttack' || input.customId === 'spawnBattlePokemon') && input.user.id === i.user.id);

                                    const battleCollector = thread.createMessageComponentCollector({
                                        battleFilter,
                                        time: 600000
                                    });

                                    battleCollector.on('collect', async inp => {
                                        inp.reply("Batte option");
                                        if (inp.customId === 'spawnBattleAttack') {
                                            console.log("spawnBattleAttack")
                                        } else if (inp.customId === 'spawnBattlePokemon') {
                                            console.log("spawnBattlePokemon")
                                        } else if (inp.customId === 'spawnBattleBag') {
                                            console.log("spawnBattleBag")
                                        } else if (inp.customId === 'spawnBattleRun') {
                                            console.log("spawnBattleRun")
                                        }
                                    });

                                    if (quantity <= 0) {
                                        spawnedMessage.channel.send(`All the ${pokemon[0].name}s fled, been killed, or caught.`);
                                        try {
                                            spawnedMessage.delete();
                                            spawnedMessage = null;
                                        } catch (e) {
                                            console.log(e)
                                        }

                                        collector.stop()
                                        collector = null;
                                    } else {
                                        if (collector != null) {
                                            const spawnedPokemonEmbed = new MessageEmbed()
                                                .setColor('RANDOM')
                                                .setTitle(`${pokemon[0].name} has appeared.`)
                                                .setDescription(`Quantity: ${quantity}`)
                                                .setThumbnail(`attachment://${pokemon[0].pokeId}.png`)
                                                .setImage(`attachment://${pokemon[0].pokeId}.gif`)
                                                .setTimestamp()

                                            await i.update({
                                                embeds: [spawnedPokemonEmbed],
                                            });
                                        }
                                    }
                                }
                            });
                        } catch (e) {
                            console.log(e)
                        }

                        // collector.on('end', collected => console.log(`Collected ${collected.size} items`));

                        console.log(shuffleBag.length)
                    } else {
                        const newTimer = gameDocument.spawnTime - (gameDocument.messageCounter * 10000) - 60000;
                        await pokemonGameFunctions.setTimer(interaction.guild.id, newTimer)
                        await pokemonGameFunctions.resetMessages(interaction.guild.id);
                    }
                    // })
                });
            } catch (e) {
                console.log(e)
                interaction.reply({content: "There was an error with the game.", ephemeral: true});
            }
        }
    },

    cancelJob: function () {
        try {
            spawnJob.cancel();
        } catch (e) {
            // console.log(e)
        }
    }
};

function getQuantity(spawnRate) {

    switch (spawnRate) {
        case "common":
            return 10;
        case "uncommon":
            return 5;
        case "rare":
            return 3;
        case "very rare":
            return 1;
        case "epic":
            return 1;
    }
}


