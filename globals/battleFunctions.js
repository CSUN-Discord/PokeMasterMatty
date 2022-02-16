const {MessageEmbed, MessageActionRow, MessageButton} = require('discord.js');
const pokemonFunctions = require("./pokemonFunctions");

module.exports = {

    createEmbedPVM: function (battlingDetails) {
        //player, playerCurrentPokemonNumber, playerTeam, pokemonCurrentPokemonNumber, pokemonTeam

        const userTwoHpMultiplier = Math.round(pokemonFunctions.multiplierCalculation(battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].evLevels.hp));

        const userTwoElb = Math.round(pokemonFunctions.elbCalculation(battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].base.hp, userTwoHpMultiplier, battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].level));

        const userTwoTotalHp = Math.round(pokemonFunctions.hpCalculation(battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].level, battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].base.hp, userTwoElb));

        const userOneHpMultiplier = Math.round(pokemonFunctions.multiplierCalculation(battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].evLevels.hp));

        const userOneElb = Math.round(pokemonFunctions.elbCalculation(battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].base.hp, userOneHpMultiplier, battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].level));

        const userOneTotalHp = Math.round(pokemonFunctions.hpCalculation(battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].level, battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].base.hp, userOneElb));

        return new MessageEmbed()
            .setColor('RANDOM')
            .setTitle(`${battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].name} VS ${battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].name}`)
            .addFields(
                {
                    name: `Opponent: ${battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].name}`,
                    value: `HP: ${getEmojiHp(userTwoTotalHp - battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].damageTaken, userTwoTotalHp)}`
                },
                {name: '\u200B', value: '\u200B'},
                {
                    name: `Current Pokemon: ${battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].name}`,
                    value: `HP: ${getEmojiHp(userOneTotalHp - battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].damageTaken, userOneTotalHp)}\n
                        ${userOneTotalHp - battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].damageTaken}/${userOneTotalHp}
                    `
                },
            )
            .setTimestamp()
    },

    battlingOptions: function (inp, battlingDetails) {

        let row = new MessageActionRow();
        inp.channel.send("Battle option");

        if (inp.customId === `${inp.user.id}spawnBattleAttack`) {
            row = setRowAttacks(row, battlingDetails, inp);
            console.log(`${inp.user.id} spawnBattleAttack`)
        } else if (inp.customId === `${inp.user.id}spawnBattlePokemon`) {
            console.log(`${inp.user.id} spawnBattlePokemon`)
        } else if (inp.customId === `${inp.user.id}spawnBattleBag`) {
            console.log(`${inp.user.id} spawnBattleBag`)
        } else if (inp.customId === `${inp.user.id}spawnBattleRun`) {
            console.log(`${inp.user.id} spawnBattleRun`)
        } else if (inp.customId === `${inp.user.id}${battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].currentMoves[0].name}` ||
            inp.customId === `${inp.user.id}${battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].currentMoves[1].name}` ||
            inp.customId === `${inp.user.id}${battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].currentMoves[2].name}` ||
            inp.customId === `${inp.user.id}${battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].currentMoves[3].name}`
        ) {
            console.log("used attack")
            row = setRowAttacks(row, battlingDetails, inp);
        } else if (inp.customId === `${inp.user.id}back`) {
            row = module.exports.setRowDefault(row, inp)
        }

        return {
            content: "_ _",
            embeds: [module.exports.createEmbedPVM(battlingDetails)],
            components: [row]
        };
    },

    setRowDefault: function (row, inp) {
        return new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId(`${inp.user.id}spawnBattleAttack`)
                    .setLabel('attack')
                    .setStyle('PRIMARY'),
            )
            .addComponents(
                new MessageButton()
                    .setCustomId(`${inp.user.id}spawnBattlePokemon`)
                    .setLabel('pokemon')
                    .setStyle('PRIMARY'),
            )
            .addComponents(
                new MessageButton()
                    .setCustomId(`${inp.user.id}spawnBattleBag`)
                    .setLabel('bag')
                    .setStyle('PRIMARY'),
            )
            .addComponents(
                new MessageButton()
                    .setCustomId(`${inp.user.id}spawnBattleRun`)
                    .setLabel('run')
                    .setStyle('DANGER'),
            );
    }
}

function setRowAttacks(row, battlingDetails, inp) {
    for (let j = 0; j < battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].currentMoves.length; j++) {
        row.addComponents(
            new MessageButton()
                .setCustomId(`${inp.user.id}${battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].currentMoves[j].name}`)
                .setLabel(`${battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].currentMoves[j].name}`)
                .setStyle('PRIMARY'),
        )
    }
    row.addComponents(
        new MessageButton()
            .setCustomId(`${inp.user.id}back`)
            .setLabel(`back`)
            .setStyle('DANGER'),
    )
    return row;
}

function getEmojiHp(currentHp, totalHp) {
    const bar1empty = '<:bar1empty:943192152475844649>';
    const bar1mid = '<a:bar1mid:943192277453537280>';
    const bar1high = '<a:bar1high:943192229663629342>';
    const bar1full = '<a:bar1full:943192370504146974>';
    const bar2empty = '<:bar2empty:943192293517721692>';
    const bar2mid = '<a:bar2mid:943192197820465163>';
    const bar2high = '<a:bar2high:943192307136626739>';
    const bar2full = '<a:bar2full:943192358382608446>';
    const bar3empty = '<:bar3empty:943192331174150154>';
    const bar3mid = '<a:bar3mid:943192554294374400>';
    const bar3high = '<a:bar3high:943192319509803068>';
    const bar3full = '<a:bar3full:943192345069887568>';

    let percentHP = Math.round(totalHp / 5);

    let counterHP = 0;
    let emoji = "";

    for (let i = 0; i < 5; i++) {
        if (currentHp === totalHp) {
            if (i === 0) {
                emoji += bar1full;
            } else if (0 < i && i < 4) {
                emoji += bar2full;
            } else {
                emoji += bar3full;
            }
            counterHP += percentHP;
        } else if (counterHP === currentHp) {
            if (i === 0) {
                emoji += bar1empty;
            } else if (0 < i && i < 4) {
                emoji += bar2empty;
            } else {
                emoji += bar3empty;
            }
        } else if ((counterHP + percentHP) < currentHp) {
            if (i === 0) {
                emoji += bar1full;
            } else if (0 < i && i < 4) {
                emoji += bar2full;
            } else {
                emoji += bar3full;
            }
            counterHP += percentHP;
        } else {
            let percent = 100 * (currentHp - counterHP) / 20;
            if (i === 0) {
                if (percent > 50) {
                    emoji += bar1high;
                } else {
                    emoji += bar1mid;
                }
            } else if (0 < i && i < 4) {
                if (percent > 50) {
                    emoji += bar2high;
                } else {
                    emoji += bar2mid;
                }
            } else {
                if (percent > 50) {
                    emoji += bar3high;
                } else {
                    emoji += bar3mid;
                }
            }
            counterHP = currentHp;
        }
    }

    return emoji;
}