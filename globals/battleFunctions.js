const {MessageEmbed, MessageActionRow, MessageButton, MessageAttachment, MessageSelectMenu} = require('discord.js');
const pokemonFunctions = require("./pokemonFunctions");
const generalFunctions = require("./generalFunctions");
const {PythonShell} = require("python-shell");
// const battlingFunctions = require("../db/functions/battlingFunctions");
const moveListFunctions = require("../db/functions/moveListFunctions");
const pokemonListFunctions = require("../db/functions/pokemonListFunctions");

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
            console.log('python code results: %j', results);
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
            console.log(`${inp.user.id}spawnBattlePokemon`)
            // row = setRowPokemon(row, battlingDetails, inp)
            // return {
            //     content: "_ _",
            //     embedDetails: createEmbedAfterPokemonPVM(battlingDetails),
            //     components: [row]
            // };
        } else if (inp.customId === `${inp.user.id}spawnBattleBag`) {
            console.log(`${inp.user.id}spawnBattleBag`)
            // row = setRowItem(battlingDetails, inp)
            // return {
            //     content: "_ _",
            //     embedDetails: createEmbedAfterBagPVM(battlingDetails),
            //     components: row
            // };
        } else if (inp.customId === `${inp.user.id}spawnBattleRun`) {
            const userOneSpeedMultiplier = Math.round(pokemonFunctions.multiplierCalculation(battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].evLevels.speed));
            const userOneSpeedElb = Math.round(pokemonFunctions.elbCalculation(battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].base.speed, userOneSpeedMultiplier, battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].level));
            const userOneTotalSpeed = Math.round(pokemonFunctions.otherStatCalculation(battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].level, battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].base.speed, getNatureValue("speed", battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].nature), userOneSpeedElb));
            const userOneEffectiveSpeed = getEffectiveSpeed(userOneTotalSpeed, battlingDetails.userOneStatStage.speed)

            const userTwoSpeedMultiplier = Math.round(pokemonFunctions.multiplierCalculation(battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].evLevels.speed));
            const userTwoSpeedElb = Math.round(pokemonFunctions.elbCalculation(battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].base.speed, userTwoSpeedMultiplier, battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].level));
            const userTwoTotalSpeed = Math.round(pokemonFunctions.otherStatCalculation(battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].level, battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].base.speed, getNatureValue("speed", battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].nature), userTwoSpeedElb));
            const userTwoEffectiveSpeed = getEffectiveSpeed(userTwoTotalSpeed, battlingDetails.userTwoStatStage.speed)

            if (escapeCalculation(userOneEffectiveSpeed, userTwoEffectiveSpeed, battlingDetails.fleeCount || 0)) {
                const gif = new MessageAttachment(`./python/battle_image_outputs/battle_gifs/${battlingDetails.userOne.userId}.gif`);
                return {
                    content: "_ _",
                    embedDetails: [new MessageEmbed()
                        .setTitle(`You have successfully fled the battle.`)
                        .setImage(`attachment://${battlingDetails.userOne.userId}.gif`),
                        gif,
                        false],
                    components: []
                };
                // module.exports.encounterBattleEnds("fled", i.user.id)


            } else {
                console.log("!escaped")
                //increase escape count
                // do enemy move
            }
            console.log(`${inp.user.id}spawnBattleRun`)
        } else if (inp.customId === `${inp.user.id}${battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].currentMoves[0].name}` ||
            inp.customId === `${inp.user.id}${battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].currentMoves[1].name}` ||
            inp.customId === `${inp.user.id}${battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].currentMoves[2].name}` ||
            inp.customId === `${inp.user.id}${battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].currentMoves[3].name}`
        ) {
            //user used a move

            let enemyMove = getRandomPokemonMove(battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1]);

            let userMoveName = inp.customId.replace(inp.user.id, "");
            let userMove = battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].currentMoves.find(object => object.name === userMoveName);

            await useMove(battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1], battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1], userMove, enemyMove, battlingDetails);

            //check if any pokemon hp is less than 1, use the row with button if battle is continuing
            //else use empty row

            //update to db

            row = module.exports.setRowDefault(row, inp)
            return {
                content: "_ _",
                embedDetails: module.exports.createEmbedPVM(battlingDetails),
                components: [row]
            };

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

    encounterBattleEnds: function (endType, userId) {
        //update bag
        //update team
        //update battling to false
        //update userOneCurrentPokemon
        //update battling database
        //update thread
        //update win/loss
        switch (endType) {
            case "time":
                break;
            case "fled":
                break;
            case "userFainted":
                break;
            case "enemyFainted":
                break;
            case "pokemonCaptured":
                break;
        }
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
            {
                name: 'Category',
                value: battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].currentMoves[j].category,
                inline: true
            }
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

    let itemCount = 0;

    for (let [key, value] of battlingDetails.userOneBag.entries()) {
        attackBagEmbed.addField(`${itemCount + 1}) ${key}`, `${value}`, true)
        itemCount++;
        if (itemCount > 4) break;
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
    console.log(escapeChance)
    console.log(chance)
    console.log(chance <= escapeChance)
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

async function useMove(user, randomPokemon, userMove, randomPokemonMove, battleDetails) {

    // console.log(randomPokemonMove)
    // console.log(userMove)

    const pokemonHpMultiplier = Math.round(pokemonFunctions.multiplierCalculation(randomPokemon.evLevels.hp));
    const pokemonElb = Math.round(pokemonFunctions.elbCalculation(randomPokemon.base.hp, pokemonHpMultiplier, randomPokemon.level));
    const pokemonTotalHp = Math.round(pokemonFunctions.hpCalculation(randomPokemon.level, randomPokemon.base.hp, pokemonElb));

    const userHpMultiplier = Math.round(pokemonFunctions.multiplierCalculation(user.evLevels.hp));
    const userElb = Math.round(pokemonFunctions.elbCalculation(user.base.hp, userHpMultiplier, user.level));
    const userTotalHp = Math.round(pokemonFunctions.hpCalculation(user.level, user.base.hp, userElb));


    //check move priority
    if (userMove.priority > randomPokemonMove.priority) {

        await executeMove(user, randomPokemon, userMove, battleDetails.userOneStatStage, battleDetails.userTwoStatStage, battleDetails.userOneVolatileStatus);
        //check HP of pokemon
        // if (randomPokemon.damageTaken < pokemonTotalHp)
        //     await executeMove(randomPokemon, user, randomPokemonMove, battleDetails.userTwoStatStage, battleDetails.userOneStatStage, battleDetails.userTwoVolatileStatus);
    } else if (userMove.priority < randomPokemonMove.priority) {

        // await executeMove(randomPokemon, user, randomPokemonMove, battleDetails.userTwoStatStage, battleDetails.userOneStatStage, battleDetails.userTwoVolatileStatus);
        //check HP of user
        if (user.damageTaken < userTotalHp)
            await executeMove(user, randomPokemon, userMove, battleDetails.userOneStatStage, battleDetails.userTwoStatStage, battleDetails.userOneVolatileStatus);
    }
    //check pokemon base speed
    else {
        const userSpeedMultiplier = Math.round(pokemonFunctions.multiplierCalculation(user.evLevels.speed));
        const userSpeedElb = Math.round(pokemonFunctions.elbCalculation(user.base.speed, userSpeedMultiplier, user.level));
        const userTotalSpeed = Math.round(pokemonFunctions.otherStatCalculation(user.level, user.base.speed, getNatureValue("speed", user.nature), userSpeedElb));
        let userEffectiveSpeed = getEffectiveSpeed(userTotalSpeed, battleDetails.userOneStatStage.speed);
        if (user.status === "paralyzed") {
            userEffectiveSpeed = Math.round(userEffectiveSpeed / 2);
            console.log("speed reduced bc user is paralyzed")
        }

        const pokemonSpeedMultiplier = Math.round(pokemonFunctions.multiplierCalculation(randomPokemon.evLevels.speed));
        const pokemonSpeedElb = Math.round(pokemonFunctions.elbCalculation(randomPokemon.base.speed, pokemonSpeedMultiplier, randomPokemon.level));
        const pokemonTotalSpeed = Math.round(pokemonFunctions.otherStatCalculation(randomPokemon.level, randomPokemon.base.speed, getNatureValue("speed", randomPokemon.nature), pokemonSpeedElb));
        let pokemonEffectiveSpeed = getEffectiveSpeed(pokemonTotalSpeed, battleDetails.userTwoStatStage.speed);
        if (randomPokemon.status === "paralyzed") {
            pokemonEffectiveSpeed = Math.round(pokemonEffectiveSpeed / 2);
            console.log("speed reduced bc enemy pokemon is paralyzed")
        }

        console.log(userEffectiveSpeed, pokemonEffectiveSpeed);

        if (userEffectiveSpeed > pokemonEffectiveSpeed) {
            await executeMove(user, randomPokemon, userMove, battleDetails.userOneStatStage, battleDetails.userTwoStatStage, battleDetails.userOneVolatileStatus);

            // //check HP of pokemon
            // if (randomPokemon.damageTaken < pokemonTotalHp)
            //     await executeMove(randomPokemon, user, randomPokemonMove, battleDetails.userTwoStatStage, battleDetails.userOneStatStage, battleDetails.userTwoVolatileStatus);

        } else if (userTotalSpeed < pokemonTotalSpeed) {
            // await executeMove(randomPokemon, user, randomPokemonMove, battleDetails.userTwoStatStage, battleDetails.userOneStatStage, battleDetails.userTwoVolatileStatus);

            //check HP of user
            if (user.damageTaken < userTotalHp)
                await executeMove(user, randomPokemon, userMove, battleDetails.userOneStatStage, battleDetails.userTwoStatStage, battleDetails.userOneVolatileStatus);
        }
        //randomly pick who goes first
        else {
            if (Math.floor(Math.random() * 2) === 0) {
                await executeMove(user, randomPokemon, userMove, battleDetails.userOneStatStage, battleDetails.userTwoStatStage, battleDetails.userOneVolatileStatus);

                // //check HP of pokemon
                // if (randomPokemon.damageTaken < pokemonTotalHp)
                //     await executeMove(randomPokemon, user, randomPokemonMove, battleDetails.userTwoStatStage, battleDetails.userOneStatStage, battleDetails.userTwoVolatileStatus);
            } else {
                // await executeMove(randomPokemon, user, randomPokemonMove, battleDetails.userTwoStatStage, battleDetails.userOneStatStage, battleDetails.userTwoVolatileStatus);

                //check HP of user
                if (user.damageTaken < userTotalHp)
                    await executeMove(user, randomPokemon, userMove, battleDetails.userOneStatStage, battleDetails.userTwoStatStage, battleDetails.userOneVolatileStatus);
            }
        }
    }

    //check if both fainted,
    if (user.damageTaken >= userTotalHp && randomPokemon.damageTaken >= pokemonTotalHp) {
        console.log("both pokemon feinted");
        //end battle both lost
    } else {
        //check if user pokemon fainted
        if (user.damageTaken >= userTotalHp) {
            console.log("user pokemon fainted in battle");
            //end battle user lost
        } else {
            runThroughStatusEffects(user, battleDetails.userOneVolatileStatus, userTotalHp);
        }
        //check if enemy pokemon fainted
        if (randomPokemon.damageTaken >= pokemonTotalHp) {
            console.log("enemy pokemon fainted in battle");
            //end battle pokemon lost
        } else {
            runThroughStatusEffects(randomPokemon, battleDetails.userTwoVolatileStatus, pokemonTotalHp);
        }
    }

    //check if both fainted after status effects
    if (user.damageTaken >= userTotalHp && randomPokemon.damageTaken >= pokemonTotalHp) {
        console.log("both pokemon feinted after status effects");
        //end battle both lost
    } else {
        //check if user pokemon fainted
        if (user.damageTaken >= userTotalHp) {
            console.log("user pokemon fainted after status effects");
            //end battle user lost
        }
        //check if enemy pokemon fainted
        if (randomPokemon.damageTaken >= pokemonTotalHp) {
            console.log("enemy pokemon fainted after status effects");
            //end battle pokemon lost
        }
    }
    // console.log(battleDetails)
}

function getRandomPokemonMove(pokemon) {

    // console.log(pokemon.currentMoves)

    let moveList = pokemon.currentMoves.sort((a, b) => {
        return b.currentPP - a.currentPP;
    })

    // console.log(moveList)

    if (moveList[0].currentPP < 1) return "Struggle";

    let randomMove = pokemon.currentMoves[Math.floor(Math.random() * pokemon.currentMoves.length)];

    while (randomMove.currentPP < 1) {
        randomMove = pokemon.currentMoves[Math.floor(Math.random() * pokemon.currentMoves.length)];
    }

    return randomMove;
}

async function executeMove(attacker, defender, move, attackerStatStage, defenderStatStage, attackerVolatileStatus) {

    if (attacker.status === "frozen") {
        let movesThatThaw = new Set(["Burn Up", "Flame Wheel", "Flare Blitz", "Fusion Flare",
            "Pyro Ball", "Sacred Fire", "Scald", "Scorching Sands", "Steam Eruption"])

        if (Math.floor(Math.random() * 5) === 0 || movesThatThaw.has(move.name)) {
            attacker.status = "normal";
            console.log(`${attacker.name} managed to thaw out.`)
        } else {
            console.log(`${attacker.name} is frozen.`)
            return;
        }
    }

    if (attacker.status === "paralyzed") {
        if (Math.floor(Math.random() * 4) === 0) {
            console.log(`${attacker.name} is paralyzed and can't move.`)
            return;
        }
    }

    if (attacker.status === "sleeping") {
        if (attackerVolatileStatus.sleepTurnLength === 1) {

        } else {
            console.log(`${attacker.name} is fast asleep.`)
            return;
        }
    }

    console.log(`${attacker.name} used ${move.name} on ${defender.name}`);

    //dmg calculations: https://bulbapedia.bulbagarden.net/wiki/Damage#Damage_calculation

    // let fullAttackerDetails = pokemonListFunctions.getPokemonFromId(attacker.pokeId);
    let fullDefenderDetails = await pokemonListFunctions.getPokemonFromId(defender.pokeId);

    if (move.category === "status") {
        console.log("used status move");
    } else {
        let level = attacker.level;

        let criticalStage = {
            0: 24,
            1: 8,
            2: 2,
            3: 1
        }

        let critical = (Math.floor(Math.random() * (criticalStage[0] - 0)) === 0) ? 2 : 1;

        let power = move.pwr || 0;

        // console.log(power)

        let effectiveAtk;
        let effectiveDef;

        // console.log(move.category)
        if (move.category === "physical") {
            console.log("physical")
            let atkMultiplier = Math.round(pokemonFunctions.multiplierCalculation(attacker.evLevels.atk));
            // console.log(attacker.base.attack, atkMultiplier, attacker.level)
            let atkElb = Math.round(pokemonFunctions.elbCalculation(attacker.base.attack, atkMultiplier, attacker.level));
            // console.log(atkMultiplier, atkElb)
            let atk = Math.round(pokemonFunctions.otherStatCalculation(attacker.level, attacker.base.attack, getNatureValue("atk", attacker.nature), atkElb));

            // console.log(atk, attackerStatStage.atk, critical)
            effectiveAtk = getEffectiveAtk(atk, attackerStatStage.atk, critical);

            let defMultiplier = Math.round(pokemonFunctions.multiplierCalculation(defender.evLevels.def));
            let defElb = Math.round(pokemonFunctions.elbCalculation(defender.base.defense, defMultiplier, defender.level));
            let def = Math.round(pokemonFunctions.otherStatCalculation(defender.level, defender.base.defense, getNatureValue("def", defender.nature), defElb));

            effectiveDef = getEffectiveDef(def, defenderStatStage.def, critical);
        } else {
            console.log("special")
            let spAtkMultiplier = Math.round(pokemonFunctions.multiplierCalculation(attacker.evLevels.spAtk));
            let spAtkElb = Math.round(pokemonFunctions.elbCalculation(attacker.base["special-attack"], spAtkMultiplier, attacker.level));
            let spAtk = Math.round(pokemonFunctions.otherStatCalculation(attacker.level, attacker.base["special-attack"], getNatureValue("spAtk", attacker.nature), spAtkElb));

            effectiveAtk = getEffectiveAtk(spAtk, attackerStatStage.spAtk, critical);

            let spDefMultiplier = Math.round(pokemonFunctions.multiplierCalculation(defender.evLevels.spDef));
            let spDefElb = Math.round(pokemonFunctions.elbCalculation(defender.base["special-defense"], spDefMultiplier, defender.level));
            let spDef = Math.round(pokemonFunctions.otherStatCalculation(defender.level, defender.base["special-defense"], getNatureValue("spDef", defender.nature), spDefElb));

            effectiveDef = getEffectiveDef(spDef, defenderStatStage.spDef, critical);
        }

        let random = Math.floor(Math.random() * (101 - 85) + 85) / 100;

        let stab = fullDefenderDetails.types.includes(move.type) ? 1.5 : 1;

        let type = getTypeCalculation(move.type, fullDefenderDetails.types);

        // console.log(type)
        let burn = (attacker.status === "burned" && move.category === "physical") ? 0.5 : 1;
        burn = (attacker.status === "frostbite" && move.category === "special") ? 0.5 : burn;

        let other = 1;

        let damage = Math.round(((((((2 * level) / 5) + 2) * power * effectiveAtk / effectiveDef) / 50) + 2) * critical * random * stab * type * burn * other);

        // console.log(power, effectiveAtk, effectiveDef, critical, random, stab, type, burn, other);

        switch (move.name) {
            case "Karate Chop":
                break;
            default:
                console.log(damage);
                break;
        }
    }
}


function getEffectiveAtk(stat, statStage, critical) {
    let statStageMultiplier = {
        "-6": 0.25,
        "-5": 0.28,
        "-4": 0.33,
        "-3": 0.40,
        "-2": 0.50,
        "-1": 0.66,
        "0": 1,
        "1": 1.5,
        "2": 2,
        "3": 2.5,
        "4": 3,
        "5": 3.5,
        "6": 4,
    }

    if (critical > 1) {
        return stat * Math.max(statStageMultiplier[statStage.toString()], 1);
    } else {
        return stat * statStageMultiplier[statStage.toString()];
    }
}

function getEffectiveDef(stat, statStage, critical) {
    let statStageMultiplier = {
        "-6": 0.25,
        "-5": 0.28,
        "-4": 0.33,
        "-3": 0.40,
        "-2": 0.50,
        "-1": 0.66,
        "0": 1,
        "1": 1.5,
        "2": 2,
        "3": 2.5,
        "4": 3,
        "5": 3.5,
        "6": 4,
    }

    if (critical > 1) {
        return stat * Math.min(statStageMultiplier[statStage.toString()], 1);
    } else {
        return stat * statStageMultiplier[statStage.toString()];
    }
}

function getEffectiveSpeed(stat, statStage) {
    let statStageMultiplier = {
        "-6": 0.25,
        "-5": 0.28,
        "-4": 0.33,
        "-3": 0.40,
        "-2": 0.50,
        "-1": 0.66,
        "0": 1,
        "1": 1.5,
        "2": 2,
        "3": 2.5,
        "4": 3,
        "5": 3.5,
        "6": 4,
    }

    return stat * statStageMultiplier[statStage.toString()];
}

function getTypeCalculation(moveType, defenderTypes) {
    let typeChart = {
        "normal": {
            "rock": 0.5,
            "ghost": 0,
            "steel": 0.5
        },
        "fire": {
            "fire": 0.5,
            "water": 0.5,
            "grass": 2,
            "ice": 2,
            "bug": 2,
            "rock": 0.5,
            "dragon": 0.5,
            "steel": 2
        },
        "water": {
            "fire": 2,
            "water": 0.5,
            "grass": 0.5,
            "ground": 2,
            "rock": 2,
            "dragon": 0.5
        },
        "grass": {
            "fire": 0.5,
            "water": 2,
            "grass": 0.5,
            "poison": 0.5,
            "ground": 2,
            "flying": 0.5,
            "bug": 0.5,
            "rock": 2,
            "dragon": 0.5,
            "steel": 0.5
        },
        "electric": {
            "water": 2,
            "grass": 0.5,
            "electric": 0.5,
            "ground": 0,
            "flying": 2,
            "dragon": 0.5
        },
        "ice": {
            "fire": 0.5,
            "water": 0.5,
            "grass": 2,
            "ice": 0.5,
            "ground": 2,
            "flying": 2,
            "dragon": 2,
            "steel": 0.5
        },
        "fighting": {
            "normal": 2,
            "ice": 2,
            "poison": 0.5,
            "flying": 0.5,
            "psychic": 0.5,
            "bug": 0.5,
            "rock": 2,
            "ghost": 0,
            "dark": 2,
            "steel": 2,
            "fairy": 0.5
        },
        "poison": {
            "grass": 2,
            "poison": 0.5,
            "ground": 0.5,
            "rock": 0.5,
            "ghost": 0.5,
            "steel": 0,
            "fairy": 2
        },
        "ground": {
            "fire": 2,
            "grass": 0.5,
            "electric": 2,
            "poison": 2,
            "flying": 0,
            "bug": 0.5,
            "rock": 2,
            "steel": 2
        },
        "flying": {
            "grass": 2,
            "electric": 0.5,
            "fighting": 2,
            "bug": 2,
            "rock": 0.5,
            "steel": 0.5
        },
        "psychic": {
            "fighting": 2,
            "poison": 2,
            "psychic": 0.5,
            "dark": 0,
            "steel": 0.5
        },
        "bug": {
            "fire": 0.5,
            "grass": 2,
            "fighting": 0.5,
            "poison": 0.5,
            "flying": 0.5,
            "psychic": 2,
            "dark": 2,
            "steel": 0.5,
            "fairy": 0.5
        },
        "rock": {
            "fire": 2,
            "ice": 2,
            "fighting": 0.5,
            "ground": 0.5,
            "flying": 2,
            "bug": 2,
            "steel": 0.5
        },
        "ghost": {
            "normal": 0,
            "psychic": 2,
            "ghost": 2,
            "dark": 0.5
        },
        "dragon": {
            "dragon": 2,
            "steel": 0.5,
            "fairy": 0
        },
        "dark": {
            "fighting": 0.5,
            "psychic": 2,
            "ghost": 2,
            "dark": 0.5,
            "fairy": 0.5
        },
        "steel": {
            "fire": 0.5,
            "water": 0.5,
            "electric": 0.5,
            "ice": 2,
            "rock": 2,
            "steel": 0.5,
            "fairy": 2
        },
        "fairy": {
            "fire": 0.5,
            "fighting": 2,
            "poison": 0.5,
            "dragon": 2,
            "dark": 2,
            "steel": 0.5
        }
    }

    let multiplier = 1;

    // console.log(typeChart[moveType]["steel"])
    // console.log(typeChart[defenderTypes[0]] || 1)
    // console.log(typeChart[defenderTypes[1]] || 1)

    for (let i = 0; i < defenderTypes.length; i++) {
        multiplier *= typeChart[moveType][defenderTypes[i]] || 1;
    }

    return multiplier;
}

function runThroughStatusEffects(pokemon, volatileStatus, totalHp) {

    if (pokemon.status === "burned") {
        pokemon.damageTaken += Math.round(totalHp / 16);
        pokemon.damageTaken = Math.min(totalHp, pokemon.damageTaken);
    }
    if (pokemon.status === "poisoned") {
        pokemon.damageTaken += Math.round(totalHp / 8);
        pokemon.damageTaken = Math.min(totalHp, pokemon.damageTaken);
    }
    if (pokemon.status === "badly poisoned") {
        pokemon.damageTaken += Math.round(totalHp * (volatileStatus.badlyPoisonTurn + 1) / 16);
        pokemon.damageTaken = Math.min(totalHp, pokemon.damageTaken);
        volatileStatus.badlyPoisonTurn++;
    }
    if (volatileStatus.sleepTurnLength > 0)
        volatileStatus.sleepTurnLength--;
    if (volatileStatus.bound.length > 0) {
        switch (volatileStatus.bound.name) {
            case "Bind":
                pokemon.damageTaken += Math.round(totalHp / 8);
                pokemon.damageTaken = Math.min(totalHp, pokemon.damageTaken);
                volatileStatus.bound.length--;
                break;
            case "Clamp":
                pokemon.damageTaken += Math.round(totalHp / 8);
                pokemon.damageTaken = Math.min(totalHp, pokemon.damageTaken);
                volatileStatus.bound.length--;
                break;
            case "Fire Spin":
                pokemon.damageTaken += Math.round(totalHp / 8);
                pokemon.damageTaken = Math.min(totalHp, pokemon.damageTaken);
                volatileStatus.bound.length--;
                break;
            case "Infestation":
                pokemon.damageTaken += Math.round(totalHp / 8);
                pokemon.damageTaken = Math.min(totalHp, pokemon.damageTaken);
                volatileStatus.bound.length--;
                break;
            case "Magma Storm":
                pokemon.damageTaken += Math.round(totalHp / 8);
                pokemon.damageTaken = Math.min(totalHp, pokemon.damageTaken);
                volatileStatus.bound.length--;
                break;
            case "Sand Tomb":
                pokemon.damageTaken += Math.round(totalHp / 8);
                pokemon.damageTaken = Math.min(totalHp, pokemon.damageTaken);
                volatileStatus.bound.length--;
                break;
            case "Snap Trap":
                pokemon.damageTaken += Math.round(totalHp / 8);
                pokemon.damageTaken = Math.min(totalHp, pokemon.damageTaken);
                volatileStatus.bound.length--;
                break;
            case "Thunder Cage":
                pokemon.damageTaken += Math.round(totalHp / 8);
                pokemon.damageTaken = Math.min(totalHp, pokemon.damageTaken);
                volatileStatus.bound.length--;
                break;
            case "Whirlpool":
                pokemon.damageTaken += Math.round(totalHp / 8);
                pokemon.damageTaken = Math.min(totalHp, pokemon.damageTaken);
                volatileStatus.bound.length--;
                break;
            case "Wrap":
                pokemon.damageTaken += Math.round(totalHp / 8);
                pokemon.damageTaken = Math.min(totalHp, pokemon.damageTaken);
                volatileStatus.bound.length--;
                break;
            default:
                console.log("Incorrect bind name")
                break;
        }
    }
    if (volatileStatus.cursed) {
        pokemon.damageTaken += Math.round(totalHp / 4);
        pokemon.damageTaken = Math.min(totalHp, pokemon.damageTaken);
    }
    if (volatileStatus.drowsy) {
        if (pokemon.status === "normal") {
            pokemon.status = "sleeping";
            console.log(`Due to it's drowsiness ${pokemon.name} fell asleep.`)
        }
        volatileStatus.drowsy = false;
    }
    if (volatileStatus.encore.encoreLength > 0) {
        volatileStatus.encore.encoreLength--;
    }
    volatileStatus.flinch = false;
    if (volatileStatus.healBlockLength > 0) {
        volatileStatus.healBlockLength--;
    }
    if (volatileStatus.leechSeed) {
        pokemon.damageTaken += Math.round(totalHp / 8);
        pokemon.damageTaken = Math.min(totalHp, pokemon.damageTaken);

        //if enemy pokemon is alive then decrease their damage taken,
        // make sure the lowest it can go is 0 Math.max(0, damageTaken)
    }
    if (pokemon.status === "sleeping" && volatileStatus.nightmare) {
        pokemon.damageTaken += Math.round(totalHp / 4);
        pokemon.damageTaken = Math.min(totalHp, pokemon.damageTaken);
    } else {
        volatileStatus.nightmare = false;
    }
    if (volatileStatus.perishSongLength > 0) {
        if (volatileStatus.perishSongLength === 1) {
            pokemon.damageTaken = totalHp;
        }
        volatileStatus.perishSongLength--;
    }
    if (volatileStatus.tauntLength > 0) {
        volatileStatus.tauntLength--;
    }
    // volatileStatus.telekinesisLength = Math.max(0, volatileStatus.telekinesisLength--);
    if (volatileStatus.telekinesisLength) {
        volatileStatus.telekinesisLength--
    }

    volatileStatus.bracing = false;

    if (volatileStatus.chargingMove.chargingLength > 0) {
        volatileStatus.chargingMove.chargingLength--;
    }

    volatileStatus.magicCoat = false;

    if (volatileStatus.magneticLevitationLength > 0) {
        volatileStatus.magneticLevitationLength--;
    }

    volatileStatus.protection = false;

    if (pokemon.damageTaken < totalHp && volatileStatus.rooting) {
        pokemon.damageTaken -= Math.round(totalHp / 16);
        pokemon.damageTaken = Math.max(0, pokemon.damageTaken);
        console.log("healed from rooting");
    }

    if (pokemon.damageTaken < totalHp && volatileStatus.aquaRing) {
        pokemon.damageTaken -= Math.round(totalHp / 16);
        pokemon.damageTaken = Math.max(0, pokemon.damageTaken);
        console.log("healed from aqua ring");
    }

    // return pokemon.damageTaken >= totalHp;
}