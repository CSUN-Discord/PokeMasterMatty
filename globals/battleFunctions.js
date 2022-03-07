const {MessageEmbed, MessageActionRow, MessageButton, MessageAttachment, MessageSelectMenu} = require('discord.js');
const pokemonFunctions = require("./pokemonFunctions");
// const moveListFunctions = require("../db/functions/moveListFunctions");
const generalFunctions = require("./generalFunctions");
const {PythonShell} = require("python-shell");

module.exports = {

    createEmbedPVM: function (battlingDetails) {
        //player, playerCurrentPokemonNumber, playerTeam, pokemonCurrentPokemonNumber, pokemonTeam

        const userTwoHpMultiplier = Math.round(pokemonFunctions.multiplierCalculation(battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].evLevels.hp));

        const userTwoElb = Math.round(pokemonFunctions.elbCalculation(battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].base.hp, userTwoHpMultiplier, battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].level));

        const userTwoTotalHp = Math.round(pokemonFunctions.hpCalculation(battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].level, battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].base.hp, userTwoElb));

        const userOneHpMultiplier = Math.round(pokemonFunctions.multiplierCalculation(battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].evLevels.hp));

        const userOneElb = Math.round(pokemonFunctions.elbCalculation(battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].base.hp, userOneHpMultiplier, battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].level));

        const userOneTotalHp = Math.round(pokemonFunctions.hpCalculation(battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].level, battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].base.hp, userOneElb));

        let enemy_pokemon_name = battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].name;
        let enemy_pokemon_gender = true;
        if (battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].male) {
            enemy_pokemon_gender = false;
        }
        const enemy_pokemon_level = battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].level;
        const enemy_pokemon_current_hp = userTwoTotalHp - battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].damageTaken;
        const enemy_pokemon_total_hp = userTwoTotalHp;
        const user_id = battlingDetails.userOne.userId;
        let user_pokemon_name = battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].nickname || battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].name;
        let user_pokemon_gender = true;
        if (battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].male) {
            user_pokemon_gender = false;
        }
        const user_pokemon_level = battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].level;
        const user_pokemon_current_hp = userOneTotalHp - battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].damageTaken;
        const user_pokemon_total_hp = userOneTotalHp;
        const enemy_pokemon_id = battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].pokeId;
        const user_pokemon_id = battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].pokeId;
        const enemy_pokemon_shiny = battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].shiny;
        const team_pokemon_shiny = battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].shiny;

        let options = {
            pythonOptions: ['-u'], // get print results in real-time
            args: [enemy_pokemon_name, enemy_pokemon_gender, enemy_pokemon_level, enemy_pokemon_current_hp, enemy_pokemon_total_hp, user_id,
                user_pokemon_name, user_pokemon_gender, user_pokemon_level, user_pokemon_current_hp, user_pokemon_total_hp,
                enemy_pokemon_id, user_pokemon_id, enemy_pokemon_shiny, team_pokemon_shiny]
        };

        PythonShell.run('./python/battle_image.py', options, function (err, results) {
            if (err)
                throw err;
            // Results is an array consisting of messages collected during execution
            console.log('results: %j', results);
        });

        const gif = new MessageAttachment(`./python/battle_image_outputs/battle_gifs/${battlingDetails.userOne.userId}.gif`);
        return [new MessageEmbed()
            .setColor('RANDOM')
            .setTitle(`${battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].name} VS ${battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].name}`)
            .setImage(`attachment://${battlingDetails.userOne.userId}.gif`)
            .setTimestamp(),
            gif,
            true
        ]
    },

    battlingOptions: async function (inp, battlingDetails) {

        let row = new MessageActionRow();
        inp.channel.send("Battle option");

        if (inp.customId === `${inp.user.id}spawnBattleAttack`) {

            row = setRowAttacks(row, battlingDetails, inp);

            return {
                content: "_ _",
                embedDetails: createEmbedAfterAttackPVM(battlingDetails),
                components: [row]
            };
        } else if (inp.customId === `${inp.user.id}spawnBattlePokemon`) {
            row = setRowPokemon(row, battlingDetails, inp)
            return {
                content: "_ _",
                embedDetails: createEmbedAfterPokemonPVM(battlingDetails),
                components: [row]
            };
        } else if (inp.customId === `${inp.user.id}spawnBattleBag`) {
            console.log(`${inp.user.id}spawnBattleBag`)
            row = setRowItem(battlingDetails, inp)
            return {
                content: "_ _",
                embedDetails: createEmbedAfterBagPVM(battlingDetails),
                components: row
            };
        } else if (inp.customId === `${inp.user.id}spawnBattleRun`) {
            const userOneSpeedMultiplier = Math.round(pokemonFunctions.multiplierCalculation(battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].evLevels.speed));
            const userOneSpeedElb = Math.round(pokemonFunctions.elbCalculation(battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].base.speed, userOneSpeedMultiplier, battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].level));
            const userOneTotalSpeed = Math.round(pokemonFunctions.otherStatCalculation(battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].level, battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].base.speed, getNatureValue("speed", battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].nature), userOneSpeedElb));

            const userTwoSpeedMultiplier = Math.round(pokemonFunctions.multiplierCalculation(battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].evLevels.speed));
            const userTwoSpeedElb = Math.round(pokemonFunctions.elbCalculation(battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].base.speed, userTwoSpeedMultiplier, battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].level));
            const userTwoTotalSpeed = Math.round(pokemonFunctions.otherStatCalculation(battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].level, battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].base.speed, getNatureValue("speed", battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].nature), userTwoSpeedElb));

            if (escapeCalculation(userOneTotalSpeed, userTwoTotalSpeed, battlingDetails.fleeCount || 0)) {
                console.log("escaped")
                //update bag
                //update team
                //update battling to false
                //update userOneCurrentPokemon
                //update battling database
                //update thread
            } else {
                console.log("!escaped")
                // do enemy move
            }
            console.log(`${inp.user.id}spawnBattleRun`)
        } else if (inp.customId === `${inp.user.id}${battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].currentMoves[0].name}` ||
            inp.customId === `${inp.user.id}${battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].currentMoves[1].name}` ||
            inp.customId === `${inp.user.id}${battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].currentMoves[2].name}` ||
            inp.customId === `${inp.user.id}${battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].currentMoves[3].name}`
        ) {
            console.log("used attack")

        } else if (inp.customId === `${inp.user.id}back`) {
            row = module.exports.setRowDefault(row, inp)

            return {
                content: "_ _",
                embedDetails: createEmbedDefault(battlingDetails),
                components: [row]
            };
        }
        row = module.exports.setRowDefault(row, inp)
        return {
            content: "_ _",
            embedDetails: createEmbedDefault(battlingDetails),
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
                .setCustomId(
                    `${inp.user.id}${battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].currentMoves[j].name}`
                )
                .setLabel(
                    `${battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].currentMoves[j].name}`
                )
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

function setRowPokemon(row, battlingDetails, inp) {
    for (let j = 0; j < battlingDetails.userOneTeam.length; j++) {

        const name = battlingDetails.userOneTeam[j].nickname || battlingDetails.userOneTeam[j].name
        // const name = battlingDetails.userOneTeam[j].name
        row.addComponents(
            new MessageButton()
                .setCustomId(`${j}${inp.user.id}${name}`)
                .setLabel(`Swap to ${name}`)
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

function setRowItem(battlingDetails, inp) {
    const row1 = new MessageActionRow();
    row1.addComponents(
        new MessageSelectMenu()
            .setCustomId('select')
            .setPlaceholder('Category')
            .addOptions([
                {
                    label: 'poke-ball',
                    description: 'Filter all poke-balls.',
                    value: `${inp.user.id}poke-ballfilter`,
                },
                {
                    label: 'recovery',
                    description: 'Filter all recovery items.',
                    value: `${inp.user.id}recoveryfilter`,
                },
                {
                    label: 'hold-items',
                    description: 'Filter all holdable items.',
                    value: `${inp.user.id}hold-itemsfilter`,
                },
                {
                    label: 'vitamins',
                    description: 'Filter all vitamins.',
                    value: `${inp.user.id}vitaminsfilter`,
                },
                {
                    label: 'battle-effect',
                    description: 'Filter all battle-effect items.',
                    value: `${inp.user.id}battle-effectfilter`,
                },
                {
                    label: 'miscellaneous',
                    description: 'Filter all miscellaneous items.',
                    value: `${inp.user.id}miscellaneousfilter`,
                },
                {
                    label: 'all',
                    description: 'Remove filters.',
                    value: `${inp.user.id}allfilter`,
                },
            ]),
    )

    //change this to a function so it gets all items with the required filter and then
    //loop the filtered response and only create how many buttons are needed instead of always 10
    const row2 = new MessageActionRow();
    row2.addComponents(
        new MessageButton()
            .setCustomId(`${inp.user.id}itemone`)
            .setLabel(`Use item 1 (one)`)
            .setStyle('PRIMARY'),
        new MessageButton()
            .setCustomId(`${inp.user.id}itemtwo`)
            .setLabel(`Use item 2 (two)`)
            .setStyle('PRIMARY'),
        new MessageButton()
            .setCustomId(`${inp.user.id}itemthree`)
            .setLabel(`Use item 3 (three)`)
            .setStyle('PRIMARY'),
        new MessageButton()
            .setCustomId(`${inp.user.id}itemfour`)
            .setLabel(`Use item 4 (four)`)
            .setStyle('PRIMARY'),
        new MessageButton()
            .setCustomId(`${inp.user.id}itemfive`)
            .setLabel(`Use item 5 (five)`)
            .setStyle('PRIMARY'),
    )

    const row3 = new MessageActionRow();
    row3.addComponents(
        new MessageButton()
            .setCustomId(`${inp.user.id}itemsix`)
            .setLabel(`Use item 6 (six)`)
            .setStyle('PRIMARY'),
        new MessageButton()
            .setCustomId(`${inp.user.id}itemseven`)
            .setLabel(`Use item 7 (seven)`)
            .setStyle('PRIMARY'),
        new MessageButton()
            .setCustomId(`${inp.user.id}itemeight`)
            .setLabel(`Use item 8 (eight)`)
            .setStyle('PRIMARY'),
        new MessageButton()
            .setCustomId(`${inp.user.id}itemnine`)
            .setLabel(`Use item 9 (nine)`)
            .setStyle('PRIMARY'),
        new MessageButton()
            .setCustomId(`${inp.user.id}itemten`)
            .setLabel(`Use item 10 (ten)`)
            .setStyle('PRIMARY'),
    )

    const row4 = new MessageActionRow();
    row4.addComponents(
        new MessageButton()
            .setCustomId(`${inp.user.id}itemsleft`)
            .setLabel(`⏮`)
            .setStyle('SECONDARY'),
        new MessageButton()
            .setCustomId(`${inp.user.id}itemsright`)
            .setLabel(`⏭`)
            .setStyle('SECONDARY'),
        new MessageButton()
            .setCustomId(`${inp.user.id}back`)
            .setLabel(`back`)
            .setStyle('DANGER'),
    )
    return [row1, row2, row3, row4];
}

function createEmbedAfterAttackPVM(battlingDetails) {

    let attackDetailsEmbed = new MessageEmbed()
        .setColor('RANDOM')
        .setTitle(`${battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].name} VS ${battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].name}`)
        .setImage(`attachment://${battlingDetails.userOne.userId}.gif`)
        .setTimestamp()


    for (let j = 0; j < battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].currentMoves.length; j++) {
        attackDetailsEmbed.addFields(
            {
                name: `${battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].currentMoves[j].name}`,
                value: `${battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].currentMoves[j].flavorText}`
            },
            {
                name: 'PP',
                value: `${battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].currentMoves[j].currentPP}/${battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].currentMoves[j].pp}`,
                inline: true
            },
        )
        if (battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].currentMoves[j].pwr == null)
            attackDetailsEmbed.addField('Power', `0`, true)
        else
            attackDetailsEmbed.addField('Power', `${battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].currentMoves[j].pwr}`, true)
        attackDetailsEmbed.addFields(
            {
                name: 'Type',
                value: `${battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].currentMoves[j].type}`,
                inline: true
            },
        )
    }
    const gif = new MessageAttachment(`./python/battle_image_outputs/battle_gifs/${battlingDetails.userOne.userId}.gif`);
    return [attackDetailsEmbed,
        gif,
        false
    ]
}

function createEmbedDefault(battlingDetails) {
    const gif = new MessageAttachment(`./python/battle_image_outputs/battle_gifs/${battlingDetails.userOne.userId}.gif`);
    return [new MessageEmbed()
        .setColor('RANDOM')
        .setTitle(`${battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].name} VS ${battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].name}`)
        .setImage(`attachment://${battlingDetails.userOne.userId}.gif`)
        .setTimestamp(),
        gif,
        false
    ]
}

function createEmbedAfterPokemonPVM(battlingDetails) {

    let attackPokemonEmbed = new MessageEmbed()
        .setColor('RANDOM')
        .setTitle(`${battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].name} VS ${battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].name}`)
        .setImage(`attachment://${battlingDetails.userOne.userId}.gif`)
        .setTimestamp()

    for (let j = 0; j < battlingDetails.userOneTeam.length; j++) {
        const userOneHpMultiplier = Math.round(pokemonFunctions.multiplierCalculation(battlingDetails.userOneTeam[j].evLevels.hp));
        const userOneElb = Math.round(pokemonFunctions.elbCalculation(battlingDetails.userOneTeam[j].base.hp, userOneHpMultiplier, battlingDetails.userOneTeam[j].level));
        const userOneTotalHp = Math.round(pokemonFunctions.hpCalculation(battlingDetails.userOneTeam[j].level, battlingDetails.userOneTeam[j].base.hp, userOneElb));

        attackPokemonEmbed.addField(
            `${j + 1}) ${battlingDetails.userOneTeam[j].nickname || battlingDetails.userOneTeam[j].name}`,
            `${userOneTotalHp - battlingDetails.userOneTeam[j].damageTaken}/${userOneTotalHp}`
        )
    }
    const gif = new MessageAttachment(`./python/battle_image_outputs/battle_gifs/${battlingDetails.userOne.userId}.gif`);
    return [attackPokemonEmbed,
        gif,
        false
    ]
}

function createEmbedAfterBagPVM(battlingDetails) {

    let attackBagEmbed = new MessageEmbed()
        .setColor('RANDOM')
        .setTitle(`${battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].name} VS ${battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].name}`)
        .setImage(`attachment://${battlingDetails.userOne.userId}.gif`)
        .setTimestamp()

    // console.log(battlingDetails.userOneBag)

    for (let j = 0; j < battlingDetails.userOneBag.length; j++) {

        attackBagEmbed.addField(
            `${j + 1}) ${battlingDetails.userOneBag[j].name}`,
            `${battlingDetails.userOneBag[j].quantity}`
        )
    }
    const gif = new MessageAttachment(`./python/battle_image_outputs/battle_gifs/${battlingDetails.userOne.userId}.gif`);
    return [attackBagEmbed,
        gif,
        false
    ]
}

function escapeCalculation(userSpeed, opponentSpeed, attemptNumber) {
    const escapeChance = ((((userSpeed * 32) / (opponentSpeed / 4)) + 30 * attemptNumber) / 256) * 100;
    const chance = generalFunctions.randomIntFromInterval(0, 100);
    return chance <= escapeChance;
}

function getNatureValue(stat, nature) {
    switch (stat) {
        case "atk":
            if (nature === "lonely" || nature === "brave" || nature === "adamant" || nature === "naughty")
                return 1.1;
            else if (nature === "bold" || nature === "timid" || nature === "modest" || nature === "calm")
                return 0.9;
            else
                return 1;
        case "def":
            if (nature === "bold" || nature === "relaxed" || nature === "impish" || nature === "lax")
                return 1.1;
            else if (nature === "lonely" || nature === "hasty" || nature === "mild" || nature === "gentle")
                return 0.9;
            else
                return 1;
        case "speed":
            if (nature === "timid" || nature === "hasty" || nature === "jolly" || nature === "naive")
                return 1.1;
            else if (nature === "brave" || nature === "relaxed" || nature === "quiet" || nature === "sassy")
                return 0.9;
            else
                return 1;
        case "spAtk":
            if (nature === "modest" || nature === "mild" || nature === "rash" || nature === "quiet")
                return 1.1;
            else if (nature === "adamant" || nature === "impish" || nature === "careful" || nature === "jolly")
                return 0.9;
            else
                return 1;
        case "spDef":
            if (nature === "calm" || nature === "gentle" || nature === "careful" || nature === "sassy")
                return 1.1;
            else if (nature === "naughty" || nature === "lax" || nature === "rash" || nature === "naive")
                return 0.9;
            else
                return 1;
        default:
            return 1;
    }
}