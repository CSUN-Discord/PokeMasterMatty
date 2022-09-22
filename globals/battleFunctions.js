const {MessageEmbed, MessageActionRow, MessageButton, MessageAttachment, MessageSelectMenu} = require('discord.js');
const pokemonFunctions = require("./pokemonFunctions");
const generalFunctions = require("./generalFunctions");
const {PythonShell} = require("python-shell");
// const battlingFunctions = require("../db/functions/battlingFunctions");
const moveListFunctions = require("../db/functions/moveListFunctions");
const pokemonListFunctions = require("../db/functions/pokemonListFunctions");
const trainerFunctions = require("../db/functions/trainerFunctions");
const battlingFunctions = require("../db/functions/battlingFunctions");

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
        // console.log("enemy Hp" + enemy_pokemon_current_hp)
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
            //cant run if escape prevention
            //cant escape if thrash, petal dance or outrage

            const userOneSpeedMultiplier = Math.round(pokemonFunctions.multiplierCalculation(battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].evLevels.speed));
            const userOneSpeedElb = Math.round(pokemonFunctions.elbCalculation(battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].base.speed, userOneSpeedMultiplier, battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].level));
            const userOneTotalSpeed = Math.round(pokemonFunctions.otherStatCalculation(battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].level, battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].base.speed, getNatureValue("speed", battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].nature), userOneSpeedElb));
            let userOneEffectiveSpeed = getEffectiveSpeed(userOneTotalSpeed, battlingDetails.userOneStatStage.speed)
            if (battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].status === "paralyzed") {
                userOneEffectiveSpeed = Math.round(userOneEffectiveSpeed / 2);
                console.log("speed reduced bc user is paralyzed")
            }

            const userTwoSpeedMultiplier = Math.round(pokemonFunctions.multiplierCalculation(battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].evLevels.speed));
            const userTwoSpeedElb = Math.round(pokemonFunctions.elbCalculation(battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].base.speed, userTwoSpeedMultiplier, battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].level));
            const userTwoTotalSpeed = Math.round(pokemonFunctions.otherStatCalculation(battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].level, battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].base.speed, getNatureValue("speed", battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].nature), userTwoSpeedElb));
            let userTwoEffectiveSpeed = getEffectiveSpeed(userTwoTotalSpeed, battlingDetails.userTwoStatStage.speed)
            if (battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].status === "paralyzed") {
                userTwoEffectiveSpeed = Math.round(userTwoEffectiveSpeed / 2);
                console.log("speed reduced bc user is paralyzed")
            }

            //allow ghost types to be able to escape if escape prevention is true
            console.log(!battlingDetails.userOneVolatileStatus.escapePrevention.enabled)
            if (!battlingDetails.userOneVolatileStatus.escapePrevention.enabled && escapeCalculation(userOneEffectiveSpeed, userTwoEffectiveSpeed, battlingDetails.fleeCount || 0)) {
                const gif = new MessageAttachment(`./python/battle_image_outputs/battle_gifs/${battlingDetails.userOne.userId}.gif`);
                await module.exports.endRandomBattleEncounter("fled", battlingDetails)
                return {
                    content: "_ _",
                    embedDetails: [new MessageEmbed()
                        .setTitle(`You have successfully fled the battle.`)
                        .setImage(`attachment://${battlingDetails.userOne.userId}.gif`),
                        gif,
                        false],
                    components: []
                };
            } else {
                console.log("!escaped")
                //increase escape count
                battlingFunctions.setFleeCount(battlingDetails._id, battlingDetails.fleeCount + 1)

                // do enemy move


            }
            console.log(`${inp.user.id}spawnBattleRun`)
        } else if (inp.customId === `${inp.user.id}back`) {
            row = module.exports.setRowDefault(row, inp)

            return {
                content: "_ _",
                embedDetails: createEmbedDefault(battlingDetails),
                components: [row]
            };
        } else if (inp.customId === `${inp.user.id}${battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].currentMoves[0].name}` ||
            inp.customId === `${inp.user.id}${battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].currentMoves[1].name}` ||
            inp.customId === `${inp.user.id}${battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].currentMoves[2].name}` ||
            inp.customId === `${inp.user.id}${battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].currentMoves[3].name}` ||
            inp.customId === `${inp.user.id}Struggle`
        ) {
            //user used a move

            //reset flee count
            battlingFunctions.setFleeCount(battlingDetails._id, 0)

            let enemyMove = await getRandomPokemonMove(battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1]);
            enemyMove = await moveListFunctions.getMove(enemyMove);

            // console.log("enemy move", enemyMove)
            //program torment and charging move, and recharging

            let userMoveName = inp.customId.replace(inp.user.id, "");
            // let userMove = battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].currentMoves.find(object => object.name === userMoveName);
            let userMove = await moveListFunctions.getMove(userMoveName);

            if (await useMove(battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1], battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1], userMove, enemyMove, battlingDetails)) {
                return {
                    content: "The battle has ended.",
                    embedDetails: module.exports.createEmbedPVM(battlingDetails),
                    components: []
                };
            } else {
                row = module.exports.setRowDefault(row, inp)
                return {
                    content: "_ _",
                    embedDetails: module.exports.createEmbedPVM(battlingDetails),
                    components: [row]
                };
            }
        }
        row = module.exports.setRowDefault(row, inp)
        return {
            content: "_ _",
            embedDetails: createEmbedDefault(battlingDetails),
            components: [row]
        };
    },

    endRandomBattleEncounter: async function (endType, battlingDetails) {
        //update bag
        await trainerFunctions.setBag(battlingDetails.userOne.userId, battlingDetails.userOneBag);

        //update team
        await trainerFunctions.setTeam(battlingDetails.userOne.userId, battlingDetails.userOneTeam);

        //update battling to false
        await trainerFunctions.setBattling(battlingDetails.userOne.userId, false);

        //update set gold
        await trainerFunctions.setMoney(battlingDetails.userOne.userId, battlingDetails.userOne.money);

        //update battling database
        await battlingFunctions.deletePVMBattle(battlingDetails._id);

        //update win/loss

        console.log(`battle ended due to ${endType}`)

        switch (endType) {
            //     case "user feint":
            //         break;
            //     case "enemy feint":
            //         break;
            //     case "both feint":
            //         break;
            // case "ran":
            //
            //     break;
            //     case "roar":
            //         break;
            //     case "teleport":
            //         break;
            // case "time":
            //
            //     break;
            //     case "pokemonCaptured":
            //         break;
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
    let currentMoves = battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].currentMoves;

    currentMoves = currentMoves.filter(move => {
        return move.currentPP > 0;
    });

    if (battlingDetails.userOneVolatileStatus.chargingMove.chargingLength > 0) {
        row.addComponents(
            new MessageButton()
                .setCustomId(
                    `${inp.user.id}${battlingDetails.userOneVolatileStatus.chargingMove.name}`
                )
                .setLabel(
                    `${battlingDetails.userOneVolatileStatus.chargingMove.name}`
                )
                .setStyle('PRIMARY'),
        )
    } else if (currentMoves.length < 1) {
        row.addComponents(
            new MessageButton()
                .setCustomId(
                    `${inp.user.id}Struggle`
                )
                .setLabel(
                    `Struggle`
                )
                .setStyle('PRIMARY'),
        )
    } else {
        for (let j = 0; j < currentMoves.length; j++) {

            row.addComponents(
                new MessageButton()
                    .setCustomId(
                        `${inp.user.id}${currentMoves[j].name}`
                    )
                    .setLabel(
                        `${currentMoves[j].name}`
                    )
                    .setStyle('PRIMARY'),
            )
        }
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

    let currentMoves = battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].currentMoves;
    // currentMoves = currentMoves.filter(move => {
    //     return move.currentPP > 0;
    // })


    for (let j = 0; j < currentMoves.length; j++) {
        attackDetailsEmbed.addFields(
            {
                name: `${currentMoves[j].name}`,
                value: `${currentMoves[j].flavorText}`
            },
            {
                name: 'PP',
                value: `${currentMoves[j].currentPP}/${currentMoves[j].pp}`,
                inline: true
            },
        )
        if (currentMoves[j].pwr == null)
            attackDetailsEmbed.addField('Power', `0`, true)
        else
            attackDetailsEmbed.addField('Power', `${currentMoves[j].pwr}`, true)
        attackDetailsEmbed.addFields(
            {
                name: 'Type',
                value: `${currentMoves[j].type}`,
                inline: true
            },
            {
                name: 'Category',
                value: currentMoves[j].category,
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
    // if (userMove.priority > randomPokemonMove.priority) {
    if (1 === 1) {
        if (await executeMove(user, randomPokemon, userMove, battleDetails.userOneStatStage, battleDetails.userTwoStatStage, battleDetails.userOneVolatileStatus, battleDetails.userTwoVolatileStatus, pokemonTotalHp, userTotalHp, battleDetails) === "whirlwind") {
            await module.exports.endRandomBattleEncounter("whirlwind", battleDetails);
            return true;
        }

        //check HP of both pokemon, it can hurt itself in confusion
        if (randomPokemon.damageTaken < pokemonTotalHp && user.damageTaken < userTotalHp) {
            if (await executeMove(randomPokemon, user, randomPokemonMove, battleDetails.userTwoStatStage, battleDetails.userOneStatStage, battleDetails.userTwoVolatileStatus, battleDetails.userOneVolatileStatus, userTotalHp, pokemonTotalHp, battleDetails) === "whirlwind") {
                await module.exports.endRandomBattleEncounter("whirlwind", battleDetails);
                return true;
            }
        }
    } else if (userMove.priority < randomPokemonMove.priority) {

        // await executeMove(randomPokemon, user, randomPokemonMove, battleDetails.userTwoStatStage, battleDetails.userOneStatStage, battleDetails.userTwoVolatileStatus);
        //check HP of user
        // if (user.damageTaken < userTotalHp)
        //     await executeMove(user, randomPokemon, userMove, battleDetails.userOneStatStage, battleDetails.userTwoStatStage, battleDetails.userOneVolatileStatus);
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
            // await executeMove(user, randomPokemon, userMove, battleDetails.userOneStatStage, battleDetails.userTwoStatStage, battleDetails.userOneVolatileStatus);

            // //check HP of pokemon
            // if (randomPokemon.damageTaken < pokemonTotalHp)
            //     await executeMove(randomPokemon, user, randomPokemonMove, battleDetails.userTwoStatStage, battleDetails.userOneStatStage, battleDetails.userTwoVolatileStatus);

        } else if (userTotalSpeed < pokemonTotalSpeed) {
            // await executeMove(randomPokemon, user, randomPokemonMove, battleDetails.userTwoStatStage, battleDetails.userOneStatStage, battleDetails.userTwoVolatileStatus);

            //check HP of user
            // if (user.damageTaken < userTotalHp)
            //     await executeMove(user, randomPokemon, userMove, battleDetails.userOneStatStage, battleDetails.userTwoStatStage, battleDetails.userOneVolatileStatus);
        }
        //randomly pick who goes first
        else {
            if (Math.floor(Math.random() * 2) === 0) {
                // await executeMove(user, randomPokemon, userMove, battleDetails.userOneStatStage, battleDetails.userTwoStatStage, battleDetails.userOneVolatileStatus);

                // //check HP of pokemon
                // if (randomPokemon.damageTaken < pokemonTotalHp)
                //     await executeMove(randomPokemon, user, randomPokemonMove, battleDetails.userTwoStatStage, battleDetails.userOneStatStage, battleDetails.userTwoVolatileStatus);
            } else {
                // await executeMove(randomPokemon, user, randomPokemonMove, battleDetails.userTwoStatStage, battleDetails.userOneStatStage, battleDetails.userTwoVolatileStatus);

                //check HP of user
                // if (user.damageTaken < userTotalHp)
                //     await executeMove(user, randomPokemon, userMove, battleDetails.userOneStatStage, battleDetails.userTwoStatStage, battleDetails.userOneVolatileStatus);
            }
        }
    }


    if (user.damageTaken >= userTotalHp || randomPokemon.damageTaken >= pokemonTotalHp) {
        //end battle function
        await module.exports.endRandomBattleEncounter("feint", battleDetails);
        return true;
    } else {
        runThroughStatusEffects(user, battleDetails.userOneVolatileStatus, userTotalHp, randomPokemon);
        if (user.damageTaken >= userTotalHp || randomPokemon.damageTaken >= pokemonTotalHp) {
            //end battle function
            await module.exports.endRandomBattleEncounter("feint", battleDetails);
            return true;
        }
        runThroughStatusEffects(randomPokemon, battleDetails.userTwoVolatileStatus, pokemonTotalHp, user);
        if (user.damageTaken >= userTotalHp || randomPokemon.damageTaken >= pokemonTotalHp) {
            //end battle function
            await module.exports.endRandomBattleEncounter("feint", battleDetails);
            return true;
        }
    }

    //update battle details in db
    await battlingFunctions.updatePokemonRandomEncounterBattle(battleDetails._id, battleDetails.userOneBag, battleDetails.userOneCurrentPokemon, battleDetails.userOneStatStage, battleDetails.userOneTeam, battleDetails.userOneVolatileStatus, battleDetails.userTwoStatStage, battleDetails.userTwoTeam, battleDetails.userTwoVolatileStatus, battleDetails.userOne);
    return false;
    // // console.log(battleDetails)
}

function getRandomPokemonMove(pokemon) {

    // console.log(pokemon.currentMoves)

    let moveList = pokemon.currentMoves.sort((a, b) => {
        return b.currentPP - a.currentPP;
    })

    // console.log(moveList)

    if (moveList.length < 1 || moveList[0].currentPP < 1) return "Struggle";

    let randomMove = pokemon.currentMoves[Math.floor(Math.random() * pokemon.currentMoves.length)];

    while (randomMove.currentPP < 1) {
        randomMove = pokemon.currentMoves[Math.floor(Math.random() * pokemon.currentMoves.length)];
    }

    return randomMove.name;
}

async function executeMove(attacker, defender, move, attackerStatStage, defenderStatStage, attackerVolatileStatus, defenderVolatileStatus, totalDefenderHp, totalAttackerHp, battleDetails) {
    attackerVolatileStatus.semiInvulnerable = false;

    attackerVolatileStatus.encore.moveToRepeat = move.name;


    // defenderVolatileStatus.typeChange = "dragon";

    if (attackerVolatileStatus.encore.encoreLength > 0) {
        move = await moveListFunctions.getMove(attackerVolatileStatus.encore.name);
        //decrease pp for move should be at the end not here
        //if cant decrease pp then use struggle
        console.log(`due to encore move was changed to ${move.name}`);
    }

    defenderVolatileStatus.mimicLastOpponentMove = move.name;

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
        console.log("is paralyzed")
        if (Math.floor(Math.random() * 4) === 0) {
            console.log(`${attacker.name} is paralyzed and can't move.`)
            return;
        }
    }

    //make user pokemon awake if the battle ends
    if (attacker.status === "sleeping") {
        if (attackerVolatileStatus.sleepTurnLength === 1) {
            console.log(`${attacker.name} woke up.`)
            attacker.status = "normal";
        } else {
            console.log(`${attacker.name} is fast asleep.`)
            return;
        }
    }

    if (attackerVolatileStatus.flinch) {
        console.log(`${attacker.name} flinched.`)
        return;
    }

    let infatuation = Math.floor(Math.random() * 2);
    // console.log(infatuation);
    if (attackerVolatileStatus.infatuation && infatuation === 0) {
        console.log(`${attacker.name} is in love.`)
        return;
        // if any pokemon switches out infatuation is removed
    }

    if (attackerVolatileStatus.confusionLength) {
        if (attackerVolatileStatus.confusionLength === 1) {
            console.log(`${attacker.name} snapped out of it's confusion.`)
        } else {
            if (Math.floor(Math.random() * 2) === 0) {
                let burn = (attacker.status === "burned" && move.category === "physical") ? 0.5 : 1;
                burn = (attacker.status === "frostbite" && move.category === "special") ? 0.5 : burn;
                let criticalStage = {
                    0: 24,
                    1: 8,
                    2: 2,
                    3: 1
                }
                //update critical stage "criticalStage[0]"
                let critical = (Math.floor(Math.random() * (criticalStage[0] - 0)) === 0) ? 2 : 1;

                let effectiveAtk;
                let effectiveDef;
                let atkMultiplier = Math.round(pokemonFunctions.multiplierCalculation(attacker.evLevels.atk));
                // console.log(attacker.base.attack, atkMultiplier, attacker.level)
                let atkElb = Math.round(pokemonFunctions.elbCalculation(attacker.base.attack, atkMultiplier, attacker.level));
                // console.log(atkMultiplier, atkElb)
                let atk = Math.round(pokemonFunctions.otherStatCalculation(attacker.level, attacker.base.attack, getNatureValue("atk", attacker.nature), atkElb));

                // console.log(atk, attackerStatStage.atk, critical)
                effectiveAtk = getEffectiveAtk(atk, attackerStatStage.atk, critical);

                let defMultiplier = Math.round(pokemonFunctions.multiplierCalculation(attacker.evLevels.def));
                let defElb = Math.round(pokemonFunctions.elbCalculation(attacker.base.defense, defMultiplier, attacker.level));
                let def = Math.round(pokemonFunctions.otherStatCalculation(attacker.level, attacker.base.defense, getNatureValue("def", attacker.nature), defElb));

                effectiveDef = getEffectiveDef(def, defenderStatStage.def, critical);

                let damage = Math.round(((((((2 * attacker.level) / 5) + 2) * 40 * effectiveAtk / effectiveDef) / 50) + 2) * critical * (Math.floor(Math.random() * (101 - 85) + 85) / 100) * burn * 1.001);

                attacker.damageTaken += damage;
                attacker.damageTaken = Math.min(attacker.damageTaken, totalAttackerHp)
                console.log(`${attacker.name} hurt itself in it's confusion and did ${damage} dmg`)
                return;
            }
        }
    }

    if (move.type === "ground" && defenderVolatileStatus.magneticLevitationLength > 0) {
        console.log("due to magnetic levitation your ground move had no effect.")
        return;
    }

    if (move.type === "ground" && defenderVolatileStatus.telekinesisLength > 0) {
        console.log("due to telekinesis your ground move had no effect.")
        return;
    }

    if (defenderVolatileStatus.protection && move.name !== "Whirlwind" && move.name !== "Jump Kick") {
        console.log("enemy pokemon is protected.")
        return;
    }

    // if (defenderVolatileStatus.semiInvulnerable) {
    //     if (!(attackerVolatileStatus.takingAim > 0 || move.name === "Toxic" || ((defenderVolatileStatus.chargingMove.name === "Fly" || defenderVolatileStatus.chargingMove.name === "Bounce" ||
    //         defenderVolatileStatus.chargingMove.name === "Sky Drop") && (move.name === "Gust" || move.name === "Hurricane" ||
    //         move.name === "Sky Uppercut" || move.name === "Smack Down" || move.name === "Thousand Arrows" || move.name === "Thunder" ||
    //         move.name === "Twister")) || ((defenderVolatileStatus.chargingMove.name === "Fly") && (move.name === "Earthquake" ||
    //         move.name === "Magnitude" || move.name === "Fissure")) || ((defenderVolatileStatus.chargingMove.name === "Dive") &&
    //         (move.name === "Surf" || move.name === "Whirlpool")))) {
    //         console.log(`Enemy is invulnerable for this turn so ${move.name} missed.`);
    //         return;
    //     }
    // }

    console.log(`${attacker.name} used ${move.name}`);

    if (move.type === "fire" && move.name !== "Fire Spin" && defender.status === "frozen") {
        defender.status = "normal";

        console.log(`${move.name} thawed out ${defender.name}`);
    }

    if (move.category === "status") {
        if (attackerVolatileStatus.tauntLength > 0) {
            console.log("move failed, used a status move while taunted");
            return;
        }

        if (defenderVolatileStatus.magicCoat) {

        } else {
            switch (move.name) {
                case "Swords Dance":
                    attackerStatStage.atk += 2;
                    console.log("raised atk by 2 stages");
                    break;
                case "Whirlwind":
                    console.log("whirlwind ended the battle");
                    return "whirlwind";
                case "Sand Attack":
                    console.log("whirlwind ended the battle");
                    defenderStatStage.accuracy--;
                    break;
                default:
                    console.log(`${move.name} is not programmed.`);
                    break;
            }
        }
        console.log("used status move");
    } else {

        // console.log(power, effectiveAtk, effectiveDef, critical, random, stab, type, burn, other);

        switch (move.name) {
            case "Double Slap":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    console.log(`Enemy is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                let slapCount;
                let slapChance = Math.floor(Math.random() * 8);
                if (slapChance >= 0 && slapChance < 3)
                    slapCount = 2;
                else if (slapChance >= 3 && slapChance < 6)
                    slapCount = 3;
                else if (slapChance === 6)
                    slapCount = 4;
                else if (slapChance === 7)
                    slapCount = 5;

                for (let i = 0; i < slapCount; i++) {
                    if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus)) {
                        console.log("move missed");
                        continue;
                    }
                    let doubleSlapdamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                    defender.damageTaken += doubleSlapdamage;
                    defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp)

                    console.log(doubleSlapdamage);
                }

                console.log(`dealt dmg ${slapCount} times`)
                break;
            case "Comet Punch":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    console.log(`Enemy is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                let cometCount;
                let cometChance = Math.floor(Math.random() * 8);
                if (cometChance >= 0 && cometChance < 3)
                    cometCount = 2;
                else if (cometChance >= 3 && cometChance < 6)
                    cometCount = 3;
                else if (cometChance === 6)
                    cometCount = 4;
                else if (cometChance === 7)
                    cometCount = 5;

                for (let i = 0; i < cometCount; i++) {
                    if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus)) {
                        console.log("move missed");
                        continue;
                    }
                    let cometDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus);

                    defender.damageTaken += cometDamage;
                    defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                    console.log(cometDamage);
                }

                console.log(`dealt dmg ${cometCount} times`);
                break;
            case "Pay Day":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    console.log(`Enemy is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus)) {
                    console.log("move missed");
                    return;
                }
                let payDayDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                defender.damageTaken += payDayDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                if (battleDetails.userOneTeam[battleDetails.userOneCurrentPokemon - 1] === attacker) {
                    battleDetails.userOne.money += attacker.level * 2;

                    // console.log(battleDetails.userOne.money)
                    console.log(`gained ${attacker.level * 2} money`);
                }

                console.log(payDayDamage);
                break;
            case "Fire Punch":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    console.log(`Enemy is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                // console.log(move)
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus)) {
                    console.log("move missed");
                    return;
                }
                let firePunchDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                defender.damageTaken += firePunchDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                let firePunchEffectChance = Math.floor(Math.random() * 100);
                if (firePunchEffectChance < move.effect_chance && defender.status === "normal" && !await isType(defender, "fire", defenderVolatileStatus.typeChange)) {
                    console.log("enemy was burned")
                    defender.status = "burned";
                }

                console.log(firePunchDamage);
                break;
            case "Ice Punch":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    console.log(`Enemy is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                // console.log(move)
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus)) {
                    console.log("move missed");
                    return;
                }
                let icePunchDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                defender.damageTaken += icePunchDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                let icePunchEffectChance = Math.floor(Math.random() * 100);
                if (icePunchEffectChance < move.effect_chance && defender.status === "normal" && !await isType(defender, "ice", defenderVolatileStatus.typeChange)) {
                    console.log("enemy was frozen")
                    defender.status = "frozen";
                }

                console.log(icePunchDamage);
                break;
            case "Thunder Punch":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    console.log(`Enemy is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                // console.log(move)
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus)) {
                    console.log("move missed");
                    return;
                }
                let thunderPunchDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                defender.damageTaken += thunderPunchDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                let thunderPunchEffectChance = Math.floor(Math.random() * 100);
                if (thunderPunchEffectChance < move.effect_chance && defender.status === "normal" && !await isType(defender, "electric", defenderVolatileStatus.typeChange)) {
                    console.log("enemy was paralyzed")
                    defender.status = "paralyzed";
                }

                console.log(thunderPunchDamage);
                break;
            case "Guillotine":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    console.log(`Enemy is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                if (defender.level > attacker.level) {
                    console.log("defender level is too high and the move fails")
                    return;
                }
                move.acc += attacker.level - defender.level;
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus)) {
                    console.log("move missed");
                    return;
                }
                let guillotineDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus) * 10000;

                defender.damageTaken += guillotineDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);
                console.log("KO");
                break;
            case "Razor Wind":
                if (attackerVolatileStatus.chargingMove.chargingLength === 0) {
                    attackerVolatileStatus.chargingMove.chargingLength = 2;
                    attackerVolatileStatus.chargingMove.name = "Razor Wind";
                    console.log(`${attacker.name} made a whirlwind`);
                } else {
                    if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        console.log(`Enemy is invulnerable for this turn so ${move.name} missed.`);
                        return;
                    }

                    if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus)) {
                        console.log("move missed");
                        return;
                    }
                    let razorDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                    defender.damageTaken += razorDamage;
                    defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp)

                    console.log(razorDamage);
                }
                break;
            case "Fly":
                if (attackerVolatileStatus.chargingMove.chargingLength === 0) {
                    attackerVolatileStatus.chargingMove.chargingLength = 2;
                    attackerVolatileStatus.chargingMove.name = "Fly";
                    attackerVolatileStatus.semiInvulnerable = true;
                    console.log(`${attacker.name} flew in the air`);
                } else {
                    if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        console.log(`Enemy is invulnerable for this turn so ${move.name} missed.`);
                        return;
                    }

                    if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus)) {
                        console.log("move missed");
                        return;
                    }
                    let flyDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                    defender.damageTaken += flyDamage;
                    defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp)

                    console.log(flyDamage);
                }
                break;
            case "Bind":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    console.log(`Enemy is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus)) {
                    console.log("move missed");
                    return;
                }

                if (defenderVolatileStatus.bound.length === 0) {
                    if (Math.floor(Math.random() * 2) === 0) {
                        console.log("bounded for 4 turns");
                        defenderVolatileStatus.bound.length = 4;
                    } else {
                        console.log("bounded for 5 turns");
                        defenderVolatileStatus.bound.length = 5;
                    }
                    defenderVolatileStatus.bound.name = "Bind";
                } else {
                    console.log("already bound")
                }
                let bindDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                defender.damageTaken += bindDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);
                console.log(bindDamage);
                break;
            case "Stomp":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    console.log(`Enemy is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                if (!defenderVolatileStatus.minimized && Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus)) {
                    console.log("move missed");
                    return;
                }
                let stompDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                defender.damageTaken += stompDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                if (Math.min(Math.random() * 10) < 3) {
                    defenderVolatileStatus.flinch = true;
                    console.log("made opponent flinch")
                }
                console.log(stompDamage);
                break;
            case "Double Kick":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    console.log(`Enemy is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                for (let i = 0; i < 2; i++) {
                    if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus)) {
                        console.log("move missed");
                        continue;
                    }

                    let doubleKickDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                    defender.damageTaken += doubleKickDamage;
                    defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);
                    console.log(doubleKickDamage);
                }
                break;
            case "Jump Kick":
                let crashDamage = totalDefenderHp / 2;
                if (defenderVolatileStatus.protection) {
                    defender.damageTaken += crashDamage;
                    defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);
                    console.log(`enemy was protected so ${attacker.name} took crash damage`);
                    return;
                }
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    defender.damageTaken += crashDamage;
                    defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);
                    console.log(`enemy was invulnerable so ${attacker.name} missed and took crash damage`);
                    return;
                }
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus)) {
                    defender.damageTaken += crashDamage;
                    defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);
                    console.log(`${attacker.name} missed and took crash damage`);
                    return;
                }
                let fullDefenderDetails = await pokemonListFunctions.getPokemonFromId(defender.pokeId);
                if (getTypeCalculation(move.type, fullDefenderDetails.types, defenderVolatileStatus.typeChange, defenderVolatileStatus.identified) === 0) {
                    defender.damageTaken += crashDamage;
                    defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);
                    console.log(`${attacker.name} missed and took crash damage`);
                    return;
                }

                let jumpKickDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                defender.damageTaken += jumpKickDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);
                console.log(jumpKickDamage);
                break;
            case "Rolling Kick":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    console.log(`Enemy is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                if (!defenderVolatileStatus.minimized && Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus)) {
                    console.log("move missed");
                    return;
                }

                let rollingKickDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)
                defender.damageTaken += rollingKickDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                if (Math.min(Math.random() * 10) < 3) {
                    defenderVolatileStatus.flinch = true;
                    console.log("made opponent flinch")
                }
                console.log(rollingKickDamage);
                break;
            case "Headbutt":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    console.log(`Enemy is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                if (!defenderVolatileStatus.minimized && Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus)) {
                    console.log("move missed");
                    return;
                }

                let headbuttDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)
                defender.damageTaken += headbuttDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                if (Math.min(Math.random() * 10) < 3) {
                    defenderVolatileStatus.flinch = true;
                    console.log("made opponent flinch")
                }
                console.log(headbuttDamage);
                break;
            case "Fury Attack":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    console.log(`Enemy is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                let furyAttackCount;
                let furyAttackChance = Math.floor(Math.random() * 100);
                if (furyAttackChance >= 0 && furyAttackChance < 35)
                    furyAttackCount = 2;
                else if (furyAttackChance >= 35 && furyAttackChance < 70)
                    furyAttackCount = 3;
                else if (furyAttackChance >= 70 && furyAttackChance < 85)
                    furyAttackCount = 4;
                else
                    furyAttackCount = 5;

                for (let i = 0; i < furyAttackCount; i++) {
                    if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus)) {
                        console.log("move missed");
                        continue;
                    }
                    let damage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                    defender.damageTaken += damage;
                    defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp)

                    console.log(damage);
                }

                console.log(`dealt dmg ${furyAttackCount} times`)
                break;
            case "Horn Drill":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    console.log(`Enemy is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                if (defender.level > attacker.level) {
                    console.log("defender level is too high and the move fails")
                    return;
                }
                move.acc += attacker.level - defender.level;
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus)) {
                    console.log("move missed");
                    return;
                }
                let hornDrillDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus) * 10000;

                defender.damageTaken += hornDrillDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);
                console.log("KO");
                break;
            case "Body Slam":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    console.log(`Enemy is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                if (!defenderVolatileStatus.minimized && Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus)) {
                    console.log("move missed");
                    return;
                }
                let bodySlamDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                defender.damageTaken += bodySlamDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                if (Math.min(Math.random() * 10) < 3 && defender.status === "normal" && !await isType(defender, "electric", defenderVolatileStatus.typeChange) && !await isType(defender, "normal", defenderVolatileStatus.typeChange)) {
                    console.log("enemy was paralyzed")
                    defender.status = "paralyzed";
                }
                console.log(bodySlamDamage);
                break;
            case "Wrap":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    console.log(`Enemy is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus)) {
                    console.log("move missed");
                    return;
                }

                if (defenderVolatileStatus.bound.length === 0) {
                    if (Math.floor(Math.random() * 2) === 0) {
                        console.log("bounded for 4 turns");
                        defenderVolatileStatus.bound.length = 4;
                    } else {
                        console.log("bounded for 5 turns");
                        defenderVolatileStatus.bound.length = 5;
                    }
                    defenderVolatileStatus.bound.name = "Wrap";
                } else {
                    console.log("already bound")
                }
                let wrapDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                defender.damageTaken += wrapDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);
                console.log(wrapDamage);
                break;
            case "Take Down":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    console.log(`Enemy is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus)) {
                    console.log("move missed");
                    return;
                }
                let moveDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)
                defender.damageTaken += moveDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);
                console.log(moveDamage);

                attacker.damageTaken += Math.round(moveDamage / 4);
                attacker.damageTaken = Math.min(attacker.damageTaken, totalAttackerHp);
                console.log("recoil damage", Math.round(moveDamage / 4));

                break;
            // case "Move":
            //     if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
            //         console.log(`Enemy is invulnerable for this turn so ${move.name} missed.`);
            //         return;
            //     }
            //     if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus)) {
            //                         console.log("move missed");
            //                         return;
            //                     }
            //     let moveDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)
            //     defender.damageTaken += moveDamage;
            //     defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);
            //     console.log(moveDamage);
            //     break;
            // case "Rapid Spin":
            //     console.log("unbound if bound")
            //     attackerVolatileStatus.bound.length = 0;
            //     break;
            default:
                //moves in default:
                //Pound, Karate Chop, Mega Punch, Scratch, Vise Grip, Cut, Gust
                // Wing Attack, Slam, Vine Whip, Mega Kick, Horn Attack, Tackle


                // defender.damageTaken += damage;
                // defender.status = "normal";

                // if (defenderVolatileStatus.drowsy > 0) {
                //     console.log("atk failed, already drowsy")
                // } else if (defenderVolatileStatus.sleepTurnLength > 0) {
                //     console.log("atk failed, already sleeping")
                // } else {
                //     defenderVolatileStatus.drowsy = 2;
                // }

                // defenderVolatileStatus.escapePrevention.enabled = true;

                // if (defenderVolatileStatus.confusionLength > 0) {
                //     console.log("atk failed, already confused")
                // } else {
                //     console.log("confused")
                //     defenderVolatileStatus.confusionLength = 3;
                // }

                // defenderVolatileStatus.cursed = true;

                // defenderVolatileStatus.flinch = true;

                // defenderVolatileStatus.infatuation = true;

                // defenderVolatileStatus.leechSeed = true;

                // defender.status = "sleeping";
                // defenderVolatileStatus.nightmare = true;
                // defenderVolatileStatus.sleepTurnLength = 3;

                // defenderVolatileStatus.perishSongLength = 2;

                // defenderVolatileStatus.tauntLength = 3;

                // defenderVolatileStatus.magneticLevitationLength = 3;

                // defenderVolatileStatus.bracing = true;

                // defenderVolatileStatus.aquaRing = true;

                // defenderVolatileStatus.rooting = true;

                // let dmg = 50;


                // if (defenderVolatileStatus.bracing && (totalDefenderHp - defender.damageTaken + dmg) > 1) {
                //     console.log("lived with 1 hp due to brace")
                //     defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp - 1)
                // }

                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    console.log(`Enemy is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus)) {
                    console.log("move missed");
                    return;
                }
                let damage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                defender.damageTaken += damage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp)

                console.log(damage);
                break;
        }
    }
}

async function getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus) {
    //dmg calculations: https://bulbapedia.bulbagarden.net/wiki/Damage#Damage_calculation

    // let fullAttackerDetails = pokemonListFunctions.getPokemonFromId(attacker.pokeId);
    let fullDefenderDetails = await pokemonListFunctions.getPokemonFromId(defender.pokeId);

    let level = attacker.level;

    let criticalStage = {
        0: 24,
        1: 8,
        2: 2,
        3: 1
    }
    //update critical stage "criticalStage[0]"
    // var icon = (area == 1) ? icon1 : (area == 2) ? icon2 : icon0;
    let stage = 0;

    if ((move.name === "Karate Chop") || (move.name === "Razor Wind"))
        stage = 1;
    let critical = (Math.floor(Math.random() * (criticalStage[stage] - 0)) === 0) ? 2 : 1;
    if (critical === 2)
        console.log("critical strike");

    let power = move.pwr || 0;
    if (move.name === "Gust" && defenderVolatileStatus.semiInvulnerable && (defenderVolatileStatus.chargingMove.name === "Fly" || defenderVolatileStatus.chargingMove.name === "Bounce")) {
        console.log("dealing double damage since opponent is in the air");
        power *= 2;
    }
    if (defenderVolatileStatus.minimized && (move.name === "Body Slam" || move.name === "Stomp" || move.name === "Dragon Rush" || move.name === "Steamroller" ||
        move.name === "Heat Crash" || move.name === "Heavy Slam" || move.name === "Flying Press" || move.name === "Malicious Moonsault")) {
        console.log("dealing double damage since opponent is minimized")
        power *= 2;
    }

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

    let stab = 1;
    if (fullDefenderDetails.types.includes(move.type) || defenderVolatileStatus.typeChange === move.type) {
        stab = 1.5;
    }

    // console.log(move)
    // console.log("move.type", move.type)
    let type = getTypeCalculation(move.type, fullDefenderDetails.types, defenderVolatileStatus.typeChange, defenderVolatileStatus.identified);

    // console.log(type)
    let burn = (attacker.status === "burned" && move.category === "physical") ? 0.5 : 1;
    burn = (attacker.status === "frostbite" && move.category === "special") ? 0.5 : burn;

    let other = 1;

    return Math.round(((((((2 * level) / 5) + 2) * power * effectiveAtk / effectiveDef) / 50) + 2) * critical * random * stab * type * burn * other);

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

function doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move) {
    if (defenderVolatileStatus.semiInvulnerable) {
        if (!(attackerVolatileStatus.takingAim > 0 || move.name === "Toxic" || ((defenderVolatileStatus.chargingMove.name === "Fly" || defenderVolatileStatus.chargingMove.name === "Bounce" ||
            defenderVolatileStatus.chargingMove.name === "Sky Drop") && (move.name === "Gust" || move.name === "Hurricane" ||
            move.name === "Sky Uppercut" || move.name === "Smack Down" || move.name === "Thousand Arrows" || move.name === "Thunder" ||
            move.name === "Twister")) || ((defenderVolatileStatus.chargingMove.name === "Fly") && (move.name === "Earthquake" ||
            move.name === "Magnitude" || move.name === "Fissure")) || ((defenderVolatileStatus.chargingMove.name === "Dive") &&
            (move.name === "Surf" || move.name === "Whirlpool")))) {
            return true;
        }
    }
    return false;
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

function getEffectiveAcc(move, accuracyStage, evasionStage, defenderVolatileStatus) {

    let stageMultiplier = {
        "-6": 0.33,
        "-5": 0.375,
        "-4": 0.429,
        "-3": 0.5,
        "-2": 0.6,
        "-1": 0.75,
        "0": 1,
        "1": 1.33,
        "2": 1.667,
        "3": 2,
        "4": 2.33,
        "5": 2.667,
        "6": 3,
    }

    let combinedStage;
    if (defenderVolatileStatus.identified.activated) {
        console.log(`defender was identified`)
        combinedStage = accuracyStage - Math.min(evasionStage, 0)
    } else {
        combinedStage = accuracyStage - evasionStage;
    }

    if (combinedStage > 6) combinedStage = 6;
    if (combinedStage < -6) combinedStage = -6;

    let other = 1;

    // console.log(stageMultiplier[combinedStage.toString()])
    let acc = (move.acc || 100) * stageMultiplier[combinedStage.toString()] * other;
    console.log("acc", acc)

    if (defenderVolatileStatus.takingAim > 0 || (defenderVolatileStatus.telekinesisLength > 0 && (move.name !== "Fissure" || move.name !== "Guillotine" || move.name !== "Horn Drill" || move.name !== "Sheer Cold"))) {
        return 101;
    }
    return acc;
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

function getTypeCalculation(moveType, defenderTypes, typeChange, identified) {
    // console.log(moveType, defenderTypes, typeChange)

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

    let foresightOdorTypeChart = {
        "normal": {
            "rock": 0.5,
            "ghost": 1,
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
            "ghost": 1,
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

    let miracleTypeChart = {
        "normal": {
            "rock": 0.5,
            "ghost": 1,
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
            "ghost": 1,
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
            "dark": 1,
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
    // console.log(typeChart[moveType][defenderTypes[0]])
    // console.log(typeChart[moveType][defenderTypes[1]])
    // console.log(typeChart[moveType][typeChange])

    for (let i = 0; i < defenderTypes.length; i++) {
        if (identified.activated) {
            if (identified.name === "Foresight" || identified.name === "Odor Sleuth") {

                multiplier *= foresightOdorTypeChart[moveType][defenderTypes[i]] || 1;

                if (typeChange !== "") {
                    multiplier *= foresightOdorTypeChart[moveType][typeChange] || 1;
                }

            } else if (identified.name === "Miracle Eye") {

                multiplier *= miracleTypeChart[moveType][defenderTypes[i]] || 1;

                if (typeChange !== "") {
                    multiplier *= miracleTypeChart[moveType][typeChange] || 1;
                }

            }
        } else {

            multiplier *= typeChart[moveType][defenderTypes[i]] || 1;

            if (typeChange !== "") {
                multiplier *= typeChart[moveType][typeChange] || 1;
            }

        }
    }


    // console.log(multiplier)

    if (multiplier === 0)
        console.log("no effect");
    else if (multiplier < 1)
        console.log("not very effective");
    else if (multiplier > 1)
        console.log("super effective");

    return multiplier;
}

function runThroughStatusEffects(pokemon, volatileStatus, totalHp, enemy) {
    // console.log(pokemon.level)
    // console.log(enemy.level)

    if (pokemon.status === "burned") {
        console.log("burned")
        pokemon.damageTaken += Math.round(totalHp / 16);
        pokemon.damageTaken = Math.min(totalHp, pokemon.damageTaken);
    }
    if (pokemon.status === "poisoned") {
        console.log("poisoned")
        pokemon.damageTaken += Math.round(totalHp / 8);
        pokemon.damageTaken = Math.min(totalHp, pokemon.damageTaken);
    }
    if (pokemon.status === "badly poisoned") {
        console.log("badly poisoned")
        pokemon.damageTaken += Math.round(totalHp * (volatileStatus.badlyPoisonTurn + 1) / 16);
        pokemon.damageTaken = Math.min(totalHp, pokemon.damageTaken);
        volatileStatus.badlyPoisonTurn++;
    }
    if (volatileStatus.sleepTurnLength > 0)
        volatileStatus.sleepTurnLength--;

    if (volatileStatus.bound.length > 0) {
        volatileStatus.bound.length--;

        let boundDmg = Math.round(totalHp / 8)
        pokemon.damageTaken += boundDmg;
        pokemon.damageTaken = Math.min(totalHp, pokemon.damageTaken);
        console.log(`bounded by ${volatileStatus.bound.name} did ${boundDmg} dmg`)

        if (volatileStatus.bound.length === 0) {
            console.log("freed from being bound")
        }
        // switch (volatileStatus.bound.name) {
        //     case "Bind":
        //         pokemon.damageTaken += Math.round(totalHp / 8);
        //         pokemon.damageTaken = Math.min(totalHp, pokemon.damageTaken);
        //         break;
        //     case "Clamp":
        //         pokemon.damageTaken += Math.round(totalHp / 8);
        //         pokemon.damageTaken = Math.min(totalHp, pokemon.damageTaken);
        //         break;
        //     case "Fire Spin":
        //         pokemon.damageTaken += Math.round(totalHp / 8);
        //         pokemon.damageTaken = Math.min(totalHp, pokemon.damageTaken);
        //         break;
        //     case "Infestation":
        //         pokemon.damageTaken += Math.round(totalHp / 8);
        //         pokemon.damageTaken = Math.min(totalHp, pokemon.damageTaken);
        //         break;
        //     case "Magma Storm":
        //         pokemon.damageTaken += Math.round(totalHp / 8);
        //         pokemon.damageTaken = Math.min(totalHp, pokemon.damageTaken);
        //         break;
        //     case "Sand Tomb":
        //         pokemon.damageTaken += Math.round(totalHp / 8);
        //         pokemon.damageTaken = Math.min(totalHp, pokemon.damageTaken);
        //         break;
        //     case "Snap Trap":
        //         pokemon.damageTaken += Math.round(totalHp / 8);
        //         pokemon.damageTaken = Math.min(totalHp, pokemon.damageTaken);
        //         break;
        //     case "Thunder Cage":
        //         pokemon.damageTaken += Math.round(totalHp / 8);
        //         pokemon.damageTaken = Math.min(totalHp, pokemon.damageTaken);
        //         break;
        //     case "Whirlpool":
        //         pokemon.damageTaken += Math.round(totalHp / 8);
        //         pokemon.damageTaken = Math.min(totalHp, pokemon.damageTaken);
        //         break;
        //     case "Wrap":
        //         pokemon.damageTaken += Math.round(totalHp / 8);
        //         pokemon.damageTaken = Math.min(totalHp, pokemon.damageTaken);
        //         break;
        //     default:
        //         console.log("Incorrect bind name")
        //         break;
        // }
    }

    if (volatileStatus.cursed) {
        console.log("damaged due to cursed")
        pokemon.damageTaken += Math.round(totalHp / 4);
        pokemon.damageTaken = Math.min(totalHp, pokemon.damageTaken);
    }

    // console.log(volatileStatus)
    if (volatileStatus.drowsy === 1) {
        // console.log("test")
        if (pokemon.status === "normal") {
            // console.log("test2")
            volatileStatus.sleepTurnLength = Math.floor(Math.random() * (4 - 1) + 1);
            pokemon.status = "sleeping";
            console.log(`Due to it's drowsiness ${pokemon.name} fell asleep.`)
        }
    }
    if (volatileStatus.drowsy > 0) {
        volatileStatus.drowsy--;
    }

    if (volatileStatus.confusionLength > 0) {
        volatileStatus.confusionLength--;
    }
    if (volatileStatus.embargoLength > 0) {
        volatileStatus.embargoLength--;
    }
    if (volatileStatus.encore.encoreLength > 0) {
        volatileStatus.encore.encoreLength--;
    }
    volatileStatus.flinch = false;

    if (volatileStatus.healBlockLength > 0) {
        volatileStatus.healBlockLength--;
    }
    if (pokemon.damageTaken < totalHp && volatileStatus.leechSeed) {
        console.log(`leech seed dmg to ${pokemon.level} healing ${enemy.level}`)

        //shouldnt be able to gain hp if enemy is dead

        pokemon.damageTaken += Math.round(totalHp / 8);
        pokemon.damageTaken = Math.min(totalHp, pokemon.damageTaken);

        // console.log(enemy.damageTaken)
        // console.log(enemy.damageTaken)
        enemy.damageTaken -= Math.round(totalHp / 8);
        enemy.damageTaken = Math.max(enemy.damageTaken, 0);
        // console.log(enemy.damageTaken)

        //if enemy pokemon is alive then decrease their damage taken,
        // make sure the lowest it can go is 0 Math.max(0, damageTaken)
    }
    if (pokemon.status === "sleeping" && volatileStatus.nightmare) {
        console.log("had a nightmare");
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

    if (volatileStatus.takingAim > 0) {
        volatileStatus.takingAim--;
    }

    // volatileStatus.telekinesisLength = Math.max(0, volatileStatus.telekinesisLength--);
    if (volatileStatus.telekinesisLength > 0) {
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

async function isType(pokemon, type, typeChange) {
    pokemon = await pokemonListFunctions.getPokemonFromId(pokemon.pokeId);

    if (typeChange === type)
        return true;
    for (let i = 0; i < pokemon.types.length; i++) {
        if (pokemon.types[i] === "fire")
            return true;
    }

    return false;
}