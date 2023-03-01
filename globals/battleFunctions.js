const {MessageEmbed, MessageActionRow, MessageButton, MessageAttachment, MessageSelectMenu} = require('discord.js');
const pokemonFunctions = require("./pokemonFunctions");
const generalFunctions = require("./generalFunctions");
const {PythonShell} = require("python-shell");
// const battlingFunctions = require("../db/functions/battlingFunctions");
const moveListFunctions = require("../db/functions/moveListFunctions");
const pokemonListFunctions = require("../db/functions/pokemonListFunctions");
const trainerFunctions = require("../db/functions/trainerFunctions");
const battlingFunctions = require("../db/functions/battlingFunctions");
const pokemon = require("pokemon");

let inputChannel;

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

        inputChannel = inp.channel;
        // inp.channel.send("Battle option");

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
            let userOneEffectiveSpeed = getEffectiveSpeed(userOneTotalSpeed, battlingDetails.userOneStatStage.speed)
            if (battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].status === "paralyzed") {
                userOneEffectiveSpeed = Math.round(userOneEffectiveSpeed / 2);
            }

            const userTwoSpeedMultiplier = Math.round(pokemonFunctions.multiplierCalculation(battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].evLevels.speed));
            const userTwoSpeedElb = Math.round(pokemonFunctions.elbCalculation(battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].base.speed, userTwoSpeedMultiplier, battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].level));
            const userTwoTotalSpeed = Math.round(pokemonFunctions.otherStatCalculation(battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].level, battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].base.speed, getNatureValue("speed", battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].nature), userTwoSpeedElb));
            let userTwoEffectiveSpeed = getEffectiveSpeed(userTwoTotalSpeed, battlingDetails.userTwoStatStage.speed)
            if (battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].status === "paralyzed") {
                userTwoEffectiveSpeed = Math.round(userTwoEffectiveSpeed / 2);
            }

            //cant escape if thrash, petal dance or outrage
            //cant escape if bound or if charging/recharging
            //allow ghost types to be able to escape if escape prevention is true
            let isGhost = await isType(battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1], "ghost", battlingDetails.userOneVolatileStatus);

            if ((battlingDetails.userOneVolatileStatus.escapePrevention.enabled && !isGhost /*if user is ghost type*/) ||
                battlingDetails.userOneVolatileStatus.bound.length > 0 ||
                battlingDetails.userOneVolatileStatus.chargingMove.chargingLength > 0 ||
                battlingDetails.userOneVolatileStatus.recharging.enabled ||
                battlingDetails.userOneVolatileStatus.thrashing.length > 0
            ) {
                if (battlingDetails.userOneVolatileStatus.escapePrevention.enabled && !isGhost)
                    inputChannel.send("A move was used to prevent you from escaping.");
                else if (battlingDetails.userOneVolatileStatus.bound.length > 0)
                    inputChannel.send("Pokemon is bounded and can't escape.");
                else if (battlingDetails.userOneVolatileStatus.chargingMove.chargingLength > 0)
                    inputChannel.send("Pokemon is busy charging and can't escape.");
                else if (battlingDetails.userOneVolatileStatus.recharging.enabled)
                    inputChannel.send("Pokemon is busy recharging and can't escape.");
                else if (battlingDetails.userOneVolatileStatus.thrashing.length > 0)
                    inputChannel.send("Pokemon is busy thrashing and can't escape.");

                row = module.exports.setRowDefault(row, inp)

                return {
                    content: "_ _",
                    embedDetails: createEmbedDefault(battlingDetails),
                    components: [row]
                };
            }

            if (escapeCalculation(userOneEffectiveSpeed, userTwoEffectiveSpeed, battlingDetails.fleeCount || 0)) {
                //make a list of responses and generate one ie. fled the battle, ran with tail between legs, got scared etc.
                inputChannel.send("Escaped the battle.")
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
                inputChannel.send("Failed to escape.")

                //increase escape count
                battlingFunctions.setFleeCount(battlingDetails._id, battlingDetails.fleeCount + 1)

                // do enemy move
                let enemyMove = await getRandomPokemonMove(battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1]);
                enemyMove = (enemyMove !== "recharge") ? await moveListFunctions.getMove(enemyMove) : enemyMove;

                if (enemyMove !== "recharge" && enemyMove.name !== "Struggle" && battlingDetails.userTwoVolatileStatus.thrashing.length === 0) {
                    let currentMoves = battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].currentMoves;

                    currentMoves = currentMoves.filter(move => {
                        return move.name === enemyMove.name;
                    });
                    currentMoves[0].currentPP--;
                }

                if (await useMove(battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1], battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1], null, enemyMove, battlingDetails)) {
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
            inp.customId === `${inp.user.id}Struggle` || inp.customId === `${inp.user.id}recharge`
        ) {
            //user used a move

            //reset flee count
            battlingFunctions.setFleeCount(battlingDetails._id, 0)

            let enemyMove = await getRandomPokemonMove(battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1]);
            enemyMove = (enemyMove !== "recharge") ? await moveListFunctions.getMove(enemyMove) : enemyMove;

            let userMoveName = inp.customId.replace(inp.user.id, "");
            let userMove = (userMoveName !== "recharge") ? await moveListFunctions.getMove(userMoveName) : userMoveName;


            //decrease pp
            if (userMove !== "recharge" && userMove.name !== "Struggle" && battlingDetails.userOneVolatileStatus.thrashing.length === 0) {
                let currentMoves = battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].currentMoves;

                currentMoves = currentMoves.filter(move => {
                    return move.name === userMove.name;
                });
                currentMoves[0].currentPP--;
            }
            if (enemyMove !== "recharge" && enemyMove.name !== "Struggle" && battlingDetails.userTwoVolatileStatus.thrashing.length === 0) {
                let currentMoves = battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].currentMoves;

                currentMoves = currentMoves.filter(move => {
                    return move.name === enemyMove.name;
                });
                currentMoves[0].currentPP--;
            }

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
        //check if transform was used
        if (battlingDetails.userOneVolatileStatus.transform.enabled) {
            let volatileStatus = battlingDetails.userOneVolatileStatus;
            let pokemonToUpdate = battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1];
            pokemonToUpdate.pokeId = volatileStatus.transform.details.pokeId;
            pokemonToUpdate.name = volatileStatus.transform.details.name;
            pokemonToUpdate.currentMoves = volatileStatus.transform.details.currentMoves;

            pokemonToUpdate.ivStats.atk = volatileStatus.transform.details.ivStats.atk;
            pokemonToUpdate.ivStats.def = volatileStatus.transform.details.ivStats.def;
            pokemonToUpdate.ivStats.spAtk = volatileStatus.transform.details.ivStats.spAtk;
            pokemonToUpdate.ivStats.spDef = volatileStatus.transform.details.ivStats.spDef;
            pokemonToUpdate.ivStats.speed = volatileStatus.transform.details.ivStats.speed;


            pokemonToUpdate.evLevels.atk = volatileStatus.transform.details.evLevels.atk;
            pokemonToUpdate.evLevels.def = volatileStatus.transform.details.evLevels.def;
            pokemonToUpdate.evLevels.spAtk = volatileStatus.transform.details.evLevels.spAtk;
            pokemonToUpdate.evLevels.spDef = volatileStatus.transform.details.evLevels.spDef;
            pokemonToUpdate.evLevels.speed = volatileStatus.transform.details.evLevels.speed;


            pokemonToUpdate.base.attack = volatileStatus.transform.details.base.attack;
            pokemonToUpdate.base.defense = volatileStatus.transform.details.base.defense;
            pokemonToUpdate.base['special-attack'] = volatileStatus.transform.details.base['special-attack'];
            pokemonToUpdate.base['special-defense'] = volatileStatus.transform.details.base['special-defense'];
            pokemonToUpdate.base.speed = volatileStatus.transform.details.base.speed;
        }

        if (battlingDetails.userTwoVolatileStatus.transform.enabled) {
            let volatileStatus = battlingDetails.userTwoVolatileStatus;
            let pokemonToUpdate = battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1];
            pokemonToUpdate.pokeId = volatileStatus.transform.details.pokeId;
            pokemonToUpdate.name = volatileStatus.transform.details.name;
            pokemonToUpdate.currentMoves = volatileStatus.transform.details.currentMoves;

            pokemonToUpdate.ivStats.atk = volatileStatus.transform.details.ivStats.atk;
            pokemonToUpdate.ivStats.def = volatileStatus.transform.details.ivStats.def;
            pokemonToUpdate.ivStats.spAtk = volatileStatus.transform.details.ivStats.spAtk;
            pokemonToUpdate.ivStats.spDef = volatileStatus.transform.details.ivStats.spDef;
            pokemonToUpdate.ivStats.speed = volatileStatus.transform.details.ivStats.speed;


            pokemonToUpdate.evLevels.atk = volatileStatus.transform.details.evLevels.atk;
            pokemonToUpdate.evLevels.def = volatileStatus.transform.details.evLevels.def;
            pokemonToUpdate.evLevels.spAtk = volatileStatus.transform.details.evLevels.spAtk;
            pokemonToUpdate.evLevels.spDef = volatileStatus.transform.details.evLevels.spDef;
            pokemonToUpdate.evLevels.speed = volatileStatus.transform.details.evLevels.speed;


            pokemonToUpdate.base.attack = volatileStatus.transform.details.base.attack;
            pokemonToUpdate.base.defense = volatileStatus.transform.details.base.defense;
            pokemonToUpdate.base['special-attack'] = volatileStatus.transform.details.base['special-attack'];
            pokemonToUpdate.base['special-defense'] = volatileStatus.transform.details.base['special-defense'];
            pokemonToUpdate.base.speed = volatileStatus.transform.details.base.speed;
        }

        if (battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].status === "sleeping") {
            battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].status = "normal";
        }

        if (battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].status === "sleeping") {
            battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].status = "normal";
        }

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

        // console.log(`battle ended due to ${endType}`)

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

    if (battlingDetails.userOneVolatileStatus.thrashing.length > 0) {
        currentMoves = currentMoves.filter(move => {
            return move.name === battlingDetails.userOneVolatileStatus.thrashing.name;
        });
    }

    //check encore

    //check torment

    //check disable
    if (battlingDetails.userOneVolatileStatus.disable.length > 0) {
        currentMoves = currentMoves.filter(move => {
            return move.name !== battlingDetails.userOneVolatileStatus.disable.name;
        });
    }

    //do an if statement and set move to recharging
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
    } else if (battlingDetails.userOneVolatileStatus.recharging.enabled) {
        row.addComponents(
            new MessageButton()
                .setCustomId(
                    `${inp.user.id}recharge`
                )
                .setLabel(
                    `recharge`
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
                    `struggle`
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
    //cant swap pokemon if user is using a recharge move

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

    const pokemonHpMultiplier = Math.round(pokemonFunctions.multiplierCalculation(randomPokemon.evLevels.hp));
    const pokemonElb = Math.round(pokemonFunctions.elbCalculation(randomPokemon.base.hp, pokemonHpMultiplier, randomPokemon.level));
    const pokemonTotalHp = Math.round(pokemonFunctions.hpCalculation(randomPokemon.level, randomPokemon.base.hp, pokemonElb));

    const userHpMultiplier = Math.round(pokemonFunctions.multiplierCalculation(user.evLevels.hp));
    const userElb = Math.round(pokemonFunctions.elbCalculation(user.base.hp, userHpMultiplier, user.level));
    const userTotalHp = Math.round(pokemonFunctions.hpCalculation(user.level, user.base.hp, userElb));

    if (userMove == null) {
        if (battleDetails.userTwoVolatileStatus.recharging.enabled) {
            inputChannel.send(`${randomPokemon.name} is recharging from ${battleDetails.userTwoVolatileStatus.recharging.name}`)
            battleDetails.userTwoVolatileStatus.recharging.enabled = false;
        } else {
            let moveOutput = await executeMove(randomPokemon, user, randomPokemonMove, battleDetails.userTwoStatStage, battleDetails.userOneStatStage, battleDetails.userTwoVolatileStatus, battleDetails.userOneVolatileStatus, userTotalHp, pokemonTotalHp, battleDetails);
            if (moveOutput != null) {
                await module.exports.endRandomBattleEncounter(moveOutput, battleDetails);
                return true;
            }
        }
    }
    //check move priority
    else if (userMove.priority > randomPokemonMove.priority) {
        //user1 atks first
        if (battleDetails.userOneVolatileStatus.recharging.enabled) {
            inputChannel.send(`${user.name} is recharging from ${battleDetails.userOneVolatileStatus.recharging.name}`)
            battleDetails.userOneVolatileStatus.recharging.enabled = false;
        } else {
            let moveOutput = await executeMove(user, randomPokemon, userMove, battleDetails.userOneStatStage, battleDetails.userTwoStatStage, battleDetails.userOneVolatileStatus, battleDetails.userTwoVolatileStatus, pokemonTotalHp, userTotalHp, battleDetails);
            if (moveOutput != null) {
                await module.exports.endRandomBattleEncounter(moveOutput, battleDetails);
                return true;
            }
        }
        //user2 attacks
        //check HP of both pokemon, it can hurt itself in confusion
        if (randomPokemon.damageTaken < pokemonTotalHp && user.damageTaken < userTotalHp) {
            if (battleDetails.userTwoVolatileStatus.recharging.enabled) {
                inputChannel.send(`${randomPokemon.name} is recharging from ${battleDetails.userTwoVolatileStatus.recharging.name}`)
                battleDetails.userTwoVolatileStatus.recharging.enabled = false;
            } else {
                let moveOutput = await executeMove(randomPokemon, user, randomPokemonMove, battleDetails.userTwoStatStage, battleDetails.userOneStatStage, battleDetails.userTwoVolatileStatus, battleDetails.userOneVolatileStatus, userTotalHp, pokemonTotalHp, battleDetails);
                if (moveOutput != null) {
                    await module.exports.endRandomBattleEncounter(moveOutput, battleDetails);
                    return true;
                }
            }
        }
    } else if (userMove.priority < randomPokemonMove.priority) {
        //user2 attacks first
        if (battleDetails.userTwoVolatileStatus.recharging.enabled) {
            inputChannel.send(`${randomPokemon.name} is recharging from ${battleDetails.userTwoVolatileStatus.recharging.name}`)
            battleDetails.userTwoVolatileStatus.recharging.enabled = false;
        } else {
            let moveOutput = await executeMove(randomPokemon, user, randomPokemonMove, battleDetails.userTwoStatStage, battleDetails.userOneStatStage, battleDetails.userTwoVolatileStatus, battleDetails.userOneVolatileStatus, userTotalHp, pokemonTotalHp, battleDetails);
            if (moveOutput != null) {
                await module.exports.endRandomBattleEncounter(moveOutput, battleDetails);
                return true;
            }
        }

        //user one attacks
        //check HP of both pokemon, it can hurt itself in confusion
        if (randomPokemon.damageTaken < pokemonTotalHp && user.damageTaken < userTotalHp) {
            if (battleDetails.userOneVolatileStatus.recharging.enabled) {
                inputChannel.send(`${user.name} is recharging from ${battleDetails.userOneVolatileStatus.recharging.name}`)
                battleDetails.userOneVolatileStatus.recharging.enabled = false;
            } else {
                let moveOutput = await executeMove(user, randomPokemon, userMove, battleDetails.userOneStatStage, battleDetails.userTwoStatStage, battleDetails.userOneVolatileStatus, battleDetails.userTwoVolatileStatus, pokemonTotalHp, userTotalHp, battleDetails);
                if (moveOutput != null) {
                    await module.exports.endRandomBattleEncounter(moveOutput, battleDetails);
                    return true;
                }
            }
        }
    }
    //check pokemon base speed
    else {
        const userSpeedMultiplier = Math.round(pokemonFunctions.multiplierCalculation(user.evLevels.speed));
        const userSpeedElb = Math.round(pokemonFunctions.elbCalculation(user.base.speed, userSpeedMultiplier, user.level));
        const userTotalSpeed = Math.round(pokemonFunctions.otherStatCalculation(user.level, user.base.speed, getNatureValue("speed", user.nature), userSpeedElb));
        let userEffectiveSpeed = getEffectiveSpeed(userTotalSpeed, battleDetails.userOneStatStage.speed);
        if (user.status === "paralyzed") {
            userEffectiveSpeed = Math.round(userEffectiveSpeed / 2);
        }

        const pokemonSpeedMultiplier = Math.round(pokemonFunctions.multiplierCalculation(randomPokemon.evLevels.speed));
        const pokemonSpeedElb = Math.round(pokemonFunctions.elbCalculation(randomPokemon.base.speed, pokemonSpeedMultiplier, randomPokemon.level));
        const pokemonTotalSpeed = Math.round(pokemonFunctions.otherStatCalculation(randomPokemon.level, randomPokemon.base.speed, getNatureValue("speed", randomPokemon.nature), pokemonSpeedElb));
        let pokemonEffectiveSpeed = getEffectiveSpeed(pokemonTotalSpeed, battleDetails.userTwoStatStage.speed);
        if (randomPokemon.status === "paralyzed") {
            pokemonEffectiveSpeed = Math.round(pokemonEffectiveSpeed / 2);
        }

        if (userEffectiveSpeed > pokemonEffectiveSpeed) {
            //user1 atks first
            if (battleDetails.userOneVolatileStatus.recharging.enabled) {
                inputChannel.send(`${user.name} is recharging from ${battleDetails.userOneVolatileStatus.recharging.name}`)
                battleDetails.userOneVolatileStatus.recharging.enabled = false;
            } else {
                let moveOutput = await executeMove(user, randomPokemon, userMove, battleDetails.userOneStatStage, battleDetails.userTwoStatStage, battleDetails.userOneVolatileStatus, battleDetails.userTwoVolatileStatus, pokemonTotalHp, userTotalHp, battleDetails);
                if (moveOutput != null) {
                    await module.exports.endRandomBattleEncounter(moveOutput, battleDetails);
                    return true;
                }
            }
            //user2 attacks
            //check HP of both pokemon, it can hurt itself in confusion
            if (randomPokemon.damageTaken < pokemonTotalHp && user.damageTaken < userTotalHp) {
                if (battleDetails.userTwoVolatileStatus.recharging.enabled) {
                    inputChannel.send(`${randomPokemon.name} is recharging from ${battleDetails.userTwoVolatileStatus.recharging.name}`)
                    battleDetails.userTwoVolatileStatus.recharging.enabled = false;
                } else {
                    let moveOutput = await executeMove(randomPokemon, user, randomPokemonMove, battleDetails.userTwoStatStage, battleDetails.userOneStatStage, battleDetails.userTwoVolatileStatus, battleDetails.userOneVolatileStatus, userTotalHp, pokemonTotalHp, battleDetails);
                    if (moveOutput != null) {
                        await module.exports.endRandomBattleEncounter(moveOutput, battleDetails);
                        return true;
                    }
                }
            }
        } else if (userTotalSpeed < pokemonTotalSpeed) {
            //user2 attacks first
            if (battleDetails.userTwoVolatileStatus.recharging.enabled) {
                inputChannel.send(`${randomPokemon.name} is recharging from ${battleDetails.userTwoVolatileStatus.recharging.name}`)
                battleDetails.userTwoVolatileStatus.recharging.enabled = false;
            } else {
                let moveOutput = await executeMove(randomPokemon, user, randomPokemonMove, battleDetails.userTwoStatStage, battleDetails.userOneStatStage, battleDetails.userTwoVolatileStatus, battleDetails.userOneVolatileStatus, userTotalHp, pokemonTotalHp, battleDetails);
                if (moveOutput != null) {
                    await module.exports.endRandomBattleEncounter(moveOutput, battleDetails);
                    return true;
                }
            }

            //user one attacks
            //check HP of both pokemon, it can hurt itself in confusion
            if (randomPokemon.damageTaken < pokemonTotalHp && user.damageTaken < userTotalHp) {
                if (battleDetails.userOneVolatileStatus.recharging.enabled) {
                    inputChannel.send(`${user.name} is recharging from ${battleDetails.userOneVolatileStatus.recharging.name}`)
                    battleDetails.userOneVolatileStatus.recharging.enabled = false;
                } else {
                    let moveOutput = await executeMove(user, randomPokemon, userMove, battleDetails.userOneStatStage, battleDetails.userTwoStatStage, battleDetails.userOneVolatileStatus, battleDetails.userTwoVolatileStatus, pokemonTotalHp, userTotalHp, battleDetails);
                    if (moveOutput != null) {
                        await module.exports.endRandomBattleEncounter(moveOutput, battleDetails);
                        return true;
                    }
                }
            }
        }
        //randomly pick who goes first
        else {
            if (Math.floor(Math.random() * 2) === 0) {
                //user1 atks first
                if (battleDetails.userOneVolatileStatus.recharging.enabled) {
                    inputChannel.send(`${user.name} is recharging from ${battleDetails.userOneVolatileStatus.recharging.name}`)
                    battleDetails.userOneVolatileStatus.recharging.enabled = false;
                } else {
                    let moveOutput = await executeMove(user, randomPokemon, userMove, battleDetails.userOneStatStage, battleDetails.userTwoStatStage, battleDetails.userOneVolatileStatus, battleDetails.userTwoVolatileStatus, pokemonTotalHp, userTotalHp, battleDetails);
                    if (moveOutput != null) {
                        await module.exports.endRandomBattleEncounter(moveOutput, battleDetails);
                        return true;
                    }
                }
                //user2 attacks
                //check HP of both pokemon, it can hurt itself in confusion
                if (randomPokemon.damageTaken < pokemonTotalHp && user.damageTaken < userTotalHp) {
                    if (battleDetails.userTwoVolatileStatus.recharging.enabled) {
                        inputChannel.send(`${randomPokemon.name} is recharging from ${battleDetails.userTwoVolatileStatus.recharging.name}`)
                        battleDetails.userTwoVolatileStatus.recharging.enabled = false;
                    } else {
                        let moveOutput = await executeMove(randomPokemon, user, randomPokemonMove, battleDetails.userTwoStatStage, battleDetails.userOneStatStage, battleDetails.userTwoVolatileStatus, battleDetails.userOneVolatileStatus, userTotalHp, pokemonTotalHp, battleDetails);
                        if (moveOutput != null) {
                            await module.exports.endRandomBattleEncounter(moveOutput, battleDetails);
                            return true;
                        }
                    }
                }
            } else {
                //user2 attacks first
                if (battleDetails.userTwoVolatileStatus.recharging.enabled) {
                    inputChannel.send(`${randomPokemon.name} is recharging from ${battleDetails.userTwoVolatileStatus.recharging.name}`)
                    battleDetails.userTwoVolatileStatus.recharging.enabled = false;
                } else {
                    let moveOutput = await executeMove(randomPokemon, user, randomPokemonMove, battleDetails.userTwoStatStage, battleDetails.userOneStatStage, battleDetails.userTwoVolatileStatus, battleDetails.userOneVolatileStatus, userTotalHp, pokemonTotalHp, battleDetails);
                    if (moveOutput != null) {
                        await module.exports.endRandomBattleEncounter(moveOutput, battleDetails);
                        return true;
                    }
                }

                //user one attacks
                //check HP of both pokemon, it can hurt itself in confusion
                if (randomPokemon.damageTaken < pokemonTotalHp && user.damageTaken < userTotalHp) {
                    if (battleDetails.userOneVolatileStatus.recharging.enabled) {
                        inputChannel.send(`${user.name} is recharging from ${battleDetails.userOneVolatileStatus.recharging.name}`)
                        battleDetails.userOneVolatileStatus.recharging.enabled = false;
                    } else {
                        let moveOutput = await executeMove(user, randomPokemon, userMove, battleDetails.userOneStatStage, battleDetails.userTwoStatStage, battleDetails.userOneVolatileStatus, battleDetails.userTwoVolatileStatus, pokemonTotalHp, userTotalHp, battleDetails);
                        if (moveOutput != null) {
                            await module.exports.endRandomBattleEncounter(moveOutput, battleDetails);
                            return true;
                        }
                    }
                }
            }
        }
    }

    //account for destiny bond, if user dies against bonded pokemon, the bonded pokemon dies too
    if (user.damageTaken >= userTotalHp && battleDetails.userOneVolatileStatus.destinyBond === battleDetails.userOneCurrentPokemon) {
        inputChannel.send("Due to destiny bond both pokemon have feinted.")
        randomPokemon.damageTaken = pokemonTotalHp;
    }
    if (randomPokemon.damageTaken >= pokemonTotalHp && battleDetails.userTwoVolatileStatus.destinyBond === battleDetails.userTwoCurrentPokemon) {
        inputChannel.send("Due to destiny bond both pokemon have feinted.")
        user.damageTaken = userTotalHp;
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
}

function getRandomPokemonMove(pokemon) {

    //need to do the same move checks used on user

    let moveList = pokemon.currentMoves.sort((a, b) => {
        return b.currentPP - a.currentPP;
    })

    if (moveList.length < 1 || moveList[0].currentPP < 1) return "Struggle";

    let randomMove = pokemon.currentMoves[Math.floor(Math.random() * pokemon.currentMoves.length)];

    while (randomMove.currentPP < 1) {
        randomMove = pokemon.currentMoves[Math.floor(Math.random() * pokemon.currentMoves.length)];
    }

    return randomMove.name;
}

async function executeMove(attacker, defender, move, attackerStatStage, defenderStatStage, attackerVolatileStatus, defenderVolatileStatus, totalDefenderHp, totalAttackerHp, battleDetails) {
    attackerVolatileStatus.semiInvulnerable = false;

    if (attackerVolatileStatus.encore.encoreLength === 0) {
        attackerVolatileStatus.encore.moveToRepeat = move.name;
    }

    if (attackerVolatileStatus.disable.length === 0) {
        attackerVolatileStatus.disable.name = move.name;
    } else {
        if (attackerVolatileStatus.disable.name === move.name) {
            inputChannel.send(`${move.name} failed.`)
            return;
        }
    }

    // if (attackerVolatileStatus.encore.encoreLength > 0) {
    //     move = await moveListFunctions.getMove(attackerVolatileStatus.encore.name);
    //     //decrease pp for move should be at the end not here
    //     //if cant decrease pp then use struggle
    //     console.log(`due to encore move was changed to ${move.name}`);
    // }

    defenderVolatileStatus.mimicLastOpponentMove = move.name;

    if (attacker.status === "frozen") {
        let movesThatThaw = new Set(["Fire Spin", "Burn Up", "Flame Wheel", "Flare Blitz", "Fusion Flare",
            "Pyro Ball", "Sacred Fire", "Scald", "Scorching Sands", "Steam Eruption"])

        if (Math.floor(Math.random() * 5) === 0 || movesThatThaw.has(move.name)) {
            attacker.status = "normal";
            inputChannel.send(`${attacker.name} managed to thaw out.`)
        } else {
            inputChannel.send(`${attacker.name} is frozen.`)
            return;
        }
    }

    if (attacker.status === "paralyzed") {
        if (Math.floor(Math.random() * 4) === 0) {
            inputChannel.send(`${attacker.name} is paralyzed and can't move.`)
            return;
        }
    }

    //make user pokemon awake if the battle ends
    if (attacker.status === "sleeping") {
        if (attackerVolatileStatus.sleepTurnLength === 1) {
            inputChannel.send(`${attacker.name} woke up.`)
            attacker.status = "normal";
        } else {
            inputChannel.send(`${attacker.name} is fast asleep.`)
            return;
        }
    }

    if (attackerVolatileStatus.flinch) {
        inputChannel.send(`${attacker.name} flinched.`)
        return;
    }

    let infatuation = Math.floor(Math.random() * 2);
    if (attackerVolatileStatus.infatuation && infatuation === 0) {
        inputChannel.send(`${attacker.name} is in love.`)
        return;
        // if any pokemon switches out infatuation is removed
    }

    if (attackerVolatileStatus.confusionLength) {
        if (attackerVolatileStatus.confusionLength === 1) {
            inputChannel.send(`${attacker.name} snapped out of it's confusion.`)
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

                let atkElb = Math.round(pokemonFunctions.elbCalculation(attacker.base.attack, atkMultiplier, attacker.level));
                let atk = Math.round(pokemonFunctions.otherStatCalculation(attacker.level, attacker.base.attack, getNatureValue("atk", attacker.nature), atkElb));

                effectiveAtk = getEffectiveAtk(atk, attackerStatStage.atk, critical);

                let defMultiplier = Math.round(pokemonFunctions.multiplierCalculation(attacker.evLevels.def));
                let defElb = Math.round(pokemonFunctions.elbCalculation(attacker.base.defense, defMultiplier, attacker.level));
                let def = Math.round(pokemonFunctions.otherStatCalculation(attacker.level, attacker.base.defense, getNatureValue("def", attacker.nature), defElb));

                effectiveDef = getEffectiveDef(def, defenderStatStage.def, critical);

                let damage = Math.round(((((((2 * attacker.level) / 5) + 2) * 40 * effectiveAtk / effectiveDef) / 50) + 2) * critical * (Math.floor(Math.random() * (101 - 85) + 85) / 100) * burn * 1.001);

                attacker.damageTaken += damage;
                attacker.damageTaken = Math.min(attacker.damageTaken, totalAttackerHp)
                inputChannel.send(`${attacker.name} hurt itself in it's confusion and did ${damage} dmg.`)
                return;
            }
        }
    }

    if (move.type === "ground" && defenderVolatileStatus.magneticLevitationLength > 0) {
        inputChannel.send(`Due to magnetic levitation ${attacker.name}'s ground move had no effect.`)
        return;
    }

    if (move.type === "ground" && defenderVolatileStatus.telekinesisLength > 0) {
        inputChannel.send(`Due to telekinesis ${attacker.name}'s ground move had no effect.`)
        return;
    }

    let movesThatBypassProtect = new Set(["Acupressure", "Aromatic Mist", "Bestow",
        "Block", "Confide", "Conversion 2", "Curse", "Decorate", "Doom Desire", "Feint",
        "Flower Shield", "Future Sight", "Hold Hands", "Hyperspace Fury", "Hyperspace Hole",
        "Mean Look", "Nightmare", "Perish Song", "Phantom Force", "Play Nice", "Psych Up",
        "Roar", "Role Play", "Rototiller", "Shadow Force", "Sketch", "Spider Web",
        "Tearful Look", "Teatime", "Transform", "Whirlwind", "Jump Kick", "High Jump Kick"])
    if (defenderVolatileStatus.protection.enabled && !movesThatBypassProtect.has(move.name)) {
        inputChannel.send(`${defender.name} is protected.`)
        return;
    }

    inputChannel.send(`${attacker.name} used ${move.name} on ${defender.name}.`);

    if (move.type === "fire" && defender.status === "frozen") {
        defender.status = "normal";

        inputChannel.send(`${move.name} thawed out ${defender.name}.`);
    }

    if (move.category === "status") {
        if (attackerVolatileStatus.tauntLength > 0) {
            inputChannel.send(`Move failed, ${attacker.name} used a status move while taunted.`);
            return;
        }

        if (defenderVolatileStatus.magicCoat) {

        } else {
            switch (move.name) {
                case "Swords Dance":
                    attackerStatStage.atk = Math.min(6, attackerStatStage.atk + 2);
                    inputChannel.send(`${attacker.name}'s attack was raised.`);
                    break;
                case "Whirlwind":
                    if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                        return;
                    }
                    inputChannel.send("Whirlwind ended the battle.");
                    return "whirlwind";
                case "Sand Attack":
                    if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                        return;
                    }

                    if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                        inputChannel.send(`${move.name} missed.`);
                        return;
                    }

                    if (defenderVolatileStatus.mistLength > 0) {
                        inputChannel.send("Mist covers the field so the attack couldn't bring their defense down.")
                        return;
                    }

                    inputChannel.send(`${defender.name}'s accuracy was decreased.`)
                    defenderStatStage.accuracy = Math.max(-6, defenderStatStage.accuracy - 1);
                    break;
                case "Tail Whip":
                    if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                        return;
                    }

                    if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                        inputChannel.send(`${move.name} missed.`);
                        return;
                    }

                    if (defenderVolatileStatus.mistLength > 0) {
                        inputChannel.send("Mist covers the field so the attack couldn't bring their defense down.");
                        return;
                    }

                    inputChannel.send(`${defender.name}'s defense was decreased.`);
                    defenderStatStage.def = Math.max(-6, defenderStatStage.def - 1)
                    break;
                case "Leer":
                    if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                        return;
                    }

                    if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                        inputChannel.send(`${move.name} missed.`);
                        return;
                    }

                    if (defenderVolatileStatus.mistLength > 0) {
                        inputChannel.send("Mist covers the field so the attack couldn't bring their defense down.")
                        return;
                    }

                    inputChannel.send(`${defender.name}'s defense was decreased.`)
                    defenderStatStage.def = Math.max(-6, defenderStatStage.def - 1)
                    break;
                case "Growl":
                    if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                        return;
                    }

                    if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                        inputChannel.send(`${move.name} missed.`);
                        return;
                    }

                    if (defenderVolatileStatus.mistLength > 0) {
                        inputChannel.send("Mist covers the field so the attack couldn't bring their attack down.")
                        return;
                    }

                    inputChannel.send(`${defender.name}'s attack was decreased.`)
                    defenderStatStage.atk = Math.max(-6, defenderStatStage.atk - 1);
                    break;
                case "Roar":
                    if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                        return;
                    }
                    inputChannel.send("Roar ended the battle.");
                    return "roar";
                case "Sing":
                    if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                        return;
                    }

                    if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                        inputChannel.send(`${move.name} missed.`);
                        return;
                    }
                    if (defender.status === "normal") {
                        inputChannel.send(`${defender.name} was put to sleep.`)
                        defender.status = "sleeping";
                        defenderVolatileStatus.sleepTurnLength = Math.floor(Math.random() * (4 - 1) + 1);
                    } else {
                        inputChannel.send(`${move.name} failed.`)
                    }
                    break
                case "Supersonic":
                    if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                        return;
                    }

                    if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                        inputChannel.send(`${move.name} missed.`);
                        return;
                    }
                    if (defenderVolatileStatus.confusionLength === 0) {
                        inputChannel.send(`${defender.name} is now confused.`);
                        defenderVolatileStatus.confusionLength = Math.floor(Math.random() * (4 - 1) + 1);
                    } else {
                        inputChannel.send(`${move.name} failed.`);
                    }
                    break
                case "Disable":
                    if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                        inputChannel.send(`${move.name} missed.`);
                        return;
                    }
                    if (defenderVolatileStatus.disable.length === 0 && defenderVolatileStatus.disable.name !== "") {
                        defenderVolatileStatus.disable.length = 5;
                        inputChannel.send(`${defenderVolatileStatus.disable.name} is disabled.`)
                    } else {
                        inputChannel.send(`${move.name} failed.`)
                    }

                    break;
                case "Mist":
                    attackerVolatileStatus.mistLength = 6;
                    inputChannel.send("A mist has enveloped the battlefield.")
                    break;
                case "Growth":
                    inputChannel.send(`${attacker.name}'s attack and special attack was raised.`);
                    attackerStatStage.atk = Math.min(6, attackerStatStage.atk + 1);
                    attackerStatStage.spAtk = Math.min(6, attackerStatStage.spAtk + 1);
                    break;
                case "Poison Powder":
                    if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                        return;
                    }

                    if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                        inputChannel.send(`${move.name} missed.`);
                        return;
                    }

                    if (defender.status === "normal" && !await isType(defender, "grass", defenderVolatileStatus) && !await isType(defender, "steel", defenderVolatileStatus) && !await isType(defender, "poison", defenderVolatileStatus)) {
                        inputChannel.send(`${defender.name} was poisoned`)
                        defender.status = "poisoned";
                    } else {
                        inputChannel.send("move failed")
                    }
                    break;
                case "Stun Spore":
                    if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                        return;
                    }

                    if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                        inputChannel.send(`${move.name} missed.`);
                        return;
                    }

                    if (defender.status === "normal" && !await isType(defender, "electric", defenderVolatileStatus) && !await isType(defender, "grass", defenderVolatileStatus)) {
                        inputChannel.send(`${move.name} was paralyzed.`)
                        defender.status = "paralyzed";
                    } else {
                        inputChannel.send(`${move.name} failed.`)
                    }
                    break;
                case "Sleep Powder":
                    if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                        return;
                    }

                    if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                        inputChannel.send(`${move.name} missed.`);
                        return;
                    }
                    if (defender.status === "normal" && !await isType(defender, "grass", defenderVolatileStatus)) {
                        inputChannel.send(`${defender.name} was put to sleep`)
                        defender.status = "sleeping";
                        defenderVolatileStatus.sleepTurnLength = Math.floor(Math.random() * (4 - 1) + 1);
                    } else {
                        inputChannel.send(`${move.name} failed.`)
                    }
                    break;
                case "String Shot":
                    if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                        return;
                    }

                    if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                        inputChannel.send(`${move.name} missed.`);
                        return;
                    }

                    if (defenderVolatileStatus.mistLength > 0) {
                        inputChannel.send("Mist covers the field so the attack couldn't bring their speed down.")
                        return;
                    }

                    inputChannel.send(`${defender.name}'s speed was decreased.`)
                    defenderStatStage.speed = Math.max(-6, defenderStatStage.speed - 2);
                    break;
                case "Thunder Wave":
                    if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                        return;
                    }

                    if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                        inputChannel.send(`${move.name} missed.`);
                        return;
                    }
                    if (defender.status === "normal" && !await isType(defender, "electric", defenderVolatileStatus) && !await isType(defender, "ground", defenderVolatileStatus)) {
                        inputChannel.send(`${defender.name} was paralyzed.`);
                        defender.status = "paralyzed";
                    } else {
                        inputChannel.send(`${move.name} failed.`)
                    }
                    break;
                case "Toxic":
                    if (!await isType(attacker, "poison", attackerVolatileStatus) && doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                        return;
                    }

                    if (!await isType(attacker, "poison", attackerVolatileStatus) && Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                        inputChannel.send(`${move.name} missed.`);
                        return;
                    }

                    if (defender.status === "normal" && !await isType(defender, "steel", defenderVolatileStatus) && !await isType(defender, "poison", defenderVolatileStatus)) {
                        inputChannel.send(`${defender.name} was badly poisoned.`)
                        defender.status = "badly poisoned";
                    } else {
                        inputChannel.send(`${move.name} failed.`)
                    }
                    break;
                case "Hypnosis":
                    if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                        return;
                    }

                    if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                        inputChannel.send(`${move.name} missed.`);
                        return;
                    }
                    if (defender.status === "normal") {
                        inputChannel.send(`${defender.name} was put to sleep.`)
                        defender.status = "sleeping";
                        defenderVolatileStatus.sleepTurnLength = Math.floor(Math.random() * (4 - 1) + 1);
                    } else {
                        inputChannel.send(`${move.name} failed.`)
                    }
                    break;
                case "Meditate":
                    attackerStatStage.atk = Math.min(6, attackerStatStage.atk + 1);
                    inputChannel.send(`${attacker.name}'s attack was raised.`);
                    break;
                case "Agility":
                    attackerStatStage.speed = Math.min(6, attackerStatStage.speed + 2);
                    inputChannel.send(`${attacker.name}'s attack was raised.`);
                    break;
                case "Teleport":
                    let trappingMoves = new Set(["Anchor Shot", "Block", "Fairy Lock",
                        "Ingrain", "Jaw Lock", "Mean Look", "No Retreat", "Octolock",
                        "Shadow Hold", "Spider Web", "Spirit Shackle"]);

                    if (!await isType(attacker, "Ghost", attackerVolatileStatus) && attackerVolatileStatus.escapePrevention.enabled && trappingMoves.has(attackerVolatileStatus.escapePrevention.name)) {
                        inputChannel.send(`${move.name} failed.`)
                        break;
                    }
                    inputChannel.send("Teleport ended the battle.");
                    return "teleport";
                case "Mimic":
                    if (attackerVolatileStatus.mimicLastOpponentMove === "" || attackerVolatileStatus.mimicLastOpponentMove === "Transform") {
                        inputChannel.send("Move failed, nothing to mimic.");
                        return;
                    }
                    inputChannel.send(`${attacker.name} copied ${attackerVolatileStatus.mimicLastOpponentMove}.`);
                    let newMove = await moveListFunctions.getMove(attackerVolatileStatus.mimicLastOpponentMove);
                    return await executeMove(attacker, defender, newMove, attackerStatStage, defenderStatStage, attackerVolatileStatus, defenderVolatileStatus, totalDefenderHp, totalAttackerHp, battleDetails);
                case "Screech":
                    if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                        return;
                    }

                    if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                        inputChannel.send(`${move.name} missed.`);
                        return;
                    }

                    if (defenderVolatileStatus.mistLength > 0) {
                        inputChannel.send("Mist covers the field so the attack couldn't bring their defense down.");
                        return;
                    }

                    inputChannel.send(`${defender.name}'s defense was decreased.`);
                    defenderStatStage.def = Math.max(-6, defenderStatStage.def - 2);
                    break;
                case "Double Team":
                    inputChannel.send(`${attacker.name}'s evasion was increased.`);
                    attackerStatStage.evasion = Math.min(6, attackerStatStage.evasion + 1);
                    break;
                case "Recover":
                    if (attackerVolatileStatus.healBlockLength === 0) {
                        let healAmount = Math.round(totalAttackerHp / 2);
                        attacker.damageTaken -= healAmount;
                        attacker.damageTaken = Math.max(0, attacker.damageTaken);
                        inputChannel.send(`${defender.name} was healed for ${healAmount}.`);
                    } else {
                        inputChannel.send(`${defender.name}'s healing was blocked.`);
                    }
                    break;
                case "Harden":
                    inputChannel.send(`${attacker.name}'s defense was increased.`);
                    attackerStatStage.def = Math.min(6, attackerStatStage.def + 1);
                    break;
                case "Minimize":
                    inputChannel.send(`${attacker.name}'s evasion was increased.`);
                    attackerVolatileStatus.minimized = true;
                    attackerStatStage.evasion = Math.min(6, attackerStatStage.evasion + 2);
                    break;
                case "Smokescreen":
                    if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                        return;
                    }

                    if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                        inputChannel.send(`${move.name} missed.`);
                        return;
                    }

                    if (defenderVolatileStatus.mistLength > 0) {
                        inputChannel.send("Mist covers the field so the attack couldn't bring their accuracy down.");
                        return;
                    }

                    inputChannel.send(`${defender.name}'s accuracy was decreased.`);
                    defenderStatStage.accuracy = Math.max(-6, defenderStatStage.accuracy - 1);
                    break;
                case "Confuse Ray":
                    if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                        return;
                    }

                    if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                        inputChannel.send(`${move.name} missed.`);
                        return;
                    }

                    if (defenderVolatileStatus.confusionLength === 0) {
                        inputChannel.send(`${defender.name} is now confused.`);
                        defenderVolatileStatus.confusionLength = Math.floor(Math.random() * (4 - 1) + 1);
                    } else {
                        inputChannel.send(`${move.name} failed.`);
                    }
                    break;
                case "Withdraw":
                    inputChannel.send(`${attacker.name}'s defense was increased.`);
                    attackerStatStage.def = Math.min(6, attackerStatStage.def + 1);
                    break;
                case "Defense Curl":
                    inputChannel.send(`${attacker.name}'s defense was increased.`);
                    attackerStatStage.def = Math.min(6, attackerStatStage.def + 1);
                    attackerVolatileStatus.defenseCurl = true;
                    break;
                case "Light Screen":
                    if (attackerVolatileStatus.lightScreenLength === 0) {
                        attackerVolatileStatus.lightScreenLength = 6;
                        inputChannel.send("A screen is set up for 5 turns.");
                    } else {
                        inputChannel.send(`${move.name} failed.`);
                    }
                    break;
                case "Haze":
                    statReset(attackerStatStage);
                    statReset(defenderStatStage);

                function statReset(statStage) {
                    statStage.atk = 0;
                    statStage.def = 0;
                    statStage.spAtk = 0;
                    statStage.spDef = 0;
                    statStage.speed = 0;
                    statStage.evasion = 0;
                    statStage.accuracy = 0;
                }

                    inputChannel.send("All stat changes have been reset.")
                    break;
                case "Reflect":
                    if (attackerVolatileStatus.reflectLength === 0) {
                        attackerVolatileStatus.reflectLength = 6;
                        inputChannel.send("A screen is set up for 5 turns.");
                    } else {
                        inputChannel.send(`${move.name} failed.`);
                    }
                    break;
                case "Focus Energy":
                    attackerStatStage.crit = Math.min(3, attackerStatStage.crit + 2);
                    inputChannel.send(`${attacker.name}'s crit was increased.`);
                    break;
                case "Amnesia":
                    attackerStatStage.spDef = Math.min(6, attackerStatStage.spDef + 2);
                    inputChannel.send(`${attacker.name}'s defense was increased.`);
                    break;
                case "Kinesis":
                    if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                        return;
                    }

                    if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                        inputChannel.send(`${move.name} missed.`);
                        return;
                    }

                    if (defenderVolatileStatus.mistLength > 0) {
                        inputChannel.send("Mist covers the field so the attack couldn't bring their accuracy down.");
                        return;
                    }

                    inputChannel.send(`${defender.name}'s accuracy was decreased.`);
                    defenderStatStage.accuracy = Math.max(-6, defenderStatStage.accuracy - 1);
                    break;
                case "Soft-Boiled":
                    if (attackerVolatileStatus.healBlockLength === 0) {
                        let healAmount = Math.round(totalAttackerHp / 2);
                        attacker.damageTaken -= healAmount;
                        attacker.damageTaken = Math.max(0, attacker.damageTaken);
                        inputChannel.send(`${defender.name} was healed for ${healAmount}.`);
                    } else {
                        inputChannel.send(`${defender.name}'s healing was blocked.`);
                    }
                    break;
                case "Glare":
                    if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                        return;
                    }

                    if (!defenderVolatileStatus.minimized && Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                        inputChannel.send(`${move.name} missed.`);
                        return;
                    }

                    let glareEffectChance = Math.floor(Math.random() * 100);
                    if (glareEffectChance < move.effect_chance && defender.status === "normal" && !await isType(defender, "electric", defenderVolatileStatus) && !await isType(defender, "ghost", defenderVolatileStatus)) {
                        inputChannel.send(`${defender.name} was paralyzed.`);
                        defender.status = "paralyzed";
                    }
                    break;
                case "Poison Gas":
                    if (!await isType(attacker, "poison", attackerVolatileStatus) && doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                        return;
                    }

                    if (!await isType(attacker, "poison", attackerVolatileStatus) && Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                        inputChannel.send(`${move.name} missed.`);
                        return;
                    }

                    if (defender.status === "normal" && !await isType(defender, "poison", defenderVolatileStatus)) {
                        inputChannel.send(`${defender.name} was poisoned.`)
                        defender.status = "poisoned";
                    } else {
                        inputChannel.send(`${move.name} failed.`)
                    }
                    break;
                case "Lovely Kiss":
                    if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                        return;
                    }

                    if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                        inputChannel.send(`${move.name} missed.`);
                        return;
                    }
                    if (defender.status === "normal") {
                        inputChannel.send(`${defender.name} was put to sleep.`)
                        defender.status = "sleeping";
                        defenderVolatileStatus.sleepTurnLength = Math.floor(Math.random() * (4 - 1) + 1);
                    } else {
                        inputChannel.send(`${move.name} failed.`)
                    }
                    break;
                case "Spore":
                    if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                        return;
                    }

                    if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                        inputChannel.send(`${move.name} missed.`);
                        return;
                    }
                    if (defender.status === "normal") {
                        inputChannel.send(`${defender.name} was put to sleep.`)
                        defender.status = "sleeping";
                        defenderVolatileStatus.sleepTurnLength = Math.floor(Math.random() * (4 - 1) + 1);
                    } else {
                        inputChannel.send(`${move.name} failed.`)
                    }
                    break;
                case "Transform":
                    if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                        return;
                    }

                    if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                        inputChannel.send(`${move.name} missed.`);
                        return;
                    }

                    if (defenderVolatileStatus.transform.enabled) {
                        inputChannel.send(`${move.name} failed.`)
                    }

                    attackerVolatileStatus.conversion = false;
                    attackerVolatileStatus.transform.enabled = true;
                    attackerVolatileStatus.transform.details = {
                        pokeId: attacker.pokeId,
                        name: attacker.name,
                        currentMoves: attacker.currentMoves,
                        ivStats: {
                            atk: attacker.ivStats.atk,
                            def: attacker.ivStats.def,
                            spAtk: attacker.ivStats.spAtk,
                            spDef: attacker.ivStats.spDef,
                            speed: attacker.ivStats.speed
                        },
                        evLevels: {
                            atk: attacker.evLevels.atk,
                            def: attacker.evLevels.def,
                            spAtk: attacker.evLevels.spAtk,
                            spDef: attacker.evLevels.spDef,
                            speed: attacker.evLevels.speed
                        },
                        base: {
                            attack: attacker.base.attack,
                            defense: attacker.base.defense,
                            'special-attack': attacker.base['special-attack'],
                            'special-defense': attacker.base['special-defense'],
                            speed: attacker.base.speed
                        },
                    };

                    attacker.pokeId = defender.pokeId;
                    attacker.name = defender.name;
                    attacker.currentMoves = defender.currentMoves;
                    for (let i = 0; i < attacker.currentMoves.length; i++) {
                        attacker.currentMoves[i].currentPP = 5;
                    }

                    let tempIvHp = attacker.ivStats.hp;
                    attacker.ivStats = defender.ivStats;
                    attacker.ivStats.hp = tempIvHp;

                    let tempEvHp = attacker.evLevels.hp;
                    attacker.evLevels = defender.evLevels;
                    attacker.evLevels.hp = tempEvHp;

                    let tempBaseHp = attacker.base.hp;
                    attacker.base = defender.base;
                    attacker.base.hp = tempBaseHp;

                    break;
                case "Acid Armor":
                    inputChannel.send(`${attacker.name}'s defense was raised.`);
                    attackerStatStage.def = Math.min(6, attackerStatStage.def + 2);
                    break;
                case "Rest":
                    if (attacker.status === "sleeping") {
                        inputChannel.send(`${move.name} failed.`)
                        return;
                    }
                    if (attackerVolatileStatus.bound.length > 0 && attackerVolatileStatus.bound.name === "Uproar")
                        attacker.status = "sleeping";
                    inputChannel.send(`${attacker.name} fell asleep.`);
                    attacker.damageTaken = 0;
                    break;
                case "Conversion":
                    inputChannel.send(`${attacker.name}'s type is converted.`);
                    attackerVolatileStatus.conversion = true;
                    break;
                case "Spider Web":
                    if (await isType(defender, "ghost", defenderVolatileStatus)) {
                        inputChannel.send(`${move.name} failed.`)
                        return;
                    }
                    defenderVolatileStatus.escapePrevention.enabled = true;
                    inputChannel.send(`${defender.name} is prevented from escaping.`);
                    break;
                case "Mind Reader":
                    attackerVolatileStatus.takingAim = 2;
                    inputChannel.send(`${attacker.name} won't miss on it's next turn.`);
                    break;
                case "Curse":
                    if (await isType(attacker, "ghost", attackerVolatileStatus)) {
                        attacker.damageTaken += Math.round(totalAttackerHp / 2);
                        attacker.damageTaken = Math.min(attacker.damageTaken, totalAttackerHp);
                        inputChannel.send(`${defender.name} is cursed and ${attacker.name} lost half of it's maximum hp.`);


                        defenderVolatileStatus.cursed = true;
                    } else {
                        inputChannel.send(`${attacker.name}'s attack and defense was raised.`);

                        attackerStatStage.atk = Math.min(6, attackerStatStage.atk + 1);
                        attackerStatStage.def = Math.min(6, attackerStatStage.def + 1);

                        attackerStatStage.speed = Math.max(-6, defenderStatStage.speed - 1)
                    }
                    break;
                case "Cotton Spore":
                    if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                        return;
                    }

                    if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                        inputChannel.send(`${move.name} missed.`);
                        return;
                    }

                    if (defenderVolatileStatus.mistLength > 0) {
                        inputChannel.send("Mist covers the field so the attack couldn't bring their speed down.");
                        return;
                    }

                    inputChannel.send(`${defender.name}'s speed was decreased.`);
                    defenderStatStage.speed = Math.max(-6, defenderStatStage.speed - 2);
                    break;

                case "Spite":
                    if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                        return;
                    }

                    if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                        inputChannel.send(`${move.name} missed.`);
                        return;
                    }
                    if (attackerVolatileStatus.mimicLastOpponentMove === "") {
                        inputChannel.send(`${move.name} failed.`)
                        return;
                    }

                    let spiteMove = defender.currentMoves.filter((move) => {
                        return move.name === attackerVolatileStatus.mimicLastOpponentMove;
                    })
                    spiteMove[0].currentPP = Math.max(0, spiteMove[0].currentPP - 2);

                    inputChannel.send(`${defender.name}'s ${spiteMove[0].name} pp was decreased by 2.`);
                    break;
                case "Protect":
                    let protectChance = Math.floor(Math.random() * 100);
                    if (attackerVolatileStatus.previousMove === "Protect" || attackerVolatileStatus.previousMove === "Detect") {
                        if (attackerVolatileStatus.protection.length === 1)
                            attackerVolatileStatus.protection.length = 3;
                        else
                            attackerVolatileStatus.protection.length += 3;
                    } else {
                        attackerVolatileStatus.protection.length = 1;
                    }

                    let protectionRate = ((1 / attackerVolatileStatus.protection.length) * 100);

                    if (protectChance < protectionRate) {
                        inputChannel.send(`${defender.name} protected themselves.`)
                        attackerVolatileStatus.protection.enabled = true;
                    } else {
                        inputChannel.send(`${defender.name} protected themselves.`)
                        inputChannel.send(`${move.name} failed.`)
                    }
                    break;
                case "Scary Face":
                    if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                        return;
                    }

                    if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                        inputChannel.send(`${move.name} missed.`);
                        return;
                    }

                    if (defenderVolatileStatus.mistLength > 0) {
                        inputChannel.send("Mist covers the field so the attack couldn't bring their speed down.")
                        return;
                    }

                    inputChannel.send(`${defender.name}'s speed was decreased.`)
                    defenderStatStage.speed = Math.max(-6, defenderStatStage.speed - 2)
                    break;
                case "Sweet Kiss":
                    if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                        return;
                    }

                    if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                        inputChannel.send(`${move.name} missed.`);
                        return;
                    }

                    if (defenderVolatileStatus.confusionLength === 0) {
                        inputChannel.send(`${defender.name} is now confused.`);
                        defenderVolatileStatus.confusionLength = Math.floor(Math.random() * (4 - 1) + 1);
                    } else {
                        inputChannel.send(`${move.name} failed.`);
                    }
                    break;
                case "Belly Drum":
                    if (attacker.damageTaken >= Math.floor(totalAttackerHp / 2)) {
                        inputChannel.send(`${move.name} failed, HP is too low.`);
                    } else {
                        inputChannel.send(`${attacker.name}'s attack was increased.`);
                        attacker.damageTaken += Math.floor(totalAttackerHp / 2);
                        attackerStatStage.atk = 6;
                    }
                    break;
                case "Spikes":
                    defenderVolatileStatus.spikes = true;
                    inputChannel.send(`Spikes were placed around the field.`);
                    break;
                case "Destiny Bond":
                    if (attackerVolatileStatus.destinyBond > 0) {
                        inputChannel.send(`${move.name} failed.`);
                    } else {
                        inputChannel.send(`${attacker.name} bonded with ${defender.name}.`);
                        attackerVolatileStatus.destinyBond = battleDetails.userOneCurrentPokemon;
                    }
                    break;
                case "Perish Song":
                    if (defenderVolatileStatus.perishSongLength > 0) {
                        inputChannel.send(`${move.name} was used on this ${defender.name} already.`)
                    }
                    console.log(`${defender.name} has 4 turns remaining.`);
                    defenderVolatileStatus.perishSongLength = 4;
                    break;
                case "Detect":
                    let detectChance = Math.floor(Math.random() * 100);
                    console.log(attackerVolatileStatus.previousMove)
                    if (attackerVolatileStatus.previousMove === "Protect" || attackerVolatileStatus.previousMove === "Detect") {
                        if (attackerVolatileStatus.protection.length === 1)
                            attackerVolatileStatus.protection.length = 3;
                        else
                            attackerVolatileStatus.protection.length += 3;
                    } else {
                        attackerVolatileStatus.protection.length = 1;
                    }

                    let detectRate = ((1 / attackerVolatileStatus.protection.length) * 100);

                    console.log(detectRate)

                    if (detectChance < detectRate) {

                        console.log("user protected themselves")
                        attackerVolatileStatus.protection.enabled = true;
                    } else {
                        console.log("protection failed")
                    }
                    break;
                case "Lock-On":
                    attackerVolatileStatus.takingAim = 2;
                    console.log("won't miss on it's next turn");
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
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
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
                    if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                        inputChannel.send(`${move.name} missed.`);
                        continue;
                    }
                    let doubleSlapDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                    defender.damageTaken += doubleSlapDamage;
                    defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp)

                    console.log(doubleSlapDamage);
                }

                console.log(`dealt dmg ${slapCount} times`)
                break;
            case "Comet Punch":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
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
                    if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                        inputChannel.send(`${move.name} missed.`);
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
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
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
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                // console.log(move)
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                let firePunchDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                defender.damageTaken += firePunchDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                let firePunchEffectChance = Math.floor(Math.random() * 100);
                if (firePunchEffectChance < move.effect_chance && defender.status === "normal" && !await isType(defender, "fire", defenderVolatileStatus)) {
                    console.log("enemy was burned")
                    defender.status = "burned";
                }

                console.log(firePunchDamage);
                break;
            case "Ice Punch":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                // console.log(move)
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                let icePunchDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                defender.damageTaken += icePunchDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                let icePunchEffectChance = Math.floor(Math.random() * 100);
                if (icePunchEffectChance < move.effect_chance && defender.status === "normal" && !await isType(defender, "ice", defenderVolatileStatus)) {
                    console.log("enemy was frozen")
                    defender.status = "frozen";
                }

                console.log(icePunchDamage);
                break;
            case "Thunder Punch":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                // console.log(move)
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                let thunderPunchDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                defender.damageTaken += thunderPunchDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                let thunderPunchEffectChance = Math.floor(Math.random() * 100);
                if (thunderPunchEffectChance < move.effect_chance && defender.status === "normal" && !await isType(defender, "electric", defenderVolatileStatus)) {
                    console.log("enemy was paralyzed")
                    defender.status = "paralyzed";
                }

                console.log(thunderPunchDamage);
                break;
            case "Guillotine":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                if (defender.level > attacker.level) {
                    console.log("defender level is too high and the move fails")
                    return;
                }
                move.acc += attacker.level - defender.level;
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
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
                        inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                        return;
                    }

                    if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                        inputChannel.send(`${move.name} missed.`);
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
                        inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                        return;
                    }

                    if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                        inputChannel.send(`${move.name} missed.`);
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
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
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
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                let stompDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                defender.damageTaken += stompDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                let stompEffectChance = Math.floor(Math.random() * 100);
                if (stompEffectChance < move.effect_chance) {
                    defenderVolatileStatus.flinch = true;
                    console.log("made opponent flinch")
                }
                console.log(stompDamage);
                break;
            case "Double Kick":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                for (let i = 0; i < 2; i++) {
                    if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                        inputChannel.send(`${move.name} missed.`);
                        continue;
                    }

                    let doubleKickDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                    defender.damageTaken += doubleKickDamage;
                    defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);
                    console.log(doubleKickDamage);
                }
                break;
            case "Jump Kick":
                let crashDamage = Math.round(totalDefenderHp / 2);
                if (defenderVolatileStatus.protection.enabled) {
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
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    defender.damageTaken += crashDamage;
                    defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);
                    console.log(`${attacker.name} missed and took crash damage`);
                    return;
                }

                if (await isType(defender, "ghost", defenderVolatileStatus)) {
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
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }

                let rollingKickDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)
                defender.damageTaken += rollingKickDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                let rollingKickEffectChance = Math.floor(Math.random() * 100);
                if (rollingKickEffectChance < move.effect_chance) {
                    defenderVolatileStatus.flinch = true;
                    console.log("made opponent flinch")
                }
                console.log(rollingKickDamage);
                break;
            case "Headbutt":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }

                let headbuttDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)
                defender.damageTaken += headbuttDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                let headbuttEffectChance = Math.floor(Math.random() * 100);
                if (headbuttEffectChance < move.effect_chance) {
                    defenderVolatileStatus.flinch = true;
                    console.log("made opponent flinch")
                }
                console.log(headbuttDamage);
                break;
            case "Fury Attack":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
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
                    if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                        inputChannel.send(`${move.name} missed.`);
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
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                if (defender.level > attacker.level) {
                    console.log("defender level is too high and the move fails")
                    return;
                }
                move.acc += attacker.level - defender.level;
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                let hornDrillDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus) * 10000;

                defender.damageTaken += hornDrillDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);
                console.log("KO");
                break;
            case "Body Slam":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                let bodySlamDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                defender.damageTaken += bodySlamDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                let bodySlamEffectChance = Math.floor(Math.random() * 100);
                if (bodySlamEffectChance < move.effect_chance && defender.status === "normal" && !await isType(defender, "electric", defenderVolatileStatus) && !await isType(defender, "normal", defenderVolatileStatus)) {
                    console.log("enemy was paralyzed")
                    defender.status = "paralyzed";
                }
                console.log(bodySlamDamage);
                break;
            case "Wrap":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
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
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                let takeDownDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)
                defender.damageTaken += takeDownDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);
                console.log(takeDownDamage);

                attacker.damageTaken += Math.round(takeDownDamage / 4);
                attacker.damageTaken = Math.min(attacker.damageTaken, totalAttackerHp);
                console.log("recoil damage", Math.round(takeDownDamage / 4));
                break;
            case "Thrash":
                if (attackerVolatileStatus.thrashing.length === 0) {
                    attackerVolatileStatus.thrashing.length = (Math.floor(Math.random() * 2) === 0) ? 3 : 4;
                    attackerVolatileStatus.thrashing.name = "Thrash";
                    console.log(`forced to thrash for ${attackerVolatileStatus.thrashing.length - 1} turns`)
                }
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                let thrashDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)
                defender.damageTaken += thrashDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);
                console.log(thrashDamage);

                attackerVolatileStatus.thrashing.length--;
                if (attackerVolatileStatus.thrashing.length === 0) {
                    if (attackerVolatileStatus.confusionLength === 0) {
                        attackerVolatileStatus.confusionLength = Math.floor(Math.random() * 4 + 1);
                        console.log(`thrashing has ended and left your pokemon confused`);
                    }
                }
                break;
            case "Double-Edge":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                let doubleEdgeDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)
                defender.damageTaken += doubleEdgeDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);
                console.log(doubleEdgeDamage);

                attacker.damageTaken += Math.round(doubleEdgeDamage / 3);
                attacker.damageTaken = Math.min(attacker.damageTaken, totalAttackerHp);
                console.log("recoil damage", Math.round(doubleEdgeDamage / 3));

                break;
            case "Poison Sting":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                // console.log(move)
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                let poisonStingDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                defender.damageTaken += poisonStingDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                let poisonStingEffectChance = Math.floor(Math.random() * 100);
                if (poisonStingEffectChance < move.effect_chance && defender.status === "normal" && !await isType(defender, "steel", defenderVolatileStatus) && !await isType(defender, "poison", defenderVolatileStatus)) {
                    console.log("enemy was poisoned")
                    defender.status = "poisoned";
                }

                console.log(poisonStingDamage);
                break;
            case "Twineedle":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }
                for (let i = 0; i < 2; i++) {

                    if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                        inputChannel.send(`${move.name} missed.`);
                        continue;
                    }
                    let twineedleDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)
                    defender.damageTaken += twineedleDamage;
                    defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);
                    console.log(twineedleDamage);
                    let twineedleEffectChance = Math.floor(Math.random() * 100);
                    if (twineedleEffectChance < move.effect_chance && defender.status === "normal" && !await isType(defender, "steel", defenderVolatileStatus) && !await isType(defender, "poison", defenderVolatileStatus)) {
                        console.log("enemy was poisoned")
                        defender.status = "poisoned";
                    }
                }
                break;
            case "Pin Missile":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                let pinMissileCount;
                let pinMissileChance = Math.floor(Math.random() * 100);
                if (pinMissileChance >= 0 && pinMissileChance < 35)
                    pinMissileCount = 2;
                else if (pinMissileChance >= 35 && pinMissileChance < 70)
                    pinMissileCount = 3;
                else if (pinMissileChance >= 70 && pinMissileChance < 85)
                    pinMissileCount = 4;
                else
                    pinMissileCount = 5;

                for (let i = 0; i < pinMissileCount; i++) {
                    if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                        inputChannel.send(`${move.name} missed.`);
                        continue;
                    }
                    let damage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                    defender.damageTaken += damage;
                    defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp)

                    console.log(damage);
                }

                console.log(`dealt dmg ${pinMissileCount} times`)
                break;
            case "Bite":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }

                let biteDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)
                defender.damageTaken += biteDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                let biteEffectChance = Math.floor(Math.random() * 100);
                if (biteEffectChance < move.effect_chance) {
                    defenderVolatileStatus.flinch = true;
                    console.log("made opponent flinch")
                }
                console.log(biteDamage);
                break;
            case "Sonic Boom":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                defender.damageTaken += 20;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);
                console.log(20);
                break;
            case "Acid":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                let acidDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)
                defender.damageTaken += acidDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);
                console.log(acidDamage);

                let acidChance = Math.floor(Math.random() * 100);
                if (acidChance < move.effect_chance && defenderVolatileStatus.mistLength === 0) {
                    defenderStatStage.spDef = Math.max(-6, defenderStatStage.spDef - 1)
                    console.log("lowered opponent's special defense")
                }
                break;
            case "Ember":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                let emberDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                defender.damageTaken += emberDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                let emberEffectChance = Math.floor(Math.random() * 100);
                if (emberEffectChance < move.effect_chance && defender.status === "normal" && !await isType(defender, "fire", defenderVolatileStatus)) {
                    console.log("enemy was burned")
                    defender.status = "burned";
                }
                console.log(emberDamage);
                break;
            case "Flamethrower":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                let flamethrowerDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                defender.damageTaken += flamethrowerDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                let flamethrowerEffectChance = Math.floor(Math.random() * 100);
                if (flamethrowerEffectChance < move.effect_chance && defender.status === "normal" && !await isType(defender, "fire", defenderVolatileStatus)) {
                    console.log("enemy was burned")
                    defender.status = "burned";
                }

                console.log(flamethrowerDamage);
                break;
            case "Ice Beam":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                let iceBeamDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                defender.damageTaken += iceBeamDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                let iceBeamEffectChance = Math.floor(Math.random() * 100);
                if (iceBeamEffectChance < move.effect_chance && defender.status === "normal" && !await isType(defender, "ice", defenderVolatileStatus)) {
                    console.log("enemy was frozen")
                    defender.status = "frozen";
                }

                console.log(iceBeamDamage);
                break;
            case "Blizzard":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                let blizzardDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                defender.damageTaken += blizzardDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                let blizzardEffectChance = Math.floor(Math.random() * 100);
                if (blizzardEffectChance < move.effect_chance && defender.status === "normal" && !await isType(defender, "ice", defenderVolatileStatus)) {
                    console.log("enemy was frozen")
                    defender.status = "frozen";
                }

                console.log(blizzardDamage);
                break;
            case "Psybeam":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                let psybeamDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                defender.damageTaken += psybeamDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                let psybeamChance = Math.floor(Math.random() * 100);
                if (psybeamChance < move.effect_chance) {
                    if (defenderVolatileStatus.confusionLength === 0) {
                        console.log("enemy is confused")
                        defenderVolatileStatus.confusionLength = Math.floor(Math.random() * (4 - 1) + 1);
                    }
                }

                console.log(psybeamDamage);
                break;
            case "Bubble Beam":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                let bubbleBeamDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                defender.damageTaken += bubbleBeamDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                let bubbleBeamChance = Math.floor(Math.random() * 100);
                if (bubbleBeamChance < move.effect_chance && defenderVolatileStatus.mistLength === 0) {
                    console.log("enemy speed is decreased")
                    defenderStatStage.speed = Math.max(-6, defenderStatStage.speed - 1)
                }

                console.log(bubbleBeamDamage);
                break;
            case "Aurora Beam":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                let auroraBeamDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                defender.damageTaken += auroraBeamDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                let auroraBeamChance = Math.floor(Math.random() * 100);
                if (auroraBeamChance < move.effect_chance && defenderVolatileStatus.mistLength === 0) {
                    console.log("enemy attack is decreased")
                    defenderStatStage.atk = Math.max(-6, defenderStatStage.atk - 1)
                }

                console.log(auroraBeamDamage);
                break;
            case "Hyper Beam":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                let hyperBeamDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)
                defender.damageTaken += hyperBeamDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);
                console.log(hyperBeamDamage);
                attackerVolatileStatus.recharging.name = move.name;
                attackerVolatileStatus.recharging.enabled = true;
                break;
            case "Submission":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                let submissionDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)
                defender.damageTaken += submissionDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);
                console.log(submissionDamage);

                attacker.damageTaken += Math.round(submissionDamage / 4);
                attacker.damageTaken = Math.min(attacker.damageTaken, totalAttackerHp);
                console.log("recoil damage", Math.round(submissionDamage / 4));
                break;
            case "Low Kick":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }

                let lowKickDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)
                defender.damageTaken += lowKickDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                let lowKickEffectChance = Math.floor(Math.random() * 100);
                if (lowKickEffectChance < move.effect_chance) {
                    defenderVolatileStatus.flinch = true;
                    console.log("made opponent flinch");
                }
                console.log(lowKickDamage);
                break;
            case "Counter":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                if (await isType(defender, "ghost", defenderVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                defender.damageTaken += attackerVolatileStatus.counter;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);
                console.log(attackerVolatileStatus.counter);
                break;
            case "Seismic Toss":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                if (await isType(defender, "ghost", defenderVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }

                let seismicTossDamage = attacker.level;
                defender.damageTaken += seismicTossDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);
                console.log(seismicTossDamage);
                break;
            case "Absorb":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                if (await isType(defender, "ghost", defenderVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }

                let absorbDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus);

                if ((defender.damageTaken + absorbDamage) >= totalDefenderHp) {
                    absorbDamage = totalDefenderHp - defender.damageTaken;
                }

                defender.damageTaken += absorbDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);


                if (attackerVolatileStatus.healBlockLength === 0) {
                    let healAmount = Math.round(absorbDamage / 2);
                    attacker.damageTaken -= healAmount;
                    attacker.damageTaken = Math.max(0, attacker.damageTaken);
                    console.log(`absorb healed you for ${healAmount}`);
                }
                console.log(absorbDamage);
                break;
            case "Mega Drain":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                if (await isType(defender, "ghost", defenderVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }

                let megaDrainDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus);

                if ((defender.damageTaken + megaDrainDamage) >= totalDefenderHp) {
                    absorbDamage = totalDefenderHp - defender.damageTaken;
                }

                defender.damageTaken += megaDrainDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);


                if (attackerVolatileStatus.healBlockLength === 0) {
                    let healAmount = Math.round(megaDrainDamage / 2);
                    attacker.damageTaken -= healAmount;
                    attacker.damageTaken = Math.max(0, attacker.damageTaken);
                    console.log(`mega drain healed you for ${healAmount}`);
                }
                console.log(absorbDamage);
                break;
            case "Leech Seed":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                defenderVolatileStatus.leechSeed = true;
                console.log("opponent has been seeded");
                break;
            case "Solar Beam":
                if (attackerVolatileStatus.chargingMove.chargingLength === 0) {
                    attackerVolatileStatus.chargingMove.chargingLength = 2;
                    attackerVolatileStatus.chargingMove.name = "Solar Beam";
                    console.log(`${attacker.name} starts charging`);
                } else {
                    if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                        return;
                    }

                    if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                        inputChannel.send(`${move.name} missed.`);
                        return;
                    }
                    let solarBeamDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                    defender.damageTaken += solarBeamDamage;
                    defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp)

                    console.log(solarBeamDamage);
                }
                break;
            case "Petal Dance":
                if (attackerVolatileStatus.thrashing.length === 0) {
                    attackerVolatileStatus.thrashing.length = (Math.floor(Math.random() * 2) === 0) ? 3 : 4;
                    attackerVolatileStatus.thrashing.name = "Petal Dance";
                    console.log(`forced to thrash for ${attackerVolatileStatus.thrashing.length - 1} turns`)
                }
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                let petalDanceDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)
                defender.damageTaken += petalDanceDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);
                console.log(petalDanceDamage);

                attackerVolatileStatus.thrashing.length--;
                if (attackerVolatileStatus.thrashing.length === 0) {
                    attackerVolatileStatus.confusionLength = Math.floor(Math.random() * 4 + 1);
                    console.log(`thrashing has ended and left your pokemon confused`)
                }
                break;
            case "Dragon Rage":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                let dragonRageDamage = 40;
                defender.damageTaken += dragonRageDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);
                console.log(dragonRageDamage);
                break;
            case "Fire Spin":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
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
                    defenderVolatileStatus.bound.name = "Fire Spin";
                } else {
                    console.log("already bound")
                }
                let fireSpinDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                defender.damageTaken += fireSpinDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);
                console.log(fireSpinDamage);
                break;
            case "Thunder Shock":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }

                let thunderShockDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                defender.damageTaken += thunderShockDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                let thunderShockEffectChance = Math.floor(Math.random() * 100);
                if (thunderShockEffectChance < move.effect_chance && defender.status === "normal" && !await isType(defender, "electric", defenderVolatileStatus)) {
                    console.log("enemy was paralyzed")
                    defender.status = "paralyzed";
                }
                console.log(thunderShockDamage);
                break;
            case "Thunderbolt":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }

                let thunderboltDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                defender.damageTaken += thunderboltDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                let thunderboltEffectChance = Math.floor(Math.random() * 100);
                if (thunderboltEffectChance < move.effect_chance && defender.status === "normal" && !await isType(defender, "electric", defenderVolatileStatus)) {
                    console.log("enemy was paralyzed")
                    defender.status = "paralyzed";
                }
                console.log(thunderboltDamage);
                break;
            case "Thunder":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }

                let thunderDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                defender.damageTaken += thunderDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                let thunderEffectChance = Math.floor(Math.random() * 100);
                if (thunderEffectChance < move.effect_chance && defender.status === "normal" && !await isType(defender, "electric", defenderVolatileStatus)) {
                    console.log("enemy was paralyzed")
                    defender.status = "paralyzed";
                }
                console.log(thunderDamage);
                break;
            case "Fissure":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                if (defender.level > attacker.level) {
                    console.log("defender level is too high and the move fails")
                    return;
                }
                move.acc += attacker.level - defender.level;
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                let fissureDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus) * 10000;

                defender.damageTaken += fissureDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);
                console.log("KO");
                break;
            case "Dig":
                if (attackerVolatileStatus.chargingMove.chargingLength === 0) {
                    attackerVolatileStatus.chargingMove.chargingLength = 2;
                    attackerVolatileStatus.chargingMove.name = "Dig";
                    attackerVolatileStatus.semiInvulnerable = true;
                    console.log(`${attacker.name} dug into the ground`);
                } else {
                    if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                        return;
                    }

                    if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                        inputChannel.send(`${move.name} missed.`);
                        return;
                    }
                    let digDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                    defender.damageTaken += digDamage;
                    defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp)

                    console.log(digDamage);
                }
                break;
            case "Confusion":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }

                let confusionDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                defender.damageTaken += confusionDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                let confusionEffectChance = Math.floor(Math.random() * 100);
                if (confusionEffectChance < move.effect_chance) {
                    if (defenderVolatileStatus.confusionLength === 0) {
                        console.log("enemy is confused")
                        defenderVolatileStatus.confusionLength = Math.floor(Math.random() * (4 - 1) + 1);
                    }
                }
                console.log(confusionDamage);
                break;
            case "Psychic":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                let psychicDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                defender.damageTaken += psychicDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                let psychicChance = Math.floor(Math.random() * 100);
                if (psychicChance < move.effect_chance && defenderVolatileStatus.mistLength === 0) {
                    console.log("enemy special defense is decreased")
                    defenderStatStage.spDef = Math.max(-6, defenderStatStage.spDef - 1)
                }

                console.log(psychicDamage);
                break;
            // case "Rage":
            //     console.log("move not programmed")
            //     break;
            case "Night Shade":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }

                let nightShadeDamage = attacker.level;
                if (await isType(defender, "normal", defenderVolatileStatus)) {
                    nightShadeDamage = 0;
                }

                defender.damageTaken += nightShadeDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);
                console.log(nightShadeDamage);
                break;
            case "Bide":
                console.log("move not programmed");
                break;
            case "Metronome":
                console.log("move not programmed");
                break;
            case "Self-Destruct":
                attacker.damageTaken += totalAttackerHp;
                console.log("user fainted from self-destruction");

                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                let selfDestructDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)
                defender.damageTaken += selfDestructDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                console.log(selfDestructDamage);
                break;
            case "Lick":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                if (!defenderVolatileStatus.minimized && Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                let lickDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                defender.damageTaken += lickDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                let lickEffectChance = Math.floor(Math.random() * 100);
                if (lickEffectChance < move.effect_chance && defender.status === "normal" && !await isType(defender, "electric", defenderVolatileStatus) && !await isType(defender, "ghost", defenderVolatileStatus)) {
                    console.log("enemy was paralyzed")
                    defender.status = "paralyzed";
                }
                console.log(lickDamage);
                break;
            case "Smog":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                let smogDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                defender.damageTaken += smogDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                let smogEffectChance = Math.floor(Math.random() * 100);
                if (smogEffectChance < move.effect_chance && defender.status === "normal" && !await isType(defender, "poison", defenderVolatileStatus)) {
                    console.log("enemy was poisoned")
                    defender.status = "poisoned";
                }
                console.log(smogDamage);
                break;
            case "Sludge":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                let sludgeDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                defender.damageTaken += sludgeDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                let sludgeEffectChance = Math.floor(Math.random() * 100);
                if (sludgeEffectChance < move.effect_chance && defender.status === "normal" && !await isType(defender, "poison", defenderVolatileStatus)) {
                    console.log("enemy was poisoned")
                    defender.status = "poisoned";
                }
                console.log(sludgeDamage);
                break;
            case "Fire Blast":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                let fireBlastDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                defender.damageTaken += fireBlastDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                let fireBlastEffectChance = Math.floor(Math.random() * 100);
                if (fireBlastEffectChance < move.effect_chance && defender.status === "normal" && !await isType(defender, "fire", defenderVolatileStatus)) {
                    console.log("enemy was burned")
                    defender.status = "burned";
                }

                console.log(fireBlastDamage);
                break;
            case "Waterfall":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                if (!defenderVolatileStatus.minimized && Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }

                let waterfallDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)
                defender.damageTaken += waterfallDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                let waterfallEffectChance = Math.floor(Math.random() * 100);
                if (waterfallEffectChance < move.effect_chance) {
                    defenderVolatileStatus.flinch = true;
                    console.log("made opponent flinch")
                }
                console.log(waterfallDamage);
                break;
            case "Swift":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                let swiftDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)
                defender.damageTaken += swiftDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);
                console.log(swiftDamage);
                break;
            case "Skull Bash":
                if (attackerVolatileStatus.chargingMove.chargingLength === 0) {
                    attackerVolatileStatus.chargingMove.chargingLength = 2;
                    attackerVolatileStatus.chargingMove.name = "Skull Bash";
                    console.log(`${attacker.name} tucks it's head in getting ready to charge`);
                    attackerStatStage.def = Math.min(6, attackerStatStage.def + 1);
                    console.log("raised def by 1 (one) stages");
                } else {
                    if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                        return;
                    }

                    if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                        inputChannel.send(`${move.name} missed.`);
                        return;
                    }
                    let skullBashDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                    defender.damageTaken += skullBashDamage;
                    defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp)

                    console.log(skullBashDamage);
                }
                break;
            case "High Jump Kick":
                let highJumpKickCrashDamage = Math.round(totalDefenderHp / 2);
                if (defenderVolatileStatus.protection.enabled) {
                    defender.damageTaken += highJumpKickCrashDamage;
                    defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);
                    console.log(`enemy was protected so ${attacker.name} took crash damage`);
                    return;
                }
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    defender.damageTaken += highJumpKickCrashDamage;
                    defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);
                    console.log(`enemy was invulnerable so ${attacker.name} missed and took crash damage`);
                    return;
                }
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    defender.damageTaken += highJumpKickCrashDamage;
                    defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);
                    console.log(`${attacker.name} missed and took crash damage`);
                    return;
                }
                if (await isType(defender, "ghost", defenderVolatileStatus)) {
                    defender.damageTaken += highJumpKickCrashDamage;
                    defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);
                    console.log(`${attacker.name} missed and took crash damage`);
                    return;
                }

                let highJumpKickDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)
                defender.damageTaken += highJumpKickDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);
                console.log(highJumpKickDamage);
                break;
            case "Dream Eater":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                if (defender.status !== "sleeping") {
                    console.log("enemy needs to be sleeping");
                    return;
                }

                let dreamEaterDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus);

                if ((defender.damageTaken + dreamEaterDamage) >= totalDefenderHp) {
                    dreamEaterDamage = totalDefenderHp - defender.damageTaken;
                }

                defender.damageTaken += dreamEaterDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);


                if (attackerVolatileStatus.healBlockLength === 0) {
                    let healAmount = Math.round(dreamEaterDamage / 2);
                    attacker.damageTaken -= healAmount;
                    attacker.damageTaken = Math.max(0, attacker.damageTaken);
                    console.log(`dream eater healed you for ${healAmount}`);
                }
                console.log(dreamEaterDamage);
                break;
            case "Leech Life":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }

                let leechLifeDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus);

                if ((defender.damageTaken + leechLifeDamage) >= totalDefenderHp) {
                    leechLifeDamage = totalDefenderHp - defender.damageTaken;
                }

                defender.damageTaken += leechLifeDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);


                if (attackerVolatileStatus.healBlockLength === 0) {
                    let healAmount = Math.round(leechLifeDamage / 2);
                    attacker.damageTaken -= healAmount;
                    attacker.damageTaken = Math.max(0, attacker.damageTaken);
                    console.log(`leech life healed you for ${healAmount}`);
                }
                console.log(leechLifeDamage);
                break;
            case "Sky Attack":
                if (attackerVolatileStatus.chargingMove.chargingLength === 0) {
                    attackerVolatileStatus.chargingMove.chargingLength = 2;
                    attackerVolatileStatus.chargingMove.name = "Sky Attack";
                    // attackerVolatileStatus.semiInvulnerable = true;
                    console.log(`${attacker.name} starts glowing`);
                } else {
                    if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                        return;
                    }

                    if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                        inputChannel.send(`${move.name} missed.`);
                        return;
                    }
                    let skyAttackDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                    defender.damageTaken += skyAttackDamage;
                    defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp)
                    let skyAttackEffectChance = Math.floor(Math.random() * 100);
                    if (skyAttackEffectChance < move.effect_chance) {
                        defenderVolatileStatus.flinch = true;
                        console.log("made opponent flinch")
                    }
                    console.log(skyAttackDamage);
                }
                break;
            case "Bubble":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                let bubbleDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                defender.damageTaken += bubbleDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                let bubbleChance = Math.floor(Math.random() * 100);
                if (bubbleChance < move.effect_chance && defenderVolatileStatus.mistLength === 0) {
                    console.log("enemy speed is decreased")
                    defenderStatStage.speed = Math.max(-6, defenderStatStage.speed - 1)
                }
                console.log(bubbleChance);
                break;
            case "Splash":
                console.log("nothing happened");
                break;
            case "Explosion":
                attacker.damageTaken += totalAttackerHp;
                console.log("user fainted from exploding themself")

                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                let explosionDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                defender.damageTaken += explosionDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                console.log(explosionDamage);
                break;
            case "Fury Swipes":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                let furySwipesCount;
                let furySwipesChance = Math.floor(Math.random() * 100);
                if (furySwipesChance >= 0 && furySwipesChance < 35)
                    furySwipesCount = 2;
                else if (furySwipesChance >= 35 && furySwipesChance < 70)
                    furySwipesCount = 3;
                else if (furySwipesChance >= 70 && furySwipesChance < 85)
                    furySwipesCount = 4;
                else
                    furySwipesCount = 5;

                for (let i = 0; i < furySwipesCount; i++) {
                    if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                        inputChannel.send(`${move.name} missed.`);
                        continue;
                    }
                    let damage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                    defender.damageTaken += damage;
                    defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp)

                    console.log(damage);
                }

                console.log(`dealt dmg ${furySwipesCount} times`)
                break;
            case "Bonemerang":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                for (let i = 0; i < 2; i++) {
                    if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                        inputChannel.send(`${move.name} missed.`);
                        continue;
                    }
                    let damage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                    defender.damageTaken += damage;
                    defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp)

                    console.log(damage);
                }
                console.log(`dealt dmg 2 times`)
                break;
            case "Rock Slide":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                if (!defenderVolatileStatus.minimized && Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }

                let rockSlideDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)
                defender.damageTaken += rockSlideDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                let rockSlideEffectChance = Math.floor(Math.random() * 100);
                if (rockSlideEffectChance < move.effect_chance) {
                    defenderVolatileStatus.flinch = true;
                    console.log("made opponent flinch")
                }
                console.log(rockSlideDamage);
                break;
            case "Tri Attack":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                if (!defenderVolatileStatus.minimized && Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }

                let triAttackDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)
                defender.damageTaken += triAttackDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                let triAttackEffectChance = Math.floor(Math.random() * 100);
                if (triAttackEffectChance < move.effect_chance) {
                    let randomStatus = Math.floor(Math.random() * 3);
                    if (randomStatus === 0) {
                        if (defender.status === "normal" && !await isType(defender, "ice", defenderVolatileStatus)) {
                            console.log("enemy was frozen")
                            defender.status = "frozen";
                        }
                    } else if (randomStatus === 1) {
                        if (defender.status === "normal" && !await isType(defender, "fire", defenderVolatileStatus)) {
                            console.log("enemy was burned")
                            defender.status = "burned";
                        }
                    } else {
                        if (defender.status === "normal" && !await isType(defender, "electric", defenderVolatileStatus) && !await isType(defender, "normal", defenderVolatileStatus)) {
                            console.log("enemy was paralyzed")
                            defender.status = "paralyzed";
                        }
                    }
                }
                console.log(triAttackDamage);
                break;
            case "Super Fang":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }

                if (await isType(defender, "ghost", defenderVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }

                let superFangDamage = Math.max((Math.floor(totalDefenderHp - defender.damageTaken) / 2), 1);
                defender.damageTaken += superFangDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);
                console.log(superFangDamage);
                break;
            case "Struggle":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                let struggleDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)
                defender.damageTaken += struggleDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);
                console.log(struggleDamage);

                attacker.damageTaken += Math.round(struggleDamage / 2);
                attacker.damageTaken = Math.min(attacker.damageTaken, totalAttackerHp);
                console.log("recoil damage", Math.round(struggleDamage / 2));
                break;
            case "Triple Kick":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                let tripleKickDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)
                for (let i = 1; i <= 3; i++) {
                    if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                        inputChannel.send(`${move.name} missed.`);
                        break;
                    }
                    defender.damageTaken += tripleKickDamage * i;
                    defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);
                    console.log(tripleKickDamage * i);
                }
                break;
            case "Flame Wheel":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                let flameWheelDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                defender.damageTaken += flameWheelDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                let flameWheelEffectChance = Math.floor(Math.random() * 100);
                if (flameWheelEffectChance < move.effect_chance && defender.status === "normal" && !await isType(defender, "fire", defenderVolatileStatus)) {
                    console.log("enemy was burned")
                    defender.status = "burned";
                }

                console.log(flameWheelDamage);
                break;
            case "Snore":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }
                if (!defenderVolatileStatus.minimized && Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                if (defender.status !== "sleeping") {
                    inputChannel.send(`${move.name} failed.`)
                    return;
                }

                let snoreDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)
                defender.damageTaken += snoreDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                let snoreEffectChance = Math.floor(Math.random() * 100);
                if (snoreEffectChance < move.effect_chance) {
                    defenderVolatileStatus.flinch = true;
                    console.log("made opponent flinch")
                }
                console.log(snoreDamage);
                break;
            case "Powder Snow":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                let powderSnowDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                defender.damageTaken += powderSnowDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                let powderSnowEffectChance = Math.floor(Math.random() * 100);
                if (powderSnowEffectChance < move.effect_chance && defender.status === "normal" && !await isType(defender, "ice", defenderVolatileStatus)) {
                    console.log("enemy was frozen")
                    defender.status = "frozen";
                }

                console.log(powderSnowDamage);
                break;
            case "Feint Attack":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                let feintAttackDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                defender.damageTaken += feintAttackDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                console.log(feintAttackDamage);
                break;
            case "Sludge Bomb":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                // console.log(move)
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                let sludgeBombDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                defender.damageTaken += sludgeBombDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                let sludgeBombEffectChance = Math.floor(Math.random() * 100);
                if (sludgeBombEffectChance < move.effect_chance && defender.status === "normal" && !await isType(defender, "steel", defenderVolatileStatus) && !await isType(defender, "poison", defenderVolatileStatus)) {
                    console.log("enemy was poisoned")
                    defender.status = "poisoned";
                }

                console.log(sludgeBombDamage);
                break;
            case "Mud Slap":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }

                let mudSlapDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                defender.damageTaken += mudSlapDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);
                console.log(mudSlapDamage);

                if (defenderVolatileStatus.mistLength > 0) {
                    console.log("mist covers the opponent and the attack misses their eyes")
                    return;
                }

                console.log("reduced enemy's accuracy");
                defenderStatStage.accuracy = Math.max(-6, defenderStatStage.accuracy - 1);
                break;
            case "Octazooka":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }

                let octazookaDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                defender.damageTaken += octazookaDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);
                console.log(octazookaDamage);

                if (defenderVolatileStatus.mistLength > 0) {
                    console.log("mist covers the opponent and the attack misses their eyes")
                    return;
                }

                let octazookaEffectChance = Math.floor(Math.random() * 100);
                if (octazookaEffectChance < move.effect_chance) {
                    console.log("reduced enemy's accuracy");
                    defenderStatStage.accuracy = Math.max(-6, defenderStatStage.accuracy - 1);
                }
                break;
            case "Zap Cannon":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                // console.log(move)
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                let zapCannonDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                defender.damageTaken += zapCannonDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                let zapCannonEffectChance = Math.floor(Math.random() * 100);
                if (zapCannonEffectChance < move.effect_chance && defender.status === "normal" && !await isType(defender, "electric", defenderVolatileStatus)) {
                    console.log("enemy was paralyzed")
                    defender.status = "paralyzed";
                }

                console.log(zapCannonDamage);
                break;
            case "Icy Wind":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                // console.log(move)
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                let icyWindDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                defender.damageTaken += icyWindDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                console.log(icyWindDamage);

                if (defenderVolatileStatus.mistLength > 0) {
                    console.log("mist covers the opponent and couldn't decrease their speed")
                    return;
                }

                console.log("decreased enemy's speed");
                defenderStatStage.speed = Math.max(-6, defenderStatStage.speed - 1);
                break;

            case "Bone Rush":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                let boneRushCount;
                let boneRushChance = Math.floor(Math.random() * 100);
                if (boneRushChance >= 0 && boneRushChance < 35)
                    boneRushCount = 2;
                else if (boneRushChance >= 35 && boneRushChance < 70)
                    boneRushCount = 3;
                else if (boneRushChance >= 70 && boneRushChance < 85)
                    boneRushCount = 4;
                else
                    boneRushCount = 5;

                for (let i = 0; i < boneRushCount; i++) {
                    if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                        inputChannel.send(`${move.name} missed.`);
                        continue;
                    }
                    let damage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                    defender.damageTaken += damage;
                    defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp)

                    console.log(damage);
                }

                console.log(`dealt dmg ${boneRushCount} times`)
                break;

            case "Outrage":
                if (attackerVolatileStatus.thrashing.length === 0) {
                    attackerVolatileStatus.thrashing.length = (Math.floor(Math.random() * 2) === 0) ? 3 : 4;
                    attackerVolatileStatus.thrashing.name = "Outrage";
                    console.log(`forced to thrash for ${attackerVolatileStatus.thrashing.length - 1} turns`)
                }
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                let outrageDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)
                defender.damageTaken += outrageDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);
                console.log(outrageDamage);

                attackerVolatileStatus.thrashing.length--;
                if (attackerVolatileStatus.thrashing.length === 0) {
                    attackerVolatileStatus.confusionLength = Math.floor(Math.random() * 4 + 1);
                    console.log(`thrashing has ended and left your pokemon confused`)
                }
                break;
            // case "Move":
            //     if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
            //         inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
            //         return;
            //     }
            //     if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
            //                         inputChannel.send(`${move.name} missed.`);
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
                //Pound, Karate Chop, Mega Punch, Scratch, Vise Grip, Cut, Gust,
                //Wing Attack, Slam, Vine Whip, Mega Kick, Horn Attack, Tackle,
                //Water Gun, Hydro Pump, Surf, Strength, Rock Throw, Earthquake,
                //Quick Attack, Flail, Aeroblast, Mach Punch

                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                let damage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                defender.damageTaken += damage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp)

                console.log(damage);
                break;
        }
        //endure isnt programmed yet
        // if (defenderVolatileStatus.bracing && (totalDefenderHp - defender.damageTaken + dmg) > 1) {
        //     console.log("lived with 1 hp due to brace")
        //     defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp - 1)
        // }
    }
    attackerVolatileStatus.previousMove = move.name;
}

async function getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus) {
    //dmg calculations: https://bulbapedia.bulbagarden.net/wiki/Damage#Damage_calculation

    // let fullAttackerDetails = pokemonListFunctions.getPokemonFromId(attacker.pokeId);
    let fullDefenderDetails = await pokemonListFunctions.getPokemonFromId(defender.pokeId);
    if (defenderVolatileStatus.conversion) {
        fullDefenderDetails.types = [defender.currentMoves[0].type];
    }
    // console.log(fullDefenderDetails.types)

    let level = attacker.level;

    let criticalStage = {
        0: 24,
        1: 8,
        2: 2,
        3: 1
    }
    //update critical stage "criticalStage[0]"
    // var icon = (area == 1) ? icon1 : (area == 2) ? icon2 : icon0;
    let stage = attackerStatStage.crit;

    if (move.name === "Karate Chop" || move.name === "Razor Wind" || move.name === "Razor Leaf" ||
        move.name === "Sky Attack" || move.name === "Crabhammer" || move.name === "Slash" || move.name === "Aeroblast")
        stage += 1;
    let critical = (Math.floor(Math.random() * criticalStage[stage]) === 0) ? 2 : 1;
    if (critical === 2)
        console.log("critical strike");

    let power = move.pwr || 0;
    if (move.name === "Gust" && defenderVolatileStatus.semiInvulnerable && (defenderVolatileStatus.chargingMove.name === "Fly" || defenderVolatileStatus.chargingMove.name === "Bounce")) {
        console.log("dealing double damage since opponent is in the air");
        power *= 2;
    }
    if (move.name === "Surf" && defenderVolatileStatus.semiInvulnerable && defenderVolatileStatus.chargingMove.name === "Dive") {
        console.log("dealing double damage since opponent dove into the water");
        power *= 2;
    }
    if (defenderVolatileStatus.minimized && (move.name === "Body Slam" || move.name === "Stomp" || move.name === "Dragon Rush" || move.name === "Steamroller" ||
        move.name === "Heat Crash" || move.name === "Heavy Slam" || move.name === "Flying Press" || move.name === "Malicious Moonsault")) {
        console.log("dealing double damage since opponent is minimized")
        power *= 2;
    }

    if (move.name === "Flail" || move.name === "Reversal") {
        const pokemonHpMultiplier = Math.round(pokemonFunctions.multiplierCalculation(attacker.evLevels.hp));
        const pokemonElb = Math.round(pokemonFunctions.elbCalculation(attacker.base.hp, pokemonHpMultiplier, attacker.level));
        const pokemonTotalHp = Math.round(pokemonFunctions.hpCalculation(attacker.level, attacker.base.hp, pokemonElb));

        let hpPercentage = Math.round(pokemonTotalHp / attacker.damageTaken);

        if (hpPercentage >= 67) {
            power = 20;
        } else if (hpPercentage >= 34 && hpPercentage < 67) {
            power = 40;
        } else if (hpPercentage >= 20 && hpPercentage < 34) {
            power = 80;
        } else if (hpPercentage >= 9 && hpPercentage < 20) {
            power = 100;
        } else if (hpPercentage >= 3 && hpPercentage < 9) {
            power = 120;
        } else {
            power = 200;
        }
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
        let spAtkElb = Math.round(pokemonFunctions.elbCalculation(attacker.base['special-attack'], spAtkMultiplier, attacker.level));
        let spAtk = Math.round(pokemonFunctions.otherStatCalculation(attacker.level, attacker.base['special-attack'], getNatureValue("spAtk", attacker.nature), spAtkElb));

        effectiveAtk = getEffectiveAtk(spAtk, attackerStatStage.spAtk, critical);

        let spDefMultiplier = Math.round(pokemonFunctions.multiplierCalculation(defender.evLevels.spDef));
        let spDefElb = Math.round(pokemonFunctions.elbCalculation(defender.base['special-defense'], spDefMultiplier, defender.level));
        let spDef = Math.round(pokemonFunctions.otherStatCalculation(defender.level, defender.base['special-defense'], getNatureValue("spDef", defender.nature), spDefElb));

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

    let damage = Math.round(((((((2 * level) / 5) + 2) * power * effectiveAtk / effectiveDef) / 50) + 2) * critical * random * stab * type * burn * other);

    if (move.category === "physical") {
        defenderVolatileStatus.counter = damage * 2;
    }

    if (move.category === "special" && defenderVolatileStatus.lightScreenLength > 0) {
        damage = Math.round(damage * .66);
    }

    if (move.category === "physical" && defenderVolatileStatus.reflectLength > 0) {
        damage = Math.round(damage * .66);
    }
    return damage;
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
            move.name === "Twister")) || ((defenderVolatileStatus.chargingMove.name === "Dig") && (move.name === "Earthquake" ||
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

function getEffectiveAcc(move, accuracyStage, evasionStage, defenderVolatileStatus, attackerVolatileStatus) {

    if (defenderVolatileStatus.minimized && (move.name === "Body Slam" || move.name === "Stomp" || move.name === "Dragon Rush" || move.name === "Steamroller" ||
        move.name === "Heat Crash" || move.name === "Heavy Slam" || move.name === "Flying Press" || move.name === "Malicious Moonsault")) {
        console.log("dealing double damage since opponent is minimized")
        return 1000;
    }

    if (attackerVolatileStatus.takingAim > 0 || (defenderVolatileStatus.telekinesisLength > 0 && (move.name !== "Fissure" || move.name !== "Guillotine" || move.name !== "Horn Drill" || move.name !== "Sheer Cold"))) {
        return 101;
    }

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

function runThroughStatusEffects(pokemon, volatileStatus, totalHp, enemy, enemyVolatileStatus) {
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

    if (volatileStatus.lightScreenLength > 0) {
        volatileStatus.lightScreenLength--;
    }

    if (volatileStatus.reflectLength > 0) {
        volatileStatus.reflectLength--;
    }
    if (volatileStatus.disable.length > 0) {
        volatileStatus.disable.length--;
    }

    if (volatileStatus.bound.length > 0) {
        volatileStatus.bound.length--;

        let boundDmg = Math.round(totalHp / 8)
        pokemon.damageTaken += boundDmg;
        pokemon.damageTaken = Math.min(totalHp, pokemon.damageTaken);
        console.log(`bounded by ${volatileStatus.bound.name} did ${boundDmg} dmg`)

        if (volatileStatus.bound.length === 0) {
            console.log("freed from being bound");
        }
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

    if (volatileStatus.mistLength > 0) {
        volatileStatus.mistLength--;
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

    //healing should be either the damage amount or what was left if the enemy faints
    if (volatileStatus.leechSeed) {

        let newDmg = Math.round(totalHp / 8);
        if ((pokemon.damageTaken + newDmg) >= totalHp) {
            newDmg = totalHp - pokemon.damageTaken;
        }

        pokemon.damageTaken += newDmg;
        pokemon.damageTaken = Math.min(totalHp, pokemon.damageTaken);

        if (enemyVolatileStatus.healBlockLength === 0) {
            enemy.damageTaken -= newDmg;
            enemy.damageTaken = Math.max(enemy.damageTaken, 0);

            console.log("healing was blocked")
        }

        console.log(`leech seed ${newDmg} to ${pokemon} healing ${enemy}`)
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
        console.log(`${volatileStatus.perishSongLength} `)
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

    volatileStatus.counter = 0;

    if (volatileStatus.chargingMove.chargingLength > 0) {
        volatileStatus.chargingMove.chargingLength--;
    }

    volatileStatus.magicCoat = false;

    if (volatileStatus.magneticLevitationLength > 0) {
        volatileStatus.magneticLevitationLength--;
    }

    volatileStatus.protection.enabled = false;

    if (volatileStatus.healBlockLength === 0 && pokemon.damageTaken < totalHp && volatileStatus.rooting) {
        pokemon.damageTaken -= Math.round(totalHp / 16);
        pokemon.damageTaken = Math.max(0, pokemon.damageTaken);
        console.log("healed from rooting");
    }

    if (volatileStatus.healBlockLength === 0 && pokemon.damageTaken < totalHp && volatileStatus.aquaRing) {
        pokemon.damageTaken -= Math.round(totalHp / 16);
        pokemon.damageTaken = Math.max(0, pokemon.damageTaken);
        console.log("healed from aqua ring");
    }

    // return pokemon.damageTaken >= totalHp;
}

async function isType(pokemon, type, volatileStatus) {
    let typeChange = volatileStatus.typeChange;
    let fullPokemon = await pokemonListFunctions.getPokemonFromId(pokemon.pokeId);

    if (volatileStatus.conversion) {
        fullPokemon.types = [pokemon.currentMoves[0].type];
    }

    if (typeChange === type)
        return true;
    for (let i = 0; i < fullPokemon.types.length; i++) {
        if (fullPokemon.types[i] === type)
            return true;
    }

    return false;
}