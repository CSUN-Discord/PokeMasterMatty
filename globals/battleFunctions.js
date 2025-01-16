const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    AttachmentBuilder,
    StringSelectMenuBuilder,
    MessageFlags
} = require('discord.js');
const pokemonFunctions = require("./pokemonFunctions");
const generalFunctions = require("./generalFunctions");
const {PythonShell} = require("python-shell");
const moveListFunctions = require("../db/functions/moveListFunctions");
const pokemonListFunctions = require("../db/functions/pokemonListFunctions");
const trainerFunctions = require("../db/functions/trainerFunctions");
const battlingFunctions = require("../db/functions/battlingFunctions");
const itemListFunctions = require("../db/functions/itemListFunctions");
// const emojiListFunctions = require("../db/functions/emojiListFunctions");
// const pokemon = require("pokemon");

let inputChannel;
let currentBagCategory = "poke-ball"
let currentBagMin = 0;

module.exports = {

    createEmbedPVM: function (battlingDetails) {
        // console.log()
        //player, playerCurrentPokemonNumber, playerTeam, pokemonCurrentPokemonNumber, pokemonTeam

        const userTwoHpMultiplier = Math.round(pokemonFunctions.multiplierCalculation(battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].evLevels.hp));

        const userTwoElb = Math.round(pokemonFunctions.elbCalculation(battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].base.hp, userTwoHpMultiplier, battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].level));

        const userTwoTotalHp = Math.round(pokemonFunctions.hpCalculation(battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].level, battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].base.hp, userTwoElb));

        const userOneHpMultiplier = Math.round(pokemonFunctions.multiplierCalculation(battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].evLevels.hp));

        const userOneElb = Math.round(pokemonFunctions.elbCalculation(battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].base.hp, userOneHpMultiplier, battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].level));

        const userOneTotalHp = Math.round(pokemonFunctions.hpCalculation(battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].level, battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].base.hp, userOneElb));

        let enemy_pokemon_name = battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].nickname || battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].name;
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
                enemy_pokemon_id, user_pokemon_id, enemy_pokemon_shiny, team_pokemon_shiny, battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].status, battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].status]
        };

        PythonShell.run('./python/battle_image.py', options, function (err, results) {
            if (err)
                throw err;
            // Results is an array consisting of messages collected during execution
            console.log('python code results: %j', results);
        });

        const gif = new AttachmentBuilder(`./python/battle_image_outputs/battle_gifs/${battlingDetails.userOne.userId}.gif`);
        return [new EmbedBuilder()
            .setColor('Random')
            .setTitle(`${battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].nickname || battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].name} VS ${battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].nickname || battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].name}`)
            .setImage(`attachment://${battlingDetails.userOne.userId}.gif`)
            .setTimestamp(),
            gif,
            true
        ]
    },

    battlingOptions: async function (inp, battlingDetails) {

        let row = new ActionRowBuilder();
        inputChannel = inp.channel;

        const actions = {
            battleAttackButton: function () {
                row = setRowAttacks(row, battlingDetails, inp);
                return {
                    content: "_ _",
                    embedDetails: createEmbedAfterAttackPVM(battlingDetails),
                    components: [row]
                };
            },
            battlePokemonButton: function () {
                row = setRowSwapPokemon(battlingDetails, inp, true)
                return {
                    content: "_ _",
                    embedDetails: createSwapEmbed(battlingDetails),
                    components: row
                };
            },
            battleBagButtons: async function () {
                if (inp.isStringSelectMenu()) {
                    const selectedOption = inp.values[0];

                    if (selectedOption === `${inp.user.id}poke-ballFilter`) {
                        currentBagCategory = "poke-ball";
                        currentBagMin = 0;
                    } else if (selectedOption === `${inp.user.id}recoveryFilter`) {
                        currentBagCategory = "recovery";
                        currentBagMin = 0;
                    } else if (selectedOption === `${inp.user.id}battle-effectFilter`) {
                        currentBagCategory = "battle-effect";
                        currentBagMin = 0;
                    }
                }

                if (inp.customId === `${inp.user.id}spawnBattleBag`) {
                    currentBagCategory = "poke-ball";
                    currentBagMin = 0;
                } else if (inp.customId === `${inp.user.id}itemsLeft`) {
                    currentBagMin = Math.max(0, currentBagMin - 10);
                } else if (inp.customId === `${inp.user.id}itemsRight`) {
                    currentBagMin += 10;
                    const bagArray = [];
                    try {
                        for (const key of Object.keys(battlingDetails.userOneBag.get(currentBagCategory))) {
                            if (battlingDetails.userOneBag.get(currentBagCategory)[key] > 0) {
                                bagArray.push(key);
                            }
                        }
                    } catch (e) {

                    }

                    if (currentBagMin > bagArray.length - 10) {
                        currentBagMin = bagArray.length > 10 ? bagArray.length - 10 : 0;
                    }
                }

                row = setRowBattleItem(battlingDetails, inp)
                return {
                    content: "_ _",
                    embedDetails: await createEmbedAfterBagPVM(battlingDetails),
                    components: row
                };
            },
            battleRunButton: async function () {
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

                    const escapeMessages = [
                        "You escaped the battle!",
                        "You fled the battlefield in a hurry.",
                        "You ran with your tail between your legs!",
                        "You got scared and ran away.",
                        "You decided to live to fight another day.",
                        "You left the battlefield with a sense of regret.",
                        "You made a strategic retreat.",
                        "You turned and fled, avoiding further conflict.",
                        "You abandoned the fight and ran for safety.",
                        "You chose to retreat rather than face defeat.",
                        "You ran for the hills, leaving the battle behind.",
                        "You bolted away, refusing to face the challenge.",
                        "You scurried off, unwilling to continue the fight.",
                        "You dashed away in panic, leaving your opponent confused.",
                        "You withdrew from the battle without looking back.",
                        "You opted for a tactical retreat, avoiding further damage.",
                        "You disappeared into the distance, leaving your opponent victorious.",
                        "You surrendered to fear and escaped the confrontation.",
                        "You turned your back on the battle and ran.",
                        "You retreated hastily, leaving the conflict unresolved.",
                        "You made a desperate dash for safety.",
                        "You chose to save yourself rather than risk defeat.",
                        "You vanished from the battlefield like a shadow.",
                        "You left the battle unfinished, your courage faltering.",
                        "You decided it was better to run than to lose.",
                        "You exited the battlefield, preferring peace over conflict.",
                        "You scampered away, avoiding the clash altogether.",
                        "You hurriedly left the fight, your heart racing with fear.",
                        "You chickened out and left the battle.",
                        "You ran away like a coward!",
                        "You fled faster than a Rattata on caffeine!",
                        "You turned tail and bolted—pathetic!",
                        "You couldn't handle the pressure and ran off crying!",
                        "You abandoned the battle like a scared little Meowth!",
                        "You ran away, leaving your dignity behind.",
                        "You sprinted off, proving you're no warrior.",
                        "You chickened out—cluck, cluck, cluck!",
                        "You bolted like a scared Pidgey in a thunderstorm!",
                        "You turned your back on the battle and whimpered away.",
                        "You slithered out of the fight like a spineless Ekans.",
                        "You ran away with a tear in your eye. So sad.",
                        "You showed your true colors and ran like a baby Togepi!",
                        "You left faster than a Rapidash at full gallop—weak!",
                        "You were no match and you knew it. Run, little one!",
                        "You abandoned your honor and escaped in disgrace.",
                        "You scurried off like a frightened Diglett!",
                        "You fled like a Zubat avoiding daylight!",
                        "You couldn't even muster the courage to stand your ground.",
                        "You ran away, proving you're all bark and no bite.",
                        "You slunk off into the shadows, ashamed of your fear.",
                        "You bolted like a Magikarp out of water—flopping uselessly!",
                        "You bailed faster than a Paras avoiding a fire-type!",
                        "You ran so fast, even a Dodrio couldn't catch you—coward!",
                        "You left the fight with your pride shattered into pieces.",
                        "You dashed away, proving you're not cut out for battles.",
                        "You escaped with a whimper, leaving your bravery behind.",
                        "You fled like a Farfetch’d who forgot its leek!",
                        "You scrambled off, humiliated and defeated.",
                        "You retreated like a Wimpod facing a stiff breeze."
                    ];
                    const escapeMessage = escapeMessages[Math.floor(Math.random() * escapeMessages.length)];
                    inputChannel.send(escapeMessage);

                    const gif = new AttachmentBuilder(`./python/battle_image_outputs/battle_gifs/${battlingDetails.userOne.userId}.gif`);

                    await module.exports.endRandomBattleEncounter("fled", battlingDetails);
                    return {
                        content: "_ _",
                        embedDetails: [new EmbedBuilder()
                            .setTitle(escapeMessage)
                            .setImage(`attachment://${battlingDetails.userOne.userId}.gif`),
                            gif,
                            false],
                        components: []
                    };
                } else {
                    inputChannel.send("Failed to escape.");

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

                    let output = await useMove(battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1], battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1], null, enemyMove, battlingDetails);
                    if (output === true) {
                        return {
                            content: "The battle has ended.",
                            embedDetails: module.exports.createEmbedPVM(battlingDetails),
                            components: []
                        };
                    } else if (output === false) {
                        battlingDetails.turnCounter += 1;
                        battlingFunctions.setTurnCount(battlingDetails._id, battlingDetails.turnCounter);
                        inputChannel.send(`🔴🔴🔴 TURN ${battlingDetails.turnCounter} 🔴🔴🔴`);

                        row = module.exports.setRowDefault(row, inp);
                        return {
                            content: "_ _",
                            embedDetails: module.exports.createEmbedPVM(battlingDetails),
                            components: [row]
                        };
                    } else if (output === "swapping") {
                        row = setRowSwapPokemon(battlingDetails, inp)
                        return {
                            content: "_ _",
                            embedDetails: createSwapEmbed(battlingDetails),
                            components: row
                        };
                    }
                }
            },
            battleBackButton: function () {
                row = module.exports.setRowDefault(row, inp)
                return {
                    content: "_ _",
                    embedDetails: createEmbedDefault(battlingDetails),
                    components: [row]
                };
            },
            battleMoveButton: async function () {
                console.log("move used")
                //user used a move

                //reset flee count
                battlingFunctions.setFleeCount(battlingDetails._id, 0);

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

                let output = await useMove(battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1], battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1], userMove, enemyMove, battlingDetails);
                if (output === true) {
                    return {
                        content: "The battle has ended.",
                        embedDetails: module.exports.createEmbedPVM(battlingDetails),
                        components: []
                    };
                } else if (output === false) {
                    battlingDetails.turnCounter += 1;
                    battlingFunctions.setTurnCount(battlingDetails._id, battlingDetails.turnCounter);
                    inputChannel.send(`🔴🔴🔴 TURN ${battlingDetails.turnCounter} 🔴🔴🔴`);

                    row = module.exports.setRowDefault(row, inp);
                    return {
                        content: "_ _",
                        embedDetails: module.exports.createEmbedPVM(battlingDetails),
                        components: [row]
                    };
                } else if (output === "swapping") {
                    row = setRowSwapPokemon(battlingDetails, inp)
                    return {
                        content: "_ _",
                        embedDetails: createSwapEmbed(battlingDetails),
                        components: row
                    };
                }
            },
            battlePokeBallButton: async function () {
                let wildPokemon = battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1];
                let userPokemon = battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1];

                const ballUsed = inp.customId.replace(inp.user.id, "");

                const pokemonHpMultiplier = Math.round(pokemonFunctions.multiplierCalculation(wildPokemon.evLevels.hp));
                const pokemonElb = Math.round(pokemonFunctions.elbCalculation(wildPokemon.base.hp, pokemonHpMultiplier, wildPokemon.level));
                const maxHP = Math.round(pokemonFunctions.hpCalculation(wildPokemon.level, wildPokemon.base.hp, pokemonElb));

                let currentHP = maxHP - wildPokemon.damageTaken;
                let ballBonus = 1;

                const statusCatchRate = {
                    "frozen": 2,
                    "sleeping": 2,
                    "paralyzed": 1.5,
                    "burned": 1.5,
                    "poisoned": 1.5,
                    "badly poisoned": 1.5,
                    "normal": 1
                }
                let bonusStatus = statusCatchRate[wildPokemon.status] || 1;

                let pokemonDefaultCatchRate = await pokemonListFunctions.getPokemonFromId(wildPokemon.pokeId);
                pokemonDefaultCatchRate = pokemonDefaultCatchRate.catchRate;

                inputChannel.send(`Used ${ballUsed}.`)

                battlingDetails.userOneBag.get("poke-ball")[ballUsed] = battlingDetails.userOneBag.get("poke-ball")[ballUsed] - 1;
                switch (ballUsed) {
                    case "Great Ball":
                        ballBonus = 1.5;
                        break;
                    case "Love Ball":
                        if (userPokemon.male !== wildPokemon.male) {
                            ballBonus = 8;
                        }
                        break;
                    case "Moon Ball":
                        const moonStoneEvolution = new Set([
                            "Clefairy", "Jigglypuff", "Nidorina", "Nidorino", "Skitty", "Munna"
                        ]);
                        if (moonStoneEvolution.has(wildPokemon.name)) {
                            ballBonus = 4;
                        }
                        break;
                    case "Net Ball":
                        if (await isType(wildPokemon, "bug", battlingDetails.userTwoVolatileStatus) || await isType(wildPokemon, "water", battlingDetails.userTwoVolatileStatus)) {
                            ballBonus = 3.5;
                        }
                        break;
                    case "Master Ball":
                        const gif = new AttachmentBuilder(`./python/battle_image_outputs/battle_gifs/${battlingDetails.userOne.userId}.gif`);

                        await module.exports.endRandomBattleEncounter("wildPokemonCaught", battlingDetails, ballUsed);
                        return {
                            content: "_ _",
                            embedDetails: [new EmbedBuilder()
                                .setTitle(`You have successfully caught ${battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].name}.`)
                                .setImage(`attachment://${battlingDetails.userOne.userId}.gif`),
                                gif,
                                false],
                            components: []
                        };
                    case "Heal Ball":
                        ballBonus = 1;
                        break;
                    case "Poke Ball":
                        ballBonus = 1;
                        break;
                    case "Heavy Ball":
                        const weight = await getWeight(wildPokemon.pokeId);
                        if (weight <= 220.2) {
                            ballBonus = -20;
                        } else if (220.2 < weight && weight <= 440.7) {
                            ballBonus = 1;
                        } else if (440.7 < weight && weight <= 661.2) {
                            ballBonus = 20;
                        } else if (661.2 < weight) {
                            ballBonus = 30;
                        } else {
                            ballBonus = 1;
                        }
                        break;
                    case "Level Ball":
                        if (userPokemon.level <= wildPokemon.level) {
                            ballBonus = 1;
                        } else {
                            let levelRatio = userPokemon.level / wildPokemon.level;
                            if (levelRatio < 2) {
                                ballBonus = 2;
                            } else if (levelRatio < 4) {
                                ballBonus = 4;
                            } else {
                                ballBonus = 8;
                            }
                        }
                        break;
                    case "Nest Ball":
                        if (wildPokemon.level < 30) {
                            ballBonus = ((((41 - wildPokemon.level) * 4096) / 10) / 4096);
                        }
                        break;
                    case "Ultra Ball":
                        ballBonus = 2;
                        break;
                    default:
                        console.log(`${ballUsed} not programmed`);
                        break;
                }

                let catchRate = Math.floor((((1 + (maxHP * 3 - currentHP * 2) * pokemonDefaultCatchRate * ballBonus * bonusStatus) / (maxHP * 3)) / 256) * 100);

                let randomNum = generalFunctions.randomIntFromInterval(1, 100);

                if (randomNum <= catchRate) {
                    const gif = new AttachmentBuilder(`./python/battle_image_outputs/battle_gifs/${battlingDetails.userOne.userId}.gif`);
                    await module.exports.endRandomBattleEncounter("wildPokemonCaught", battlingDetails, ballUsed);
                    return {
                        content: "_ _",
                        embedDetails: [new EmbedBuilder()
                            .setTitle(`You have successfully caught ${battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].name}.`)
                            .setImage(`attachment://${battlingDetails.userOne.userId}.gif`),
                            gif,
                            false],
                        components: []
                    };
                } else {
                    inputChannel.send("Failed to catch pokemon.")

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

                    let output = await useMove(battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1], battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1], null, enemyMove, battlingDetails);
                    if (output === true) {
                        return {
                            content: "The battle has ended.",
                            embedDetails: module.exports.createEmbedPVM(battlingDetails),
                            components: []
                        };
                    } else if (output === false) {
                        battlingDetails.turnCounter += 1;
                        battlingFunctions.setTurnCount(battlingDetails._id, battlingDetails.turnCounter);
                        inputChannel.send(`🔴🔴🔴 TURN ${battlingDetails.turnCounter} 🔴🔴🔴`);

                        row = module.exports.setRowDefault(row, inp);
                        return {
                            content: "_ _",
                            embedDetails: module.exports.createEmbedPVM(battlingDetails),
                            components: [row]
                        };
                    } else if (output === "swapping") {
                        row = setRowSwapPokemon(battlingDetails, inp)
                        return {
                            content: "_ _",
                            embedDetails: createSwapEmbed(battlingDetails),
                            components: row
                        };
                    }
                }
            },
            battleRecoveryButton: function () {
                const recoveryItemUsed = inp.customId.replace(inp.user.id, "");

                // inputChannel.send(`Used ${recoveryItemUsed}.`);

                battlingDetails.userOneBag.get("recovery")[recoveryItemUsed] = battlingDetails.userOneBag.get("recovery")[recoveryItemUsed] - 1;

                const aliveOnly = new Set(['Antidote', 'Soda Pop', 'Burn Heal', 'Full Heal', 'Ice Heal', 'Lemonade', 'Awakening', 'Fresh Water', 'Hyper Potion', 'Max Potion', 'Moomoo Milk', 'Paralyze Heal', 'Potion', 'Super Potion']);
                const deadOnly = new Set(['Max Revive', 'Revive']);
                const aliveAndDead = new Set(['Full Restore', 'Elixir', 'Ether', 'Max Elixir', 'Max Ether']);

                if (aliveOnly.has(recoveryItemUsed)) {
                    row = setRowItemUsed(battlingDetails, inp, recoveryItemUsed, "aliveOnly")
                    return {
                        content: "_ _",
                        embedDetails: createEmbedAfterItemUsed(battlingDetails, "aliveOnly"),
                        components: row
                    };
                } else if (deadOnly.has(recoveryItemUsed)) {
                    row = setRowItemUsed(battlingDetails, inp, recoveryItemUsed, "deadOnly")
                    return {
                        content: "_ _",
                        embedDetails: createEmbedAfterItemUsed(battlingDetails, "deadOnly"),
                        components: row
                    };
                } else if (aliveAndDead.has(recoveryItemUsed)) {
                    row = setRowItemUsed(battlingDetails, inp, recoveryItemUsed, "deadAndAlive")
                    return {
                        content: "_ _",
                        embedDetails: createEmbedAfterItemUsed(battlingDetails, "deadAndAlive"),
                        components: row
                    };
                }
            },
            battleBackToItemsButton: async function () {
                row = setRowBattleItem(battlingDetails, inp)
                return {
                    content: "_ _",
                    embedDetails: await createEmbedAfterBagPVM(battlingDetails),
                    components: row
                };
            },
            usedItemOnPokemon: async function (itemUsed, pokemonUsedOn, moveNumber = null) {
                // console.log(`used item ${itemUsed} on ${pokemonUsedOn}`)
                let fullItemDetails = await itemListFunctions.getItem(itemUsed);

                if (itemUsed !== "Used Max Ether" && itemUsed !== "Used Ether") {
                    inputChannel.send(`Used ${itemUsed} on ${battlingDetails.userOneTeam[pokemonUsedOn].nickname || battlingDetails.userOneTeam[pokemonUsedOn].nickname || battlingDetails.userOneTeam[pokemonUsedOn].name}.`);
                    battlingDetails.userOneBag.get(fullItemDetails.category)[itemUsed] = battlingDetails.userOneBag.get(fullItemDetails.category)[itemUsed] - 1;
                } else {
                    // console.log("used ether")
                    const realName = itemUsed.replace("Used", "").trim();
                    // console.log(realName)
                    fullItemDetails = await itemListFunctions.getItem(realName);

                    inputChannel.send(`${itemUsed} on ${battlingDetails.userOneTeam[pokemonUsedOn].nickname || battlingDetails.userOneTeam[pokemonUsedOn].name}'s ${battlingDetails.userOneTeam[pokemonUsedOn].currentMoves[moveNumber].name}.`);
                    battlingDetails.userOneBag.get(fullItemDetails.category)[realName] = battlingDetails.userOneBag.get(fullItemDetails.category)[realName] - 1;
                }

                //TODO: apply item effect

                switch (itemUsed) {
                    case "Antidote":
                        if (battlingDetails.userOneTeam[pokemonUsedOn].status === "poisoned" || battlingDetails.userOneTeam[pokemonUsedOn].status === "badly poisoned") {
                            battlingDetails.userOneTeam[pokemonUsedOn].status = "normal";
                            inputChannel.send(`${battlingDetails.userOneTeam[pokemonUsedOn].nickname || battlingDetails.userOneTeam[pokemonUsedOn].name} was cured of poison.`);
                        } else {
                            inputChannel.send(`${itemUsed} had no effect.`);
                        }
                        break;
                    case "Full Restore":
                        if (battlingDetails.userOneTeam[pokemonUsedOn].status === "normal" && battlingDetails.userOneTeam[pokemonUsedOn].damageTaken === 0) {
                            inputChannel.send(`${itemUsed} had no effect.`);
                        } else {
                            battlingDetails.userOneTeam[pokemonUsedOn].status = "normal";
                            battlingDetails.userOneTeam[pokemonUsedOn].damageTaken = 0;
                            inputChannel.send(`${battlingDetails.userOneTeam[pokemonUsedOn].nickname || battlingDetails.userOneTeam[pokemonUsedOn].name} was restored to full health.`);
                        }
                        break;
                    case "Soda Pop":
                        if (battlingDetails.userOneTeam[pokemonUsedOn].damageTaken === 0) {
                            inputChannel.send(`${itemUsed} had no effect.`);
                        } else {
                            let healAmount = Math.min(battlingDetails.userOneTeam[pokemonUsedOn].damageTaken, 50);
                            battlingDetails.userOneTeam[pokemonUsedOn].damageTaken = battlingDetails.userOneTeam[pokemonUsedOn].damageTaken - healAmount;
                            inputChannel.send(`${battlingDetails.userOneTeam[pokemonUsedOn].nickname || battlingDetails.userOneTeam[pokemonUsedOn].name} gained ${healAmount} health.`);
                        }
                        break;
                    case "Burn Heal":
                        if (battlingDetails.userOneTeam[pokemonUsedOn].status === "burned") {
                            battlingDetails.userOneTeam[pokemonUsedOn].status = "normal";
                            inputChannel.send(`${battlingDetails.userOneTeam[pokemonUsedOn].nickname || battlingDetails.userOneTeam[pokemonUsedOn].name}'s burn was healed.`);
                        } else {
                            inputChannel.send(`${itemUsed} had no effect.`);
                        }
                        break;
                    case "Full Heal":
                        if (battlingDetails.userOneTeam[pokemonUsedOn].status === "normal") {
                            inputChannel.send(`${itemUsed} had no effect.`);
                        } else {
                            battlingDetails.userOneTeam[pokemonUsedOn].status = "normal";
                            inputChannel.send(`${battlingDetails.userOneTeam[pokemonUsedOn].nickname || battlingDetails.userOneTeam[pokemonUsedOn].name} was cured of all status problems!`);
                        }
                        break;
                    case "Ice Heal":
                        if (battlingDetails.userOneTeam[pokemonUsedOn].status === "frozen") {
                            battlingDetails.userOneTeam[pokemonUsedOn].status = "normal";
                            inputChannel.send(`${battlingDetails.userOneTeam[pokemonUsedOn].nickname || battlingDetails.userOneTeam[pokemonUsedOn].name}'s ice melted away.`);
                        } else {
                            inputChannel.send(`${itemUsed} had no effect.`);
                        }
                        break;
                    case "Lemonade":
                        if (battlingDetails.userOneTeam[pokemonUsedOn].damageTaken === 0) {
                            inputChannel.send(`${itemUsed} had no effect.`);
                        } else {
                            let healAmount = Math.min(battlingDetails.userOneTeam[pokemonUsedOn].damageTaken, 70);
                            battlingDetails.userOneTeam[pokemonUsedOn].damageTaken = battlingDetails.userOneTeam[pokemonUsedOn].damageTaken - healAmount;
                            inputChannel.send(`${battlingDetails.userOneTeam[pokemonUsedOn].nickname || battlingDetails.userOneTeam[pokemonUsedOn].name} gained ${healAmount} health.`);
                        }
                        break;
                    case "Max Revive":
                        battlingDetails.userOneTeam[pokemonUsedOn].damageTaken = 0;
                        inputChannel.send(`${battlingDetails.userOneTeam[pokemonUsedOn].nickname || battlingDetails.userOneTeam[pokemonUsedOn].name} was fully revived.`);
                        break;
                    case "Awakening":
                        //only the current pokemon in battle will be sleeping
                        if (battlingDetails.userOneTeam[pokemonUsedOn].status === "sleeping") {
                            battlingDetails.userOneTeam[pokemonUsedOn].status = "normal";
                            battlingDetails.userOneVolatileStatus.sleepTurnLength = 0;
                            inputChannel.send(`${battlingDetails.userOneTeam[pokemonUsedOn].nickname || battlingDetails.userOneTeam[pokemonUsedOn].name}'s ice melted away.`);
                        } else {
                            inputChannel.send(`${itemUsed} had no effect.`);
                        }
                        break;
                    case "Revive":
                        battlingDetails.userOneTeam[pokemonUsedOn].damageTaken = Math.floor(battlingDetails.userOneTeam[pokemonUsedOn].damageTaken / 2);
                        inputChannel.send(`${battlingDetails.userOneTeam[pokemonUsedOn].nickname || battlingDetails.userOneTeam[pokemonUsedOn].name} was revived with half if it's health.`);
                        break;
                    case "Fresh Water":
                        if (battlingDetails.userOneTeam[pokemonUsedOn].damageTaken === 0) {
                            inputChannel.send(`${itemUsed} had no effect.`);
                        } else {
                            let healAmount = Math.min(battlingDetails.userOneTeam[pokemonUsedOn].damageTaken, 30);
                            battlingDetails.userOneTeam[pokemonUsedOn].damageTaken = battlingDetails.userOneTeam[pokemonUsedOn].damageTaken - healAmount;
                            inputChannel.send(`${battlingDetails.userOneTeam[pokemonUsedOn].nickname || battlingDetails.userOneTeam[pokemonUsedOn].name} gained ${healAmount} health.`);
                        }
                        break;
                    case "Hyper Potion":
                        if (battlingDetails.userOneTeam[pokemonUsedOn].damageTaken === 0) {
                            inputChannel.send(`${itemUsed} had no effect.`);
                        } else {
                            let healAmount = Math.min(battlingDetails.userOneTeam[pokemonUsedOn].damageTaken, 120);
                            battlingDetails.userOneTeam[pokemonUsedOn].damageTaken = battlingDetails.userOneTeam[pokemonUsedOn].damageTaken - healAmount;
                            inputChannel.send(`${battlingDetails.userOneTeam[pokemonUsedOn].nickname || battlingDetails.userOneTeam[pokemonUsedOn].name} gained ${healAmount} health.`);
                        }
                        break;
                    case "Max Potion":
                        if (battlingDetails.userOneTeam[pokemonUsedOn].damageTaken === 0) {
                            inputChannel.send(`${itemUsed} had no effect.`);
                        } else {
                            battlingDetails.userOneTeam[pokemonUsedOn].damageTaken = 0;
                            inputChannel.send(`${battlingDetails.userOneTeam[pokemonUsedOn].nickname || battlingDetails.userOneTeam[pokemonUsedOn].name} was restored to full health.`);
                        }
                        break;
                    case "Moomoo Milk":
                        if (battlingDetails.userOneTeam[pokemonUsedOn].damageTaken === 0) {
                            inputChannel.send(`${itemUsed} had no effect.`);
                        } else {
                            let healAmount = Math.min(battlingDetails.userOneTeam[pokemonUsedOn].damageTaken, 100);
                            battlingDetails.userOneTeam[pokemonUsedOn].damageTaken = battlingDetails.userOneTeam[pokemonUsedOn].damageTaken - healAmount;
                            inputChannel.send(`${battlingDetails.userOneTeam[pokemonUsedOn].nickname || battlingDetails.userOneTeam[pokemonUsedOn].name} gained ${healAmount} health.`);
                        }
                        break;
                    case "Paralyze Heal":
                        if (battlingDetails.userOneTeam[pokemonUsedOn].status === "paralyzed") {
                            battlingDetails.userOneTeam[pokemonUsedOn].status = "normal";
                            inputChannel.send(`${battlingDetails.userOneTeam[pokemonUsedOn].nickname || battlingDetails.userOneTeam[pokemonUsedOn].name}'s paralysis was healed.`);
                        } else {
                            inputChannel.send(`${itemUsed} had no effect.`);
                        }
                        break;
                    case "Potion":
                        if (battlingDetails.userOneTeam[pokemonUsedOn].damageTaken === 0) {
                            inputChannel.send(`${itemUsed} had no effect.`);
                        } else {
                            let healAmount = Math.min(battlingDetails.userOneTeam[pokemonUsedOn].damageTaken, 20);
                            battlingDetails.userOneTeam[pokemonUsedOn].damageTaken = battlingDetails.userOneTeam[pokemonUsedOn].damageTaken - healAmount;
                            inputChannel.send(`${battlingDetails.userOneTeam[pokemonUsedOn].nickname || battlingDetails.userOneTeam[pokemonUsedOn].name} gained ${healAmount} health.`);
                        }
                        break;
                    case "Super Potion":
                        if (battlingDetails.userOneTeam[pokemonUsedOn].damageTaken === 0) {
                            inputChannel.send(`${itemUsed} had no effect.`);
                        } else {
                            let healAmount = Math.min(battlingDetails.userOneTeam[pokemonUsedOn].damageTaken, 50);
                            battlingDetails.userOneTeam[pokemonUsedOn].damageTaken = battlingDetails.userOneTeam[pokemonUsedOn].damageTaken - healAmount;
                            inputChannel.send(`${battlingDetails.userOneTeam[pokemonUsedOn].nickname || battlingDetails.userOneTeam[pokemonUsedOn].name} gained ${healAmount} health.`);
                        }
                        break;
                    case "Max Elixir":
                        for (let i = 0; i < battlingDetails.userOneTeam[pokemonUsedOn].currentMoves.length; i++) {
                            battlingDetails.userOneTeam[pokemonUsedOn].currentMoves[i].currentPP = battlingDetails.userOneTeam[pokemonUsedOn].currentMoves[i].pp;
                        }
                        break;
                    case "Elixir":
                        for (let i = 0; i < battlingDetails.userOneTeam[pokemonUsedOn].currentMoves.length; i++) {
                            battlingDetails.userOneTeam[pokemonUsedOn].currentMoves[i].currentPP = Math.min(battlingDetails.userOneTeam[pokemonUsedOn].currentMoves[i].currentPP + 10, battlingDetails.userOneTeam[pokemonUsedOn].currentMoves[i].pp);
                        }
                        break;
                    case "Max Ether":
                        row = setRowEther(battlingDetails, inp, "Max Ether", pokemonUsedOn);
                        return {
                            content: "_ _",
                            embedDetails: createEtherEmbed(battlingDetails, "Max Ether", pokemonUsedOn),
                            components: [row]
                        };
                    case "Used Max Ether":
                        battlingDetails.userOneTeam[pokemonUsedOn].currentMoves[moveNumber].currentPP = battlingDetails.userOneTeam[pokemonUsedOn].currentMoves[moveNumber].pp;
                        break;
                    case "Ether":
                        row = setRowEther(battlingDetails, inp, "Ether", pokemonUsedOn);
                        return {
                            content: "_ _",
                            embedDetails: createEtherEmbed(battlingDetails, "Ether", pokemonUsedOn),
                            components: [row]
                        };
                    case "Used Ether":
                        battlingDetails.userOneTeam[pokemonUsedOn].currentMoves[moveNumber].currentPP = Math.min(battlingDetails.userOneTeam[pokemonUsedOn].currentMoves[moveNumber].currentPP + 10, battlingDetails.userOneTeam[pokemonUsedOn].currentMoves[moveNumber].pp);
                        break;
                    default:
                        console.log(`${itemUsed} not programmed`);
                        console.log(pokemonUsedOn, moveNumber);
                        break;
                }
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

                let output = await useMove(battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1], battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1], null, enemyMove, battlingDetails);
                if (output === true) {
                    return {
                        content: "The battle has ended.",
                        embedDetails: module.exports.createEmbedPVM(battlingDetails),
                        components: []
                    };
                } else if (output === false) {
                    battlingDetails.turnCounter += 1;
                    battlingFunctions.setTurnCount(battlingDetails._id, battlingDetails.turnCounter);
                    inputChannel.send(`🔴🔴🔴 TURN ${battlingDetails.turnCounter} 🔴🔴🔴`);

                    row = module.exports.setRowDefault(row, inp);
                    return {
                        content: "_ _",
                        embedDetails: module.exports.createEmbedPVM(battlingDetails),
                        components: [row]
                    };
                } else if (output === "swapping") {
                    row = setRowSwapPokemon(battlingDetails, inp)
                    return {
                        content: "_ _",
                        embedDetails: createSwapEmbed(battlingDetails),
                        components: row
                    };
                }
            },
            usedBattleEffect: async function (customId) {
                const itemUsed = customId.replace(`${inp.user.id}`, "")
                const fullItemDetails = await itemListFunctions.getItem(itemUsed);

                inputChannel.send(`Used ${itemUsed}.`);
                battlingDetails.userOneBag.get(fullItemDetails.category)[itemUsed] = battlingDetails.userOneBag.get(fullItemDetails.category)[itemUsed] - 1;

                switch (itemUsed) {
                    case "X Attack":
                        battlingDetails.userOneStatStage.atk += 1;
                        break;
                    case "Dire Hit":
                        battlingDetails.userOneStatStage.crit += 2;
                        break;
                    case "Guard Spec":
                        battlingDetails.userOneVolatileStatus.mistLength = 6;
                        break;
                    case "X Accuracy":
                        battlingDetails.userOneStatStage.accuracy += 1;
                        break;
                    case "X Defense":
                        battlingDetails.userOneStatStage.def += 1;
                        break;
                    case "X Sp. Atk":
                        battlingDetails.userOneStatStage.spAtk += 1;
                        break;
                    case "X Sp. Def":
                        battlingDetails.userOneStatStage.spDef += 1;
                        break;
                    case "X Speed":
                        battlingDetails.userOneStatStage.speed += 1;
                        break;
                    default:
                        console.log("battle effect item not programmed")
                        break;
                }


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

                let output = await useMove(battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1], battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1], null, enemyMove, battlingDetails);
                if (output === true) {
                    return {
                        content: "The battle has ended.",
                        embedDetails: module.exports.createEmbedPVM(battlingDetails),
                        components: []
                    };
                } else if (output === false) {
                    battlingDetails.turnCounter += 1;
                    battlingFunctions.setTurnCount(battlingDetails._id, battlingDetails.turnCounter);
                    inputChannel.send(`🔴🔴🔴 TURN ${battlingDetails.turnCounter} 🔴🔴🔴`);

                    row = module.exports.setRowDefault(row, inp);
                    return {
                        content: "_ _",
                        embedDetails: module.exports.createEmbedPVM(battlingDetails),
                        components: [row]
                    };
                } else if (output === "swapping") {
                    row = setRowSwapPokemon(battlingDetails, inp)
                    return {
                        content: "_ _",
                        embedDetails: createSwapEmbed(battlingDetails),
                        components: row
                    };
                }
            },
            swapPokemonButton: async function (customId) {
                // console.log(customId)
                // console.log(pokemon)

                battlingFunctions.setFleeCount(battlingDetails._id, 0);


                if (customId.includes("voluntarily")) {
                    // let name = parseInt(customId.replace(`${inp.user.id}voluntarilySwapTo`, ""));
                    // console.log(customId, name)
                    battlingDetails.userOneCurrentPokemon = parseInt(customId.replace(`${inp.user.id}voluntarilySwapTo`, ""));
                    inputChannel.send(`Swapped to ${battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].nickname || battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].name}`);
                } else {
                    battlingDetails.userOneCurrentPokemon = parseInt(customId.replace(`${inp.user.id}swapTo`, ""));
                    inputChannel.send(`Swapped to ${battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].nickname || battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].name}`);

                    battlingDetails.turnCounter += 1;
                    battlingFunctions.setTurnCount(battlingDetails._id, battlingDetails.turnCounter);
                    inputChannel.send(`🔴🔴🔴 TURN ${battlingDetails.turnCounter} 🔴🔴🔴`);
                }
                battlingDetails.userOneStatStage = {
                    atk: 0,
                    def: 0,
                    spAtk: 0,
                    spDef: 0,
                    speed: 0,
                    evasion: 0,
                    accuracy: 0,
                    crit: 0,
                };
                battlingDetails.userOneVolatileStatus = {
                    badlyPoisonTurn: 0,
                    sleepTurnLength: 0,
                    bound: {
                        name: "",
                        length: 0
                    },
                    escapePrevention: {
                        name: "",
                        enabled: false
                    },
                    confusionLength: 0,
                    cursed: false,
                    drowsy: 0,
                    embargoLength: 0,
                    encore: {
                        moveToRepeat: "",
                        encoreLength: 0,
                    },
                    flinch: false,
                    healBlockLength: 0,
                    identified: {
                        name: "",
                        activated: false,
                    },
                    infatuation: false,
                    leechSeed: false,
                    nightmare: false,
                    perishSongLength: 0,
                    tauntLength: 0,
                    telekinesisLength: 0,
                    torment: {
                        lastMove: "",
                        enabled: false
                    },
                    typeChange: "",
                    aquaRing: false,
                    bracing: false,
                    chargingMove: {
                        name: "",
                        chargingLength: 0,
                    },
                    centerOfAttention: false,
                    defenseCurl: false,
                    rooting: false,
                    magicCoat: false,
                    magneticLevitationLength: 0,
                    mimicLastOpponentMove: "",
                    minimized: false,
                    protection: {
                        enabled: false,
                        length: 1,
                    },
                    recharging: {
                        name: "",
                        enabled: false,
                    },
                    semiInvulnerable: false,
                    substituteHP: 0,
                    takingAim: 0,
                    thrashing: {
                        name: "",
                        length: 0
                    },
                    disable: {
                        name: "",
                        length: 0
                    },
                    mistLength: 0,
                    transform: {
                        enabled: false,
                        details: {
                            pokeId: 0,
                            name: "String",
                            currentMoves: {},
                            ivStats: {},
                            evLevels: {},
                            base: {}
                        }
                    },
                    counter: 0,
                    lightScreenLength: 0,
                    reflectLength: 0,
                    conversion: false,
                    previousMove: "",
                    spikes: false,
                    destinyBond: 0,
                }
                if (!battlingDetails.userOneBattledPokemon.includes(battlingDetails.userOneCurrentPokemon)) {
                    battlingDetails.userOneBattledPokemon.push(battlingDetails.userOneCurrentPokemon);
                }

                await battlingFunctions.updatePokemonRandomEncounterBattle(battlingDetails._id, battlingDetails.userOneBag, battlingDetails.userOneCurrentPokemon, battlingDetails.userOneStatStage, battlingDetails.userOneTeam, battlingDetails.userOneVolatileStatus, battlingDetails.userTwoStatStage, battlingDetails.userTwoTeam, battlingDetails.userTwoVolatileStatus, battlingDetails.userOne, battlingDetails.userOneBattledPokemon, battlingDetails.userTwoBattledPokemon);

                //if user chooses to swap pokemon then the enemy does their move
                if (customId.includes("voluntarily")) {
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

                    let output = await useMove(battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1], battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1], null, enemyMove, battlingDetails);
                    if (output === true) {
                        return {
                            content: "The battle has ended.",
                            embedDetails: module.exports.createEmbedPVM(battlingDetails),
                            components: []
                        };
                    } else if (output === false) {
                        battlingDetails.turnCounter += 1;
                        battlingFunctions.setTurnCount(battlingDetails._id, battlingDetails.turnCounter);
                        inputChannel.send(`🔴🔴🔴 TURN ${battlingDetails.turnCounter} 🔴🔴🔴`);
                        row = module.exports.setRowDefault(row, inp);
                        return {
                            content: "_ _",
                            embedDetails: module.exports.createEmbedPVM(battlingDetails),
                            components: [row]
                        };
                    } else if (output === "swapping") {
                        row = setRowSwapPokemon(battlingDetails, inp)
                        return {
                            content: "_ _",
                            embedDetails: createSwapEmbed(battlingDetails),
                            components: row
                        };
                    }
                }

                row = module.exports.setRowDefault(row, inp)
                return {
                    content: "_ _",
                    embedDetails: module.exports.createEmbedPVM(battlingDetails),
                    components: [row]
                };
            },
            // battleRunButton: function (customId) {
            //     console.log(`${inp.user.id}spawnBattlePokemon`)
            //     // row = setRowPokemon(battlingDetails, inp)
            //     // return {
            //     //     content: "_ _",
            //     //     embedDetails: createEmbedAfterPokemonPVM(battlingDetails),
            //     //     components: [row]
            //     // };
            // },
            'default': function () {
                console.log("not programmed custom id:", inp.customId)
                row = module.exports.setRowDefault(row, inp)
                return {
                    content: "_ _",
                    embedDetails: createEmbedDefault(battlingDetails),
                    components: [row]
                };
            }
        };

        const battleFunctions = {
            [`${inp.user.id}spawnBattleAttack`]: actions.battleAttackButton,
            [`${inp.user.id}spawnBattlePokemon`]: actions.battlePokemonButton,
            [`${inp.user.id}spawnBattleBag`]: actions.battleBagButtons,
            [`${inp.user.id}itemsLeft`]: actions.battleBagButtons,
            [`${inp.user.id}itemsRight`]: actions.battleBagButtons,
            [`${inp.user.id}battleItemSelectMenu`]: actions.battleBagButtons,
            [`${inp.user.id}spawnBattleRun`]: actions.battleRunButton,
            [`${inp.user.id}back`]: actions.battleBackButton,
            [`${inp.user.id}${battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].currentMoves[0].name}`]: actions.battleMoveButton,
            [`${inp.user.id}${battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].currentMoves[1].name}`]: actions.battleMoveButton,
            [`${inp.user.id}${battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].currentMoves[2].name}`]: actions.battleMoveButton,
            [`${inp.user.id}${battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].currentMoves[3].name}`]: actions.battleMoveButton,
            [`${inp.user.id}Struggle`]: actions.battleMoveButton,
            [`${inp.user.id}recharge`]: actions.battleMoveButton,
            [`${inp.user.id}Poke Ball`]: actions.battlePokeBallButton,
            [`${inp.user.id}Great Ball`]: actions.battlePokeBallButton,
            [`${inp.user.id}Ultra Ball`]: actions.battlePokeBallButton,
            [`${inp.user.id}Master Ball`]: actions.battlePokeBallButton,
            [`${inp.user.id}Love Ball`]: actions.battlePokeBallButton,
            [`${inp.user.id}Moon Ball`]: actions.battlePokeBallButton,
            [`${inp.user.id}Net Ball`]: actions.battlePokeBallButton,
            [`${inp.user.id}Heal Ball`]: actions.battlePokeBallButton,
            [`${inp.user.id}Heavy Ball`]: actions.battlePokeBallButton,
            [`${inp.user.id}Level Ball`]: actions.battlePokeBallButton,
            [`${inp.user.id}Nest Ball`]: actions.battlePokeBallButton,
            [`${inp.user.id}Super Potion`]: actions.battleRecoveryButton,
            [`${inp.user.id}Max Revive`]: actions.battleRecoveryButton,
            [`${inp.user.id}Full Restore`]: actions.battleRecoveryButton,
            [`${inp.user.id}Antidote`]: actions.battleRecoveryButton,
            [`${inp.user.id}Soda Pop`]: actions.battleRecoveryButton,
            [`${inp.user.id}Burn Heal`]: actions.battleRecoveryButton,
            [`${inp.user.id}Full Heal`]: actions.battleRecoveryButton,
            [`${inp.user.id}Ice Heal`]: actions.battleRecoveryButton,
            [`${inp.user.id}Lemonade`]: actions.battleRecoveryButton,
            [`${inp.user.id}Max Revive`]: actions.battleRecoveryButton,
            [`${inp.user.id}Awakening`]: actions.battleRecoveryButton,
            [`${inp.user.id}Elixir`]: actions.battleRecoveryButton,
            [`${inp.user.id}Ether`]: actions.battleRecoveryButton,
            [`${inp.user.id}Max Elixir`]: actions.battleRecoveryButton,
            [`${inp.user.id}Revive`]: actions.battleRecoveryButton,
            [`${inp.user.id}Fresh Water`]: actions.battleRecoveryButton,
            [`${inp.user.id}Hyper Potion`]: actions.battleRecoveryButton,
            [`${inp.user.id}Max Ether`]: actions.battleRecoveryButton,
            [`${inp.user.id}Max Potion`]: actions.battleRecoveryButton,
            [`${inp.user.id}Moomoo Milk`]: actions.battleRecoveryButton,
            [`${inp.user.id}Paralyze Heal`]: actions.battleRecoveryButton,
            [`${inp.user.id}Potion`]: actions.battleRecoveryButton,
            [`${inp.user.id}backToItems`]: actions.battleBackToItemsButton,
            [`${inp.user.id}swapTo1`]: actions.swapPokemonButton,
            [`${inp.user.id}swapTo2`]: actions.swapPokemonButton,
            [`${inp.user.id}swapTo3`]: actions.swapPokemonButton,
            [`${inp.user.id}swapTo4`]: actions.swapPokemonButton,
            [`${inp.user.id}swapTo5`]: actions.swapPokemonButton,
            [`${inp.user.id}swapTo6`]: actions.swapPokemonButton,
            [`${inp.user.id}voluntarilySwapTo1`]: actions.swapPokemonButton,
            [`${inp.user.id}voluntarilySwapTo2`]: actions.swapPokemonButton,
            [`${inp.user.id}voluntarilySwapTo3`]: actions.swapPokemonButton,
            [`${inp.user.id}voluntarilySwapTo4`]: actions.swapPokemonButton,
            [`${inp.user.id}voluntarilySwapTo5`]: actions.swapPokemonButton,
            [`${inp.user.id}voluntarilySwapTo6`]: actions.swapPokemonButton,
            [`${inp.user.id}X Attack`]: actions.usedBattleEffect,
            [`${inp.user.id}Dire Hit`]: actions.usedBattleEffect,
            [`${inp.user.id}Guard Spec`]: actions.usedBattleEffect,
            [`${inp.user.id}X Accuracy`]: actions.usedBattleEffect,
            [`${inp.user.id}X Sp. Atk`]: actions.usedBattleEffect,
            [`${inp.user.id}X Sp. Def`]: actions.usedBattleEffect,
            [`${inp.user.id}X Speed`]: actions.usedBattleEffect,
            [`${inp.user.id}X Defense`]: actions.usedBattleEffect,
        };
        //TODO: add functions for items, can add pokeballs (timer ball)
        if (inp.customId in battleFunctions) {
            return battleFunctions[inp.customId](inp.customId);
        } else if (inp.customId.includes(`${inp.user.id}itemUsed`)) {
            const splitString = inp.customId.replace(`${inp.user.id}itemUsed`, "");
            const splitIndex = splitString.search(/\d/);

            const item = splitString.substring(0, splitIndex);
            let pokemon = splitString.substring(splitIndex);
            if (item.includes("Used Ether") || item.includes("Used Max Ether")) {
                const moveNumber = splitString.charAt(splitString.length - 1);
                pokemon = pokemon.charAt(0);
                // console.log(item.trim(), parseInt(pokemon.trim()), parseInt(moveNumber.trim()))
                return actions.usedItemOnPokemon(item.trim(), parseInt(pokemon.trim()), parseInt(moveNumber.trim()));
            }

            return actions.usedItemOnPokemon(item.trim(), parseInt(pokemon.trim()));
        } else {
            return actions['default']();
        }
    },

    endRandomBattleEncounter: async function (endType, battlingDetails, ballUsed = "Poke Ball") {
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

        for (let i = 0; i < battlingDetails.userOneTeam.length; i++) {
            battlingDetails.userOneTeam[i].status = "normal";
        }
        // if (battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].status === "sleeping") {
        //     battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].status = "normal";
        // }
        //
        // if (battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].status === "sleeping") {
        //     battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].status = "normal";
        // }

        //update battling database
        await battlingFunctions.deletePVMBattle(battlingDetails._id);

        if (endType === "randomPokemonFeints") {
            inputChannel.send(`Enemy pokemon feinted.`);

            let battledAndAlive = [];
            for (let i = 0; i < battlingDetails.userOneBattledPokemon.length; i++) {
                const currentPokemon = battlingDetails.userOneTeam[battlingDetails.userOneBattledPokemon[i] - 1];
                const pokemonHpMultiplier = Math.round(pokemonFunctions.multiplierCalculation(currentPokemon.evLevels.hp));
                const pokemonElb = Math.round(pokemonFunctions.elbCalculation(currentPokemon.base.hp, pokemonHpMultiplier, currentPokemon.level));
                const maxHP = Math.round(pokemonFunctions.hpCalculation(currentPokemon.level, currentPokemon.base.hp, pokemonElb));
                let currentHP = maxHP - currentPokemon.damageTaken;

                if (currentHP > 0) {
                    battledAndAlive.push(battlingDetails.userOneBattledPokemon[i])
                }
            }

            for (let i = 0; i < battledAndAlive.length; i++) {
                //TODO test refactored code
                // async function handleLevelUpAndEvolution(battlingDetails, battledAndAlive, i, inputChannel) {
                //     const userId = battlingDetails.userOne.userId;
                //     const pokemonIndex = battledAndAlive[i] - 1;
                //     const pokemon = battlingDetails.userOneTeam[pokemonIndex];
                //
                //     const updateUserData = async () => {
                //         await trainerFunctions.setBag(userId, battlingDetails.userOneBag);
                //         await trainerFunctions.setTeam(userId, battlingDetails.userOneTeam);
                //     };
                //
                //     // Check if Pokémon leveled up and needs to evolve
                //     if (leveledUp && isPokemonEvolving(pokemon)) {
                //         const stopEvolutionButton = new ActionRowBuilder().addComponents(
                //             new ButtonBuilder()
                //                 .setCustomId(`${userId}stop${battledAndAlive[i]}`)
                //                 .setLabel('Stop Evolving')
                //                 .setStyle('Danger')
                //         );
                //
                //         const messageContent = `${pokemon.nickname || pokemon.name} is evolving! You have 10 seconds to respond.`;
                //         const evolvingMsg = await inputChannel.send({
                //             content: messageContent,
                //             components: [stopEvolutionButton],
                //             flags: MessageFlags.Ephemeral,
                //         });
                //
                //         let evolving = true;
                //
                //         try {
                //             const collector = evolvingMsg.createMessageComponentCollector({
                //                 filter: i => i.user.id === userId && i.customId === `${userId}stop${battledAndAlive[i]}`,
                //                 time: 10000,
                //             });
                //
                //             collector.on('collect', async i => {
                //                 evolving = false;
                //                 collector.stop();
                //             });
                //
                //             collector.on('end', async () => {
                //                 await evolvingMsg.delete();
                //                 const pokemonDetails = await pokemonListFunctions.getPokemonFromId(pokemon.pokeId);
                //                 const evolutionDetails = await pokemonListFunctions.getPokemonFromId(pokemonDetails.evolution);
                //
                //                 if (evolving) {
                //                     // Update Pokémon to its evolved form
                //                     Object.assign(pokemon, {
                //                         pokeId: evolutionDetails.pokeId,
                //                         name: evolutionDetails.name,
                //                         base: evolutionDetails.baseStats,
                //                     });
                //                     await inputChannel.send(`${pokemon.nickname || pokemonDetails.name} evolved into ${evolutionDetails.name}.`);
                //                 } else {
                //                     await inputChannel.send(`${pokemon.nickname || pokemonDetails.name} stopped evolving.`);
                //                 }
                //
                //                 await updateUserData();
                //             });
                //         } catch (e) {
                //             console.error("Error during evolution handling:", e);
                //         }
                //     } else {
                //         // If not evolving, just update user data
                //         await updateUserData();
                //     }
                // }

                //increase pokemon xp
                let newXp = await getGainedXpFromBattle(battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1], battlingDetails.userOneTeam[battledAndAlive[i] - 1]);
                newXp = Math.floor(newXp / battledAndAlive.length);
                battlingDetails.userOneTeam[battledAndAlive[i] - 1].exp += newXp;
                inputChannel.send(`${battlingDetails.userOneTeam[battledAndAlive[i] - 1].nickname || battlingDetails.userOneTeam[battledAndAlive[i] - 1].name} gained ${newXp} xp.`);

                let leveledUp = await getNewLevelAndXp(battlingDetails.userOneTeam[battledAndAlive[i] - 1], inputChannel);
                // console.log(leveledUp)
                // console.log(`${battlingDetails.userOneTeam[battledAndAlive[i] - 1].name} lvled up`)

                //if the pokemon leveled up check if it needs to evolve
                if (leveledUp) {
                    if (isPokemonEvolving(battlingDetails.userOneTeam[battledAndAlive[i] - 1])) {

                        const row = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId(`${battlingDetails.userOne.userId}stop${battledAndAlive[i]}`)
                                    .setLabel('stop evolving')
                                    .setStyle('Danger'),
                            )

                        let pokemonNum = battledAndAlive[i];
                        let evolvingMsg;

                        inputChannel.send({
                            content: `${battlingDetails.userOneTeam[pokemonNum - 1].nickname || battlingDetails.userOneTeam[pokemonNum - 1].name} is evolving! You have 10 seconds to respond.`,
                            components: [row],
                            flags: MessageFlags.Ephemeral
                        }).then(async (msg) => {
                            evolvingMsg = msg;

                            let evolving = true;

                            //TODO check if filter works
                            try {
                                const collector = evolvingMsg.createMessageComponentCollector({
                                    filter: i => (i.user.id === battlingDetails.userOne.userId) && (i.customId === `${battlingDetails.userOne.userId}stop${pokemonNum}`),
                                    time: 10000
                                });

                                collector.on('collect', async i => {
                                    evolving = false;
                                    collector.stop();
                                })

                                collector.on('end', async () => {
                                    evolvingMsg.delete();

                                    const pokemonDetails = await pokemonListFunctions.getPokemonFromId(battlingDetails.userOneTeam[pokemonNum - 1].pokeId);
                                    const pokemonEvolutionDetails = await pokemonListFunctions.getPokemonFromId(pokemonDetails.evolution);

                                    if (evolving) {
                                        battlingDetails.userOneTeam[pokemonNum - 1].pokeId = pokemonEvolutionDetails.pokeId;
                                        battlingDetails.userOneTeam[pokemonNum - 1].name = pokemonEvolutionDetails.name;
                                        battlingDetails.userOneTeam[pokemonNum - 1].base = pokemonEvolutionDetails.baseStats;

                                        inputChannel.send(`${battlingDetails.userOneTeam[pokemonNum - 1].nickname || pokemonDetails.name} evolved into ${pokemonEvolutionDetails.name}.`);
                                    } else {
                                        inputChannel.send(`${battlingDetails.userOneTeam[pokemonNum - 1].nickname || pokemonDetails.name} is no longer evolving.`);
                                    }

                                    //update bag
                                    await trainerFunctions.setBag(battlingDetails.userOne.userId, battlingDetails.userOneBag);

                                    //update team
                                    await trainerFunctions.setTeam(battlingDetails.userOne.userId, battlingDetails.userOneTeam);

                                })
                            } catch (e) {
                                console.log(e)
                            }
                        })
                    } else {
                        //update bag
                        await trainerFunctions.setBag(battlingDetails.userOne.userId, battlingDetails.userOneBag);

                        //update team
                        await trainerFunctions.setTeam(battlingDetails.userOne.userId, battlingDetails.userOneTeam);
                    }
                } else {
                    //update bag
                    await trainerFunctions.setBag(battlingDetails.userOne.userId, battlingDetails.userOneBag);

                    //update team
                    await trainerFunctions.setTeam(battlingDetails.userOne.userId, battlingDetails.userOneTeam);
                }
            }
            //update battling to false
            await trainerFunctions.setBattling(battlingDetails.userOne.userId, false);
            //increase user gold depending on pokemon level
            let money = getMoneyFromSpawnedPokemon(battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].level);
            battlingDetails.userOne.money += money;
            inputChannel.send(`Got ${money} coins.`);
            //update set gold
            await trainerFunctions.setMoney(battlingDetails.userOne.userId, battlingDetails.userOne.money);

        } else if (endType === "wildPokemonCaught") {
            inputChannel.send(`Wild pokemon was caught.`);

            const currentTime = Date.now();
            battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].owner = battlingDetails.userOne.userId;
            battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].ball = ballUsed;
            battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].caughtTimestamp = currentTime;
            battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].receivedTimestamp = currentTime;

            if (ballUsed === "Heal Ball") {
                battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].damageTaken = 0;
                battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].status = "normal";
            }

            //update team
            await trainerFunctions.setTeam(battlingDetails.userOne.userId, battlingDetails.userOneTeam);

            //add pokemon to user
            await trainerFunctions.addPokemonToCreatedUser(battlingDetails.userOne.userId, battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1]);

            //update battling to false
            await trainerFunctions.setBattling(battlingDetails.userOne.userId, false);

            //update bag
            await trainerFunctions.setBag(battlingDetails.userOne.userId, battlingDetails.userOneBag);

        } else {
            //update bag
            await trainerFunctions.setBag(battlingDetails.userOne.userId, battlingDetails.userOneBag);

            //update team
            await trainerFunctions.setTeam(battlingDetails.userOne.userId, battlingDetails.userOneTeam);

            //update battling to false
            await trainerFunctions.setBattling(battlingDetails.userOne.userId, false);

            //update set gold
            await trainerFunctions.setMoney(battlingDetails.userOne.userId, battlingDetails.userOne.money);

        }
    },

    setRowDefault: function (row, inp) {
        return new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`${inp.user.id}spawnBattleAttack`)
                    .setLabel('attack')
                    .setStyle('Primary'),
            )
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`${inp.user.id}spawnBattlePokemon`)
                    .setLabel('pokemon')
                    .setStyle('Primary'),
            )
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`${inp.user.id}spawnBattleBag`)
                    .setLabel('bag')
                    .setStyle('Primary'),
            )
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`${inp.user.id}spawnBattleRun`)
                    .setLabel('run')
                    .setStyle('Danger'),
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

    //TODO: check encore

    //TODO: check torment

    if (battlingDetails.userOneVolatileStatus.disable.length > 0) {
        currentMoves = currentMoves.filter(move => {
            return move.name !== battlingDetails.userOneVolatileStatus.disable.name;
        });
    }

    //do an if statement and set move to recharging
    if (battlingDetails.userOneVolatileStatus.chargingMove.chargingLength > 0) {
        row.addComponents(
            new ButtonBuilder()
                .setCustomId(
                    `${inp.user.id}${battlingDetails.userOneVolatileStatus.chargingMove.name}`
                )
                .setLabel(
                    `${battlingDetails.userOneVolatileStatus.chargingMove.name}`
                )
                .setStyle('Primary'),
        )
    } else if (battlingDetails.userOneVolatileStatus.recharging.enabled) {
        row.addComponents(
            new ButtonBuilder()
                .setCustomId(
                    `${inp.user.id}recharge`
                )
                .setLabel(
                    `recharge`
                )
                .setStyle('Primary'),
        )
    } else if (currentMoves.length < 1) {
        row.addComponents(
            new ButtonBuilder()
                .setCustomId(
                    `${inp.user.id}Struggle`
                )
                .setLabel(
                    `struggle`
                )
                .setStyle('Primary'),
        )
    } else {
        for (let j = 0; j < currentMoves.length; j++) {

            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(
                        `${inp.user.id}${currentMoves[j].name}`
                    )
                    .setLabel(
                        `${currentMoves[j].name}`
                    )
                    .setStyle('Primary'),
            )
        }
    }

    row.addComponents(
        new ButtonBuilder()
            .setCustomId(`${inp.user.id}back`)
            .setLabel(`back`)
            .setStyle('Danger'),
    )
    return row;
}

function setRowBattleItem(battlingDetails, inp) {

    let rows = [];

    const selectRow = new ActionRowBuilder();
    selectRow.addComponents(
        new StringSelectMenuBuilder()
            .setCustomId(`${inp.user.id}battleItemSelectMenu`)
            .setPlaceholder('Category')
            .addOptions([
                {
                    label: 'poke-ball',
                    description: 'Filter all poke-balls.',
                    value: `${inp.user.id}poke-ballFilter`,
                },
                {
                    label: 'recovery',
                    description: 'Filter all recovery items.',
                    value: `${inp.user.id}recoveryFilter`,
                },
                {
                    label: 'battle-effect',
                    description: 'Filter all battle-effect items.',
                    value: `${inp.user.id}battle-effectFilter`,
                },
            ]),
    )
    rows.push(selectRow);

    const bagArray = [];
    try {
        for (const key of Object.keys(battlingDetails.userOneBag.get(currentBagCategory))) {
            if (battlingDetails.userOneBag.get(currentBagCategory)[key] > 0) {
                bagArray.push(key);
            }
        }
    } catch (e) {

    }

    let max = Math.min(bagArray.length, currentBagMin + 10);
    const diff = max - currentBagMin;

    let itemRowOne = new ActionRowBuilder();
    let itemRowTwo = new ActionRowBuilder();

    for (let i = 0; i < Math.min(5, diff); i++) {
        // console.log(bagArray[min + i])
        itemRowOne.addComponents(
            new ButtonBuilder()
                .setCustomId(`${inp.user.id}${bagArray[currentBagMin + i]}`)
                .setLabel(`Use ${bagArray[currentBagMin + i]}`)
                .setStyle('Primary')
        )
    }

    // console.log(min, max, diff)

    // console.log(itemRowOne)

    for (let i = 5; i < diff; i++) {
        itemRowTwo.addComponents(
            new ButtonBuilder()
                .setCustomId(`${inp.user.id}${bagArray[currentBagMin + i]}`)
                .setLabel(`Use ${bagArray[currentBagMin + i]}`)
                .setStyle('Primary')
        )
    }

    if (diff > 0) {
        rows.push(itemRowOne)
    }
    if (diff > 4) {
        rows.push(itemRowTwo)
    }

    const arrowRow = new ActionRowBuilder();
    arrowRow.addComponents(
        new ButtonBuilder()
            .setCustomId(`${inp.user.id}itemsLeft`)
            .setLabel(`⏪`)
            .setStyle('Secondary'),
        new ButtonBuilder()
            .setCustomId(`${inp.user.id}itemsRight`)
            .setLabel(`⏩`)
            .setStyle('Secondary'),
        new ButtonBuilder()
            .setCustomId(`${inp.user.id}back`)
            .setLabel(`back`)
            .setStyle('Danger'),
    )
    rows.push(arrowRow);
    return rows;
}

function setRowItemUsed(battlingDetails, inp, item, itemType) {

    const unfilteredPokemon = battlingDetails.userOneTeam;
    const pokemonArray = [];
    let rows = [];
    const pokemonRow = new ActionRowBuilder();

    for (let i = 0; i < unfilteredPokemon.length; i++) {
        const currentPokemon = unfilteredPokemon[i];
        const pokemonHpMultiplier = Math.round(pokemonFunctions.multiplierCalculation(currentPokemon.evLevels.hp));
        const pokemonElb = Math.round(pokemonFunctions.elbCalculation(currentPokemon.base.hp, pokemonHpMultiplier, currentPokemon.level));
        const maxHP = Math.round(pokemonFunctions.hpCalculation(currentPokemon.level, currentPokemon.base.hp, pokemonElb));
        let currentHP = maxHP - currentPokemon.damageTaken;


        switch (itemType) {
            case "aliveOnly":
                if (currentHP > 0) {
                    pokemonArray.push(currentPokemon);
                    if (pokemonArray.length < 6) {
                        pokemonRow.addComponents(
                            new ButtonBuilder()
                                .setCustomId(`${inp.user.id}itemUsed${item}${i}`)
                                .setLabel(`Use ${item} on ${pokemonArray.length}) ${unfilteredPokemon[i].nickname || unfilteredPokemon[i].name}`)
                                .setStyle('Primary'),
                        )
                    }
                }
                break;
            case "deadOnly":
                if (currentHP < 1) {
                    pokemonArray.push(currentPokemon);
                    if (pokemonArray.length < 6) {
                        pokemonRow.addComponents(
                            new ButtonBuilder()
                                .setCustomId(`${inp.user.id}itemUsed${item}${i}`)
                                .setLabel(`Use ${item} on ${pokemonArray.length}) ${unfilteredPokemon[i].nickname || unfilteredPokemon[i].name}`)
                                .setStyle('Primary'),
                        )
                    }
                }
                break;
            case "deadAndAlive":
                pokemonArray.push(currentPokemon);
                if (pokemonArray.length < 6) {
                    pokemonRow.addComponents(
                        new ButtonBuilder()
                            .setCustomId(`${inp.user.id}itemUsed${item}${i}`)
                            .setLabel(`Use ${item} on ${pokemonArray.length}) ${unfilteredPokemon[i].nickname || unfilteredPokemon[i].name}`)
                            .setStyle('Primary'),
                    )
                }
                break;
        }
    }


    if (pokemonArray.length > 0) {
        rows.push(pokemonRow);
    }

    const backRow = new ActionRowBuilder();
    if (pokemonArray.length > 5) {
        backRow.addComponents(
            new ButtonBuilder()
                .setCustomId(`${inp.user.id}itemUsed${item}${5}`)
                .setLabel(`Use ${item} on 6) ${pokemonArray[5].nickname || pokemonArray[5].name}`)
                .setStyle('Primary'),
        )
    }

    backRow.addComponents(
        new ButtonBuilder()
            .setCustomId(`${inp.user.id}backToItems`)
            .setLabel(`back`)
            .setStyle('Danger'),
    )
    rows.push(backRow);
    return rows;
}

function setRowSwapPokemon(battlingDetails, inp, voluntarily = false) {

    const unfilteredPokemon = battlingDetails.userOneTeam;
    const pokemonArray = [];

    const pokemonRow = new ActionRowBuilder();

    for (let i = 0; i < unfilteredPokemon.length; i++) {
        if (i === battlingDetails.userOneCurrentPokemon - 1) {
            continue;
        }

        const currentPokemon = unfilteredPokemon[i];
        const pokemonHpMultiplier = Math.round(pokemonFunctions.multiplierCalculation(currentPokemon.evLevels.hp));
        const pokemonElb = Math.round(pokemonFunctions.elbCalculation(currentPokemon.base.hp, pokemonHpMultiplier, currentPokemon.level));
        const maxHP = Math.round(pokemonFunctions.hpCalculation(currentPokemon.level, currentPokemon.base.hp, pokemonElb));
        let currentHP = maxHP - currentPokemon.damageTaken;

        if (currentHP > 0) {
            pokemonArray.push(currentPokemon);

            if (voluntarily) {
                pokemonRow.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`${inp.user.id}voluntarilySwapTo${i + 1}`)
                        .setLabel(`Swap to ${pokemonArray.length}) ${unfilteredPokemon[i].nickname || unfilteredPokemon[i].name}`)
                        .setStyle('Primary'),
                )
            } else {
                pokemonRow.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`${inp.user.id}swapTo${i + 1}`)
                        .setLabel(`Swap to ${pokemonArray.length}) ${unfilteredPokemon[i].nickname || unfilteredPokemon[i].name}`)
                        .setStyle('Primary'),
                )
            }
        }
    }
    let row = [];

    if (pokemonArray.length === 0 || pokemonArray.length > 5) {
        pokemonRow.addComponents(
            new ButtonBuilder()
                .setCustomId(`${inp.user.id}back`)
                .setLabel(`back`)
                .setStyle('Danger'),
        )
        row.push(pokemonRow);
    } else {
        const backRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`${inp.user.id}back`)
                    .setLabel(`back`)
                    .setStyle('Danger')
            )
        row.push(pokemonRow);
        row.push(backRow);
    }

    return row;
}

function setRowEther(battlingDetails, inp, etherType, pokemonUsedOn) {

    const moveRow = new ActionRowBuilder();
    let moveList = battlingDetails.userOneTeam[pokemonUsedOn].currentMoves;

    for (let i = 0; i < moveList.length; i++) {
        moveRow.addComponents(
            new ButtonBuilder()
                .setCustomId(`${inp.user.id}itemUsedUsed ${etherType}${pokemonUsedOn}${i}`)
                .setLabel(`Use ${etherType} on ${moveList[i].name}`)
                .setStyle('Primary'),
        )
    }

    moveRow.addComponents(
        new ButtonBuilder()
            .setCustomId(`${inp.user.id}${etherType}`)
            .setLabel(`back`)
            .setStyle('Danger')
    )

    return moveRow;
}

function createEmbedAfterAttackPVM(battlingDetails) {

    let attackDetailsEmbed = new EmbedBuilder()
        .setColor('Random')
        .setTitle(`${battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].nickname || battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].name} VS ${battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].nickname || battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].name}`)
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
            attackDetailsEmbed.addFields([{name: 'Power', value: `0`, inline: true}])
        else
            attackDetailsEmbed.addFields([{name: 'Power', value: `${currentMoves[j].pwr}`, inline: true}])

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
    const gif = new AttachmentBuilder(`./python/battle_image_outputs/battle_gifs/${battlingDetails.userOne.userId}.gif`);
    return [attackDetailsEmbed,
        gif,
        false
    ]
}

function createEmbedDefault(battlingDetails) {
    const gif = new AttachmentBuilder(`./python/battle_image_outputs/battle_gifs/${battlingDetails.userOne.userId}.gif`);
    return [new EmbedBuilder()
        .setColor('Random')
        .setTitle(`${battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].nickname || battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].name} VS ${battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].nickname || battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].name}`)
        .setImage(`attachment://${battlingDetails.userOne.userId}.gif`)
        .setTimestamp(),
        gif,
        false
    ]
}

async function createEmbedAfterBagPVM(battlingDetails) {

    let attackBagEmbed = new EmbedBuilder()
        .setColor('Random')
        .setTitle(`${battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].nickname || battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].name} VS ${battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].nickname || battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].name}`)
        .setImage(`attachment://${battlingDetails.userOne.userId}.gif`)
        .setTimestamp()

    const bagArray = [];
    try {
        for (const key of Object.keys(battlingDetails.userOneBag.get(currentBagCategory))) {
            if (battlingDetails.userOneBag.get(currentBagCategory)[key] > 0) {
                bagArray.push(key);
            }
        }
    } catch (e) {

    }

    attackBagEmbed.addFields([{name: `${currentBagCategory}`, value: `\u200b`, inline: false}])

    let max = Math.min(bagArray.length, currentBagMin + 10);

    for (let i = currentBagMin; i < max; i++) {
        let fullItemDetails = await itemListFunctions.getItem(bagArray[i]);

        attackBagEmbed.addFields([{
            name: `${i + 1}) ${bagArray[i]}`,
            value: `${fullItemDetails.description}\n${battlingDetails.userOneBag.get(currentBagCategory)[bagArray[i]]}`,
            inline: false
        }]);
    }

    const gif = new AttachmentBuilder(`./python/battle_image_outputs/battle_gifs/${battlingDetails.userOne.userId}.gif`);
    return [attackBagEmbed,
        gif,
        false
    ]
}

function createEmbedAfterItemUsed(battlingDetails, itemType) {

    let pokemonListEmbed = new EmbedBuilder()
        .setColor('Random')
        .setTitle(`Available Pokemon to use item on:`)
        .setTimestamp()

    const pokemonArray = [];
    const unfilteredPokemon = battlingDetails.userOneTeam;

    for (let i = 0; i < unfilteredPokemon.length; i++) {
        const currentPokemon = unfilteredPokemon[i];
        const pokemonHpMultiplier = Math.round(pokemonFunctions.multiplierCalculation(currentPokemon.evLevels.hp));
        const pokemonElb = Math.round(pokemonFunctions.elbCalculation(currentPokemon.base.hp, pokemonHpMultiplier, currentPokemon.level));
        const maxHP = Math.round(pokemonFunctions.hpCalculation(currentPokemon.level, currentPokemon.base.hp, pokemonElb));
        let currentHP = maxHP - currentPokemon.damageTaken;

        switch (itemType) {
            case "aliveOnly":
                if (currentHP > 0)
                    pokemonArray.push(currentPokemon);
                break;
            case "deadOnly":
                if (currentHP < 1)
                    pokemonArray.push(currentPokemon);
                break;
            case "deadAndAlive":
                pokemonArray.push(currentPokemon);
                break;
        }
    }

    for (let i = 0; i < pokemonArray.length; i++) {
        const currentPokemon = pokemonArray[i];
        const pokemonHpMultiplier = Math.round(pokemonFunctions.multiplierCalculation(currentPokemon.evLevels.hp));
        const pokemonElb = Math.round(pokemonFunctions.elbCalculation(currentPokemon.base.hp, pokemonHpMultiplier, currentPokemon.level));
        const maxHP = Math.round(pokemonFunctions.hpCalculation(currentPokemon.level, currentPokemon.base.hp, pokemonElb));
        let currentHP = maxHP - currentPokemon.damageTaken;

        let moves = "";
        for (let j = 0; j < currentPokemon.currentMoves.length; j++) {
            const currentMove = currentPokemon.currentMoves[j];
            moves += `• ${currentMove.name} ${currentMove.currentPP}/${currentMove.pp}\n`;
        }

        // let result;
        // if (currentPokemon.shiny)
        //     result = await emojiListFunctions.getShinyGif(currentPokemon.pokeId);
        // else
        //     result = await emojiListFunctions.getNormalGif(currentPokemon.pokeId);

        pokemonListEmbed.addFields([{
            name: `${i + 1}) ${currentPokemon.level} ${currentPokemon.name} ${currentHP}/${maxHP}`,
            value: `${moves}`,
            inline: false
        }])
    }

    const gif = new AttachmentBuilder(`./python/battle_image_outputs/battle_gifs/${battlingDetails.userOne.userId}.gif`);
    return [pokemonListEmbed,
        gif,
        false
    ]
}

function createSwapEmbed(battlingDetails) {
    let pokemonToSwapEmbed = new EmbedBuilder()
        .setColor('Random')
        .setTitle(`Available Pokemon to swap:`)
        .setTimestamp()

    const pokemonArray = [];
    const unfilteredPokemon = battlingDetails.userOneTeam;

    for (let i = 0; i < unfilteredPokemon.length; i++) {

        if (i === battlingDetails.userOneCurrentPokemon - 1) {
            continue;
        }

        const currentPokemon = unfilteredPokemon[i];
        const pokemonHpMultiplier = Math.round(pokemonFunctions.multiplierCalculation(currentPokemon.evLevels.hp));
        const pokemonElb = Math.round(pokemonFunctions.elbCalculation(currentPokemon.base.hp, pokemonHpMultiplier, currentPokemon.level));
        const maxHP = Math.round(pokemonFunctions.hpCalculation(currentPokemon.level, currentPokemon.base.hp, pokemonElb));
        let currentHP = maxHP - currentPokemon.damageTaken;

        if (currentHP > 0)
            pokemonArray.push(currentPokemon);
    }

    for (let i = 0; i < pokemonArray.length; i++) {
        const currentPokemon = pokemonArray[i];
        const pokemonHpMultiplier = Math.round(pokemonFunctions.multiplierCalculation(currentPokemon.evLevels.hp));
        const pokemonElb = Math.round(pokemonFunctions.elbCalculation(currentPokemon.base.hp, pokemonHpMultiplier, currentPokemon.level));
        const maxHP = Math.round(pokemonFunctions.hpCalculation(currentPokemon.level, currentPokemon.base.hp, pokemonElb));
        let currentHP = maxHP - currentPokemon.damageTaken;

        // let result;
        // if (currentPokemon.shiny)
        //     result = await emojiListFunctions.getShinyGif(currentPokemon.pokeId);
        // else
        //     result = await emojiListFunctions.getNormalGif(currentPokemon.pokeId);

        pokemonToSwapEmbed.addFields([{
            name: `${i + 1}) ${currentPokemon.level} ${currentPokemon.name} ${currentHP}/${maxHP}`,
            value: '\u200b',
            inline: false
        }]);
    }
    const userTwoHpMultiplier = Math.round(pokemonFunctions.multiplierCalculation(battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].evLevels.hp));

    const userTwoElb = Math.round(pokemonFunctions.elbCalculation(battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].base.hp, userTwoHpMultiplier, battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].level));

    const userTwoTotalHp = Math.round(pokemonFunctions.hpCalculation(battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].level, battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].base.hp, userTwoElb));

    const userOneHpMultiplier = Math.round(pokemonFunctions.multiplierCalculation(battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].evLevels.hp));

    const userOneElb = Math.round(pokemonFunctions.elbCalculation(battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].base.hp, userOneHpMultiplier, battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].level));

    const userOneTotalHp = Math.round(pokemonFunctions.hpCalculation(battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].level, battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].base.hp, userOneElb));

    let enemy_pokemon_name = battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].nickname || battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].name;
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
            enemy_pokemon_id, user_pokemon_id, enemy_pokemon_shiny, team_pokemon_shiny, battlingDetails.userTwoTeam[battlingDetails.userTwoCurrentPokemon - 1].status, battlingDetails.userOneTeam[battlingDetails.userOneCurrentPokemon - 1].status]
    };

    PythonShell.run('./python/battle_image.py', options, function (err, results) {
        if (err)
            throw err;
        // Results is an array consisting of messages collected during execution
        console.log('python code results: %j', results);
    });

    const gif = new AttachmentBuilder(`./python/battle_image_outputs/battle_gifs/${battlingDetails.userOne.userId}.gif`);
    return [pokemonToSwapEmbed,
        gif,
        false
    ]
}

function createEtherEmbed(battlingDetails, etherType, pokemonUsedOn) {
    let pokemonToSwapEmbed = new EmbedBuilder()
        .setColor('Random')
        .setTitle(`Choose move to use ${etherType} on:`)
        .setTimestamp()

    let moveList = battlingDetails.userOneTeam[pokemonUsedOn].currentMoves;

    for (let i = 0; i < moveList.length; i++) {
        pokemonToSwapEmbed.addFields([{
            name: `${i + 1}) ${moveList[i].name} ${moveList[i].currentPP}/${moveList[i].pp}`,
            value: '\u200b',
            inline: false
        }]);
    }

    const gif = new AttachmentBuilder(`./python/battle_image_outputs/battle_gifs/${battlingDetails.userOne.userId}.gif`);
    return [pokemonToSwapEmbed,
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
            inputChannel.send(`${randomPokemon.nickname || randomPokemon.name} is recharging from ${battleDetails.userTwoVolatileStatus.recharging.name}`)
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
            inputChannel.send(`${user.nickname || user.name} is recharging from ${battleDetails.userOneVolatileStatus.recharging.name}`)
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
                inputChannel.send(`${randomPokemon.nickname || randomPokemon.name} is recharging from ${battleDetails.userTwoVolatileStatus.recharging.name}`)
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
            inputChannel.send(`${randomPokemon.nickname || randomPokemon.name} is recharging from ${battleDetails.userTwoVolatileStatus.recharging.name}`)
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
                inputChannel.send(`${user.nickname || user.name} is recharging from ${battleDetails.userOneVolatileStatus.recharging.name}`)
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
                inputChannel.send(`${user.nickname || user.name} is recharging from ${battleDetails.userOneVolatileStatus.recharging.name}`)
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
                    inputChannel.send(`${randomPokemon.nickname || randomPokemon.name} is recharging from ${battleDetails.userTwoVolatileStatus.recharging.name}`)
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
                inputChannel.send(`${randomPokemon.nickname || randomPokemon.name} is recharging from ${battleDetails.userTwoVolatileStatus.recharging.name}`)
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
                    inputChannel.send(`${user.nickname || user.name} is recharging from ${battleDetails.userOneVolatileStatus.recharging.name}`)
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
                    inputChannel.send(`${user.nickname || user.name} is recharging from ${battleDetails.userOneVolatileStatus.recharging.name}`)
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
                        inputChannel.send(`${randomPokemon.nickname || randomPokemon.name} is recharging from ${battleDetails.userTwoVolatileStatus.recharging.name}`)
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
                    inputChannel.send(`${randomPokemon.nickname || randomPokemon.name} is recharging from ${battleDetails.userTwoVolatileStatus.recharging.name}`)
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
                        inputChannel.send(`${user.nickname || user.name} is recharging from ${battleDetails.userOneVolatileStatus.recharging.name}`)
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

        if (user.damageTaken >= userTotalHp) {
            battleDetails.userOneTeam[battleDetails.userOneCurrentPokemon - 1].status = "normal";

            let usablePokemon = [];
            for (let i = 0; i < battleDetails.userOneTeam.length; i++) {
                const pokemon = battleDetails.userOneTeam[i];
                const pokemonHpMultiplier = Math.round(pokemonFunctions.multiplierCalculation(pokemon.evLevels.hp));
                const pokemonElb = Math.round(pokemonFunctions.elbCalculation(pokemon.base.hp, pokemonHpMultiplier, pokemon.level));
                const maxHP = Math.round(pokemonFunctions.hpCalculation(pokemon.level, pokemon.base.hp, pokemonElb));

                if (maxHP > pokemon.damageTaken) {
                    usablePokemon.push(i);
                }
            }

            if (usablePokemon.length === 0) {
                inputChannel.send(`All usable pokemon have feinted.`);
                await module.exports.endRandomBattleEncounter("userFeints", battleDetails);
            } else {
                await battlingFunctions.updatePokemonRandomEncounterBattle(battleDetails._id, battleDetails.userOneBag, battleDetails.userOneCurrentPokemon, battleDetails.userOneStatStage, battleDetails.userOneTeam, battleDetails.userOneVolatileStatus, battleDetails.userTwoStatStage, battleDetails.userTwoTeam, battleDetails.userTwoVolatileStatus, battleDetails.userOne, battleDetails.userOneBattledPokemon, battleDetails.userTwoBattledPokemon);
                inputChannel.send(`Pokemon feinted, choose a pokemon to swap to.`);
                return "swapping";
            }
        } else {
            await module.exports.endRandomBattleEncounter("randomPokemonFeints", battleDetails);
        }

        return true;
    } else {
        runThroughStatusEffects(user, battleDetails.userOneVolatileStatus, userTotalHp, randomPokemon);
        if (user.damageTaken >= userTotalHp || randomPokemon.damageTaken >= pokemonTotalHp) {
            //end battle function
            if (user.damageTaken >= userTotalHp) {
                battleDetails.userOneTeam[battleDetails.userOneCurrentPokemon - 1].status = "normal";

                let usablePokemon = [];
                for (let i = 0; i < battleDetails.userOneTeam.length; i++) {
                    const pokemon = battleDetails.userOneTeam[i];
                    const pokemonHpMultiplier = Math.round(pokemonFunctions.multiplierCalculation(pokemon.evLevels.hp));
                    const pokemonElb = Math.round(pokemonFunctions.elbCalculation(pokemon.base.hp, pokemonHpMultiplier, pokemon.level));
                    const maxHP = Math.round(pokemonFunctions.hpCalculation(pokemon.level, pokemon.base.hp, pokemonElb));

                    if (maxHP > pokemon.damageTaken) {
                        usablePokemon.push(i);
                    }
                }

                if (usablePokemon.length === 0) {
                    inputChannel.send(`All usable pokemon have feinted.`);
                    await module.exports.endRandomBattleEncounter("userFeints", battleDetails);
                } else {
                    await battlingFunctions.updatePokemonRandomEncounterBattle(battleDetails._id, battleDetails.userOneBag, battleDetails.userOneCurrentPokemon, battleDetails.userOneStatStage, battleDetails.userOneTeam, battleDetails.userOneVolatileStatus, battleDetails.userTwoStatStage, battleDetails.userTwoTeam, battleDetails.userTwoVolatileStatus, battleDetails.userOne, battleDetails.userOneBattledPokemon, battleDetails.userTwoBattledPokemon);
                    inputChannel.send(`Pokemon feinted, choose a pokemon to swap to.`);
                    return "swapping";
                }

                // if (usablePokemon.length === 0)
                //     await module.exports.endRandomBattleEncounter("userFeints", battleDetails);
                // else {
                //     inputChannel.send(`Swapped to ${battleDetails.userOneTeam[usablePokemon[0]].name}.`)
                //     battleDetails.userOneCurrentPokemon = usablePokemon[0] + 1;
                //     //update battle details in db
                //     await battlingFunctions.updatePokemonRandomEncounterBattle(battleDetails._id, battleDetails.userOneBag, battleDetails.userOneCurrentPokemon, battleDetails.userOneStatStage, battleDetails.userOneTeam, battleDetails.userOneVolatileStatus, battleDetails.userTwoStatStage, battleDetails.userTwoTeam, battleDetails.userTwoVolatileStatus, battleDetails.userOne);
                //     return false;
                // }
            } else {
                await module.exports.endRandomBattleEncounter("randomPokemonFeints", battleDetails);
            }
            return true;
        }
        runThroughStatusEffects(randomPokemon, battleDetails.userTwoVolatileStatus, pokemonTotalHp, user);
        if (user.damageTaken >= userTotalHp || randomPokemon.damageTaken >= pokemonTotalHp) {
            //end battle function
            if (user.damageTaken >= userTotalHp) {
                battleDetails.userOneTeam[battleDetails.userOneCurrentPokemon - 1].status = "normal";

                let usablePokemon = [];
                for (let i = 0; i < battleDetails.userOneTeam.length; i++) {
                    const pokemon = battleDetails.userOneTeam[i];
                    const pokemonHpMultiplier = Math.round(pokemonFunctions.multiplierCalculation(pokemon.evLevels.hp));
                    const pokemonElb = Math.round(pokemonFunctions.elbCalculation(pokemon.base.hp, pokemonHpMultiplier, pokemon.level));
                    const maxHP = Math.round(pokemonFunctions.hpCalculation(pokemon.level, pokemon.base.hp, pokemonElb));

                    if (maxHP > pokemon.damageTaken) {
                        usablePokemon.push(i);
                    }
                }

                if (usablePokemon.length === 0) {
                    inputChannel.send(`All usable pokemon have feinted.`);
                    await module.exports.endRandomBattleEncounter("userFeints", battleDetails);
                } else {
                    await battlingFunctions.updatePokemonRandomEncounterBattle(battleDetails._id, battleDetails.userOneBag, battleDetails.userOneCurrentPokemon, battleDetails.userOneStatStage, battleDetails.userOneTeam, battleDetails.userOneVolatileStatus, battleDetails.userTwoStatStage, battleDetails.userTwoTeam, battleDetails.userTwoVolatileStatus, battleDetails.userOne, battleDetails.userOneBattledPokemon, battleDetails.userTwoBattledPokemon);
                    inputChannel.send(`Pokemon feinted, choose a pokemon to swap to.`);
                    return "swapping";
                }

                // if (usablePokemon.length === 0)
                //     await module.exports.endRandomBattleEncounter("userFeints", battleDetails);
                // else {
                //     // console.log(inputChannel, 3)
                //     inputChannel.send(`Swapped to ${battleDetails.userOneTeam[usablePokemon[0]].name}.`)
                //     battleDetails.userOneCurrentPokemon = usablePokemon[0] + 1;
                //     //update battle details in db
                //     await battlingFunctions.updatePokemonRandomEncounterBattle(battleDetails._id, battleDetails.userOneBag, battleDetails.userOneCurrentPokemon, battleDetails.userOneStatStage, battleDetails.userOneTeam, battleDetails.userOneVolatileStatus, battleDetails.userTwoStatStage, battleDetails.userTwoTeam, battleDetails.userTwoVolatileStatus, battleDetails.userOne);
                //     return false;
                // }
            } else {
                await module.exports.endRandomBattleEncounter("randomPokemonFeints", battleDetails);
            }
            return true;
        }
    }

    //update battle details in db
    await battlingFunctions.updatePokemonRandomEncounterBattle(battleDetails._id, battleDetails.userOneBag, battleDetails.userOneCurrentPokemon, battleDetails.userOneStatStage, battleDetails.userOneTeam, battleDetails.userOneVolatileStatus, battleDetails.userTwoStatStage, battleDetails.userTwoTeam, battleDetails.userTwoVolatileStatus, battleDetails.userOne, battleDetails.userOneBattledPokemon, battleDetails.userTwoBattledPokemon);
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
            inputChannel.send(`${attacker.nickname || attacker.name} managed to thaw out.`)
        } else {
            inputChannel.send(`${attacker.nickname || attacker.name} is frozen.`)
            return;
        }
    }

    if (attacker.status === "paralyzed") {
        if (Math.floor(Math.random() * 4) === 0) {
            inputChannel.send(`${attacker.nickname || attacker.name} is paralyzed and can't move.`)
            return;
        }
    }

    if (attacker.status === "sleeping") {
        // console.log("sleep length", attackerVolatileStatus.sleepTurnLength)
        if (attackerVolatileStatus.sleepTurnLength <= 1) {
            inputChannel.send(`${attacker.nickname || attacker.name} woke up.`)
            attacker.status = "normal";
        } else {
            inputChannel.send(`${attacker.nickname || attacker.name} is fast asleep.`)
            return;
        }
    }

    if (attackerVolatileStatus.flinch) {
        inputChannel.send(`${attacker.nickname || attacker.name} flinched.`)
        return;
    }

    let infatuation = Math.floor(Math.random() * 2);
    if (attackerVolatileStatus.infatuation && infatuation === 0) {
        inputChannel.send(`${attacker.nickname || attacker.name} is in love.`)
        return;
    }

    if (attackerVolatileStatus.confusionLength) {
        if (attackerVolatileStatus.confusionLength === 1) {
            inputChannel.send(`${attacker.nickname || attacker.name} snapped out of it's confusion.`)
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
                inputChannel.send(`${attacker.nickname || attacker.name} hurt itself in it's confusion and did ${damage} dmg.`)
                return;
            }
        }
    }

    if (move.type === "ground" && defenderVolatileStatus.magneticLevitationLength > 0) {
        inputChannel.send(`Due to magnetic levitation ${attacker.nickname || attacker.name}'s ground move had no effect.`)
        return;
    }

    if (move.type === "ground" && defenderVolatileStatus.telekinesisLength > 0) {
        inputChannel.send(`Due to telekinesis ${attacker.nickname || attacker.name}'s ground move had no effect.`)
        return;
    }

    let movesThatBypassProtect = new Set(["Acupressure", "Aromatic Mist", "Bestow",
        "Block", "Confide", "Conversion 2", "Curse", "Decorate", "Doom Desire", "Feint",
        "Flower Shield", "Future Sight", "Hold Hands", "Hyperspace Fury", "Hyperspace Hole",
        "Mean Look", "Nightmare", "Perish Song", "Phantom Force", "Play Nice", "Psych Up",
        "Roar", "Role Play", "Rototiller", "Shadow Force", "Sketch", "Spider Web",
        "Tearful Look", "Teatime", "Transform", "Whirlwind", "Jump Kick", "High Jump Kick"])
    if (defenderVolatileStatus.protection.enabled && !movesThatBypassProtect.has(move.name)) {
        inputChannel.send(`${defender.nickname || defender.name} is protected.`)
        return;
    }

    inputChannel.send(`${attacker.nickname || attacker.name} used ${move.name} on ${defender.nickname || defender.name}.`);

    if (move.type === "fire" && defender.status === "frozen") {
        defender.status = "normal";

        inputChannel.send(`${move.name} thawed out ${defender.nickname || defender.name}.`);
    }

    if (move.category === "status") {
        if (attackerVolatileStatus.tauntLength > 0) {
            inputChannel.send(`Move failed, ${attacker.nickname || attacker.name} used a status move while taunted.`);
            return;
        }

        if (defenderVolatileStatus.magicCoat) {

        } else {
            switch (move.name) {
                case "Leech Seed":
                    if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
                        return;
                    }
                    if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                        inputChannel.send(`${move.name} missed.`);
                        return;
                    }
                    defenderVolatileStatus.leechSeed = true;
                    inputChannel.send(`${defender.nickname || defender.name} was seeded.`);

                    break;
                case "Swords Dance":
                    attackerStatStage.atk = Math.min(6, attackerStatStage.atk + 2);
                    inputChannel.send(`${attacker.nickname || attacker.name}'s attack was raised.`);
                    break;
                case "Whirlwind":
                    if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
                        return;
                    }
                    inputChannel.send("Whirlwind ended the battle.");
                    return "whirlwind";
                case "Sand Attack":
                    if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
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

                    inputChannel.send(`${defender.nickname || defender.name}'s accuracy was decreased.`)
                    defenderStatStage.accuracy = Math.max(-6, defenderStatStage.accuracy - 1);
                    break;
                case "Tail Whip":
                    if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
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

                    inputChannel.send(`${defender.nickname || defender.name}'s defense was decreased.`);
                    defenderStatStage.def = Math.max(-6, defenderStatStage.def - 1)
                    break;
                case "Leer":
                    if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
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

                    inputChannel.send(`${defender.nickname || defender.name}'s defense was decreased.`)
                    defenderStatStage.def = Math.max(-6, defenderStatStage.def - 1)
                    break;
                case "Growl":
                    if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
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

                    inputChannel.send(`${defender.nickname || defender.name}'s attack was decreased.`)
                    defenderStatStage.atk = Math.max(-6, defenderStatStage.atk - 1);
                    break;
                case "Roar":
                    if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
                        return;
                    }
                    inputChannel.send("Roar ended the battle.");
                    return "roar";
                case "Sing":
                    if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
                        return;
                    }

                    if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                        inputChannel.send(`${move.name} missed.`);
                        return;
                    }
                    if (defender.status === "normal") {
                        inputChannel.send(`${defender.nickname || defender.name} was put to sleep.`)
                        defender.status = "sleeping";
                        defenderVolatileStatus.sleepTurnLength = Math.floor(Math.random() * (4 - 1) + 1);
                    } else {
                        inputChannel.send(`${move.name} failed.`)
                    }
                    break
                case "Supersonic":
                    if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
                        return;
                    }

                    if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                        inputChannel.send(`${move.name} missed.`);
                        return;
                    }
                    if (defenderVolatileStatus.confusionLength === 0) {
                        inputChannel.send(`${defender.nickname || defender.name} is now confused.`);
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
                    inputChannel.send(`${attacker.nickname || attacker.name}'s attack and special attack was raised.`);
                    attackerStatStage.atk = Math.min(6, attackerStatStage.atk + 1);
                    attackerStatStage.spAtk = Math.min(6, attackerStatStage.spAtk + 1);
                    break;
                case "Poison Powder":
                    if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
                        return;
                    }

                    if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                        inputChannel.send(`${move.name} missed.`);
                        return;
                    }

                    if (defender.status === "normal" && !await isType(defender, "grass", defenderVolatileStatus) && !await isType(defender, "steel", defenderVolatileStatus) && !await isType(defender, "poison", defenderVolatileStatus)) {
                        inputChannel.send(`${defender.nickname || defender.name} was poisoned`)
                        defender.status = "poisoned";
                    } else {
                        inputChannel.send("move failed")
                    }
                    break;
                case "Stun Spore":
                    if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
                        return;
                    }

                    if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                        inputChannel.send(`${move.name} missed.`);
                        return;
                    }

                    if (defender.status === "normal" && !await isType(defender, "electric", defenderVolatileStatus) && !await isType(defender, "grass", defenderVolatileStatus)) {
                        inputChannel.send(`${defender.nickname || defender.name} was paralyzed.`)
                        defender.status = "paralyzed";
                    } else {
                        inputChannel.send(`${move.name} failed.`)
                    }
                    break;
                case "Sleep Powder":
                    if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
                        return;
                    }

                    if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                        inputChannel.send(`${move.name} missed.`);
                        return;
                    }
                    if (defender.status === "normal" && !await isType(defender, "grass", defenderVolatileStatus)) {
                        inputChannel.send(`${defender.nickname || defender.name} was put to sleep`)
                        defender.status = "sleeping";
                        defenderVolatileStatus.sleepTurnLength = Math.floor(Math.random() * (4 - 1) + 1);
                    } else {
                        inputChannel.send(`${move.name} failed.`)
                    }
                    break;
                case "String Shot":
                    if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
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

                    inputChannel.send(`${defender.nickname || defender.name}'s speed was decreased.`)
                    defenderStatStage.speed = Math.max(-6, defenderStatStage.speed - 2);
                    break;
                case "Thunder Wave":
                    if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
                        return;
                    }

                    if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                        inputChannel.send(`${move.name} missed.`);
                        return;
                    }
                    if (defender.status === "normal" && !await isType(defender, "electric", defenderVolatileStatus) && !await isType(defender, "ground", defenderVolatileStatus)) {
                        inputChannel.send(`${defender.nickname || defender.name} was paralyzed.`);
                        defender.status = "paralyzed";
                    } else {
                        inputChannel.send(`${move.name} failed.`)
                    }
                    break;
                case "Toxic":
                    if (!await isType(attacker, "poison", attackerVolatileStatus) && doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
                        return;
                    }

                    if (!await isType(attacker, "poison", attackerVolatileStatus) && Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                        inputChannel.send(`${move.name} missed.`);
                        return;
                    }

                    if (defender.status === "normal" && !await isType(defender, "steel", defenderVolatileStatus) && !await isType(defender, "poison", defenderVolatileStatus)) {
                        inputChannel.send(`${defender.nickname || defender.name} was badly poisoned.`)
                        defender.status = "badly poisoned";
                    } else {
                        inputChannel.send(`${move.name} failed.`)
                    }
                    break;
                case "Hypnosis":
                    if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
                        return;
                    }

                    if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                        inputChannel.send(`${move.name} missed.`);
                        return;
                    }
                    if (defender.status === "normal") {
                        inputChannel.send(`${defender.nickname || defender.name} was put to sleep.`)
                        defender.status = "sleeping";
                        defenderVolatileStatus.sleepTurnLength = Math.floor(Math.random() * (4 - 1) + 1);
                    } else {
                        inputChannel.send(`${move.name} failed.`)
                    }
                    break;
                case "Meditate":
                    attackerStatStage.atk = Math.min(6, attackerStatStage.atk + 1);
                    inputChannel.send(`${attacker.nickname || attacker.name}'s attack was raised.`);
                    break;
                case "Agility":
                    attackerStatStage.speed = Math.min(6, attackerStatStage.speed + 2);
                    inputChannel.send(`${attacker.nickname || attacker.name}'s attack was raised.`);
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
                    inputChannel.send(`${attacker.nickname || attacker.name} copied ${attackerVolatileStatus.mimicLastOpponentMove}.`);
                    let newMove = await moveListFunctions.getMove(attackerVolatileStatus.mimicLastOpponentMove);
                    return await executeMove(attacker, defender, newMove, attackerStatStage, defenderStatStage, attackerVolatileStatus, defenderVolatileStatus, totalDefenderHp, totalAttackerHp, battleDetails);
                case "Screech":
                    if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
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

                    inputChannel.send(`${defender.nickname || defender.name}'s defense was decreased.`);
                    defenderStatStage.def = Math.max(-6, defenderStatStage.def - 2);
                    break;
                case "Double Team":
                    inputChannel.send(`${attacker.nickname || attacker.name}'s evasion was increased.`);
                    attackerStatStage.evasion = Math.min(6, attackerStatStage.evasion + 1);
                    break;
                case "Recover":
                    if (attackerVolatileStatus.healBlockLength === 0) {
                        let healAmount = Math.round(totalAttackerHp / 2);
                        attacker.damageTaken -= healAmount;
                        attacker.damageTaken = Math.max(0, attacker.damageTaken);
                        inputChannel.send(`${attacker.nickname || attacker.name} was healed for ${healAmount}.`);
                    } else {
                        inputChannel.send(`${attacker.nickname || attacker.name}'s healing was blocked.`);
                    }
                    break;
                case "Harden":
                    inputChannel.send(`${attacker.nickname || attacker.name}'s defense was increased.`);
                    attackerStatStage.def = Math.min(6, attackerStatStage.def + 1);
                    break;
                case "Minimize":
                    inputChannel.send(`${attacker.nickname || attacker.name}'s evasion was increased.`);
                    attackerVolatileStatus.minimized = true;
                    attackerStatStage.evasion = Math.min(6, attackerStatStage.evasion + 2);
                    break;
                case "Smokescreen":
                    if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
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

                    inputChannel.send(`${defender.nickname || defender.name}'s accuracy was decreased.`);
                    defenderStatStage.accuracy = Math.max(-6, defenderStatStage.accuracy - 1);
                    break;
                case "Confuse Ray":
                    if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
                        return;
                    }

                    if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                        inputChannel.send(`${move.name} missed.`);
                        return;
                    }

                    if (defenderVolatileStatus.confusionLength === 0) {
                        inputChannel.send(`${defender.nickname || defender.name} is now confused.`);
                        defenderVolatileStatus.confusionLength = Math.floor(Math.random() * (4 - 1) + 1);
                    } else {
                        inputChannel.send(`${move.name} failed.`);
                    }
                    break;
                case "Withdraw":
                    inputChannel.send(`${attacker.nickname || attacker.name}'s defense was increased.`);
                    attackerStatStage.def = Math.min(6, attackerStatStage.def + 1);
                    break;
                case "Defense Curl":
                    inputChannel.send(`${attacker.nickname || attacker.name}'s defense was increased.`);
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
                    inputChannel.send(`${attacker.nickname || attacker.name}'s crit was increased.`);
                    break;
                case "Amnesia":
                    attackerStatStage.spDef = Math.min(6, attackerStatStage.spDef + 2);
                    inputChannel.send(`${attacker.nickname || attacker.name}'s defense was increased.`);
                    break;
                case "Kinesis":
                    if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
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

                    inputChannel.send(`${defender.nickname || defender.name}'s accuracy was decreased.`);
                    defenderStatStage.accuracy = Math.max(-6, defenderStatStage.accuracy - 1);
                    break;
                case "Soft-Boiled":
                    if (attackerVolatileStatus.healBlockLength === 0) {
                        let healAmount = Math.round(totalAttackerHp / 2);
                        attacker.damageTaken -= healAmount;
                        attacker.damageTaken = Math.max(0, attacker.damageTaken);
                        inputChannel.send(`${attacker.nickname || attacker.name} was healed for ${healAmount}.`);
                    } else {
                        inputChannel.send(`${attacker.nickname || attacker.name}'s healing was blocked.`);
                    }
                    break;
                case "Glare":
                    if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
                        return;
                    }

                    if (!defenderVolatileStatus.minimized && Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                        inputChannel.send(`${move.name} missed.`);
                        return;
                    }

                    let glareEffectChance = Math.floor(Math.random() * 100);
                    if (glareEffectChance < move.effect_chance && defender.status === "normal" && !await isType(defender, "electric", defenderVolatileStatus) && !await isType(defender, "ghost", defenderVolatileStatus)) {
                        inputChannel.send(`${defender.nickname || defender.name} was paralyzed.`);
                        defender.status = "paralyzed";
                    }
                    break;
                case "Poison Gas":
                    if (!await isType(attacker, "poison", attackerVolatileStatus) && doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
                        return;
                    }

                    if (!await isType(attacker, "poison", attackerVolatileStatus) && Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                        inputChannel.send(`${move.name} missed.`);
                        return;
                    }

                    if (defender.status === "normal" && !await isType(defender, "poison", defenderVolatileStatus)) {
                        inputChannel.send(`${defender.nickname || defender.name} was poisoned.`)
                        defender.status = "poisoned";
                    } else {
                        inputChannel.send(`${move.name} failed.`)
                    }
                    break;
                case "Lovely Kiss":
                    if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
                        return;
                    }

                    if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                        inputChannel.send(`${move.name} missed.`);
                        return;
                    }
                    if (defender.status === "normal") {
                        inputChannel.send(`${defender.nickname || defender.name} was put to sleep.`)
                        defender.status = "sleeping";
                        defenderVolatileStatus.sleepTurnLength = Math.floor(Math.random() * (4 - 1) + 1);
                    } else {
                        inputChannel.send(`${move.name} failed.`)
                    }
                    break;
                case "Spore":
                    if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
                        return;
                    }

                    if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                        inputChannel.send(`${move.name} missed.`);
                        return;
                    }
                    if (defender.status === "normal") {
                        inputChannel.send(`${defender.nickname || defender.name} was put to sleep.`)
                        defender.status = "sleeping";
                        defenderVolatileStatus.sleepTurnLength = Math.floor(Math.random() * (4 - 1) + 1);
                    } else {
                        inputChannel.send(`${move.name} failed.`)
                    }
                    break;
                case "Transform":
                    if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
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
                        name: attacker.nickname || attacker.name,
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
                    inputChannel.send(`${attacker.nickname || attacker.name}'s defense was raised.`);
                    attackerStatStage.def = Math.min(6, attackerStatStage.def + 2);
                    break;
                case "Rest":
                    if (attacker.status === "sleeping") {
                        inputChannel.send(`${move.name} failed.`)
                        return;
                    }
                    if (attackerVolatileStatus.bound.length > 0 && attackerVolatileStatus.bound.name === "Uproar")
                        attacker.status = "sleeping";
                    inputChannel.send(`${attacker.nickname || attacker.name} fell asleep.`);
                    attacker.damageTaken = 0;
                    break;
                case "Conversion":
                    inputChannel.send(`${attacker.nickname || attacker.name}'s type is converted.`);
                    attackerVolatileStatus.conversion = true;
                    break;
                case "Spider Web":
                    if (await isType(defender, "ghost", defenderVolatileStatus)) {
                        inputChannel.send(`${move.name} failed.`)
                        return;
                    }
                    defenderVolatileStatus.escapePrevention.enabled = true;
                    inputChannel.send(`${defender.nickname || defender.name} is prevented from escaping.`);
                    break;
                case "Mind Reader":
                    attackerVolatileStatus.takingAim = 2;
                    inputChannel.send(`${attacker.nickname || attacker.name} won't miss on it's next turn.`);
                    break;
                case "Curse":
                    if (await isType(attacker, "ghost", attackerVolatileStatus)) {
                        attacker.damageTaken += Math.round(totalAttackerHp / 2);
                        attacker.damageTaken = Math.min(attacker.damageTaken, totalAttackerHp);
                        inputChannel.send(`${defender.nickname || defender.name} is cursed and ${attacker.nickname || attacker.name} lost half of it's maximum hp.`);


                        defenderVolatileStatus.cursed = true;
                    } else {
                        inputChannel.send(`${attacker.nickname || attacker.name}'s attack and defense was raised.`);

                        attackerStatStage.atk = Math.min(6, attackerStatStage.atk + 1);
                        attackerStatStage.def = Math.min(6, attackerStatStage.def + 1);

                        attackerStatStage.speed = Math.max(-6, defenderStatStage.speed - 1)
                    }
                    break;
                case "Cotton Spore":
                    if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
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

                    inputChannel.send(`${defender.nickname || defender.name}'s speed was decreased.`);
                    defenderStatStage.speed = Math.max(-6, defenderStatStage.speed - 2);
                    break;

                case "Spite":
                    if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
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

                    inputChannel.send(`${defender.nickname || defender.name}'s ${spiteMove[0].name} pp was decreased by 2.`);
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
                        inputChannel.send(`${defender.nickname || defender.name} protected themselves.`);
                        attackerVolatileStatus.protection.enabled = true;
                    } else {
                        inputChannel.send(`${move.name} failed.`);
                    }
                    break;
                case "Scary Face":
                    if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
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

                    inputChannel.send(`${defender.nickname || defender.name}'s speed was decreased.`);
                    defenderStatStage.speed = Math.max(-6, defenderStatStage.speed - 2)
                    break;
                case "Sweet Kiss":
                    if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
                        return;
                    }

                    if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                        inputChannel.send(`${move.name} missed.`);
                        return;
                    }

                    if (defenderVolatileStatus.confusionLength === 0) {
                        inputChannel.send(`${defender.nickname || defender.name} is now confused.`);
                        defenderVolatileStatus.confusionLength = Math.floor(Math.random() * (4 - 1) + 1);
                    } else {
                        inputChannel.send(`${move.name} failed.`);
                    }
                    break;
                case "Belly Drum":
                    if (attacker.damageTaken >= Math.floor(totalAttackerHp / 2)) {
                        inputChannel.send(`${move.name} failed, HP is too low.`);
                    } else {
                        inputChannel.send(`${attacker.nickname || attacker.name}'s attack was increased.`);
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
                        inputChannel.send(`${attacker.nickname || attacker.name} bonded with ${defender.nickname || defender.name}.`);
                        attackerVolatileStatus.destinyBond = battleDetails.userOneCurrentPokemon;
                    }
                    break;
                case "Perish Song":
                    if (defenderVolatileStatus.perishSongLength > 0) {
                        inputChannel.send(`${move.name} was used on ${defender.nickname || defender.name} already.`)
                    }
                    inputChannel.send(`${defender.nickname || defender.name} has 4 turns remaining before it feints.`);
                    defenderVolatileStatus.perishSongLength = 4;
                    break;
                case "Detect":
                    let detectChance = Math.floor(Math.random() * 100);
                    if (attackerVolatileStatus.previousMove === "Protect" || attackerVolatileStatus.previousMove === "Detect") {
                        if (attackerVolatileStatus.protection.length === 1)
                            attackerVolatileStatus.protection.length = 3;
                        else
                            attackerVolatileStatus.protection.length += 3;
                    } else {
                        attackerVolatileStatus.protection.length = 1;
                    }

                    let detectRate = ((1 / attackerVolatileStatus.protection.length) * 100);

                    if (detectChance < detectRate) {
                        inputChannel.send(`${defender.nickname || defender.name} protected themselves.`);
                        attackerVolatileStatus.protection.enabled = true;
                    } else {
                        inputChannel.send(`${move.name} failed.`);
                    }
                    break;
                case "Lock-On":
                    attackerVolatileStatus.takingAim = 2;
                    inputChannel.send(`${attacker.nickname || attacker.name} won't miss on it's next turn.`);
                    break;
                default:
                    inputChannel.send(`${move.name} is not programmed.`);
                    break;
            }
        }
    } else {
        switch (move.name) {
            case "Double Slap":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
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

                    inputChannel.send(`${move.name} did ${doubleSlapDamage} damage.`);
                }

                inputChannel.send(`${move.name} was used ${slapCount} times.`)
                break;
            case "Comet Punch":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
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

                    inputChannel.send(`${move.name} did ${cometDamage} damage.`);
                }

                inputChannel.send(`${move.name} was used ${cometCount} times.`);
                break;
            case "Pay Day":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
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

                    inputChannel.send(`Gained ${attacker.level * 2} coins.`);
                }

                inputChannel.send(`${move.name} did ${payDayDamage} damage.`);
                break;
            case "Fire Punch":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                let firePunchDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                defender.damageTaken += firePunchDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                let firePunchEffectChance = Math.floor(Math.random() * 100);
                if (firePunchEffectChance < move.effect_chance && defender.status === "normal" && !await isType(defender, "fire", defenderVolatileStatus)) {
                    inputChannel.send(`${defender.nickname || defender.name} was burned.`);
                    defender.status = "burned";
                }

                inputChannel.send(`${move.name} did ${firePunchDamage} damage.`);
                break;
            case "Ice Punch":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                let icePunchDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                defender.damageTaken += icePunchDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                let icePunchEffectChance = Math.floor(Math.random() * 100);
                if (icePunchEffectChance < move.effect_chance && defender.status === "normal" && !await isType(defender, "ice", defenderVolatileStatus)) {
                    inputChannel.send(`${defender.nickname || defender.name} was frozen.`);
                    defender.status = "frozen";
                }

                inputChannel.send(`${move.name} did ${icePunchDamage} damage.`);
                break;
            case "Thunder Punch":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                let thunderPunchDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                defender.damageTaken += thunderPunchDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                let thunderPunchEffectChance = Math.floor(Math.random() * 100);
                if (thunderPunchEffectChance < move.effect_chance && defender.status === "normal" && !await isType(defender, "electric", defenderVolatileStatus)) {
                    inputChannel.send(`${defender.nickname || defender.name} was paralyzed.`);
                    defender.status = "paralyzed";
                }

                inputChannel.send(`${move.name} did ${thunderPunchDamage} damage.`);
                break;
            case "Guillotine":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                if (defender.level > attacker.level) {
                    inputChannel.send(`${move.name} failed.`);
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
                inputChannel.send(`One-Hit KO!`);
                break;
            case "Razor Wind":
                if (attackerVolatileStatus.chargingMove.chargingLength === 0) {
                    attackerVolatileStatus.chargingMove.chargingLength = 2;
                    attackerVolatileStatus.chargingMove.name = "Razor Wind";
                    inputChannel.send(`${attacker.nickname || attacker.name} made a whirlwind.`);
                } else {
                    if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
                        return;
                    }

                    if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                        inputChannel.send(`${move.name} missed.`);
                        return;
                    }
                    let razorDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                    defender.damageTaken += razorDamage;
                    defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp)

                    inputChannel.send(`${move.name} did ${razorDamage} damage.`);
                }
                break;
            case "Fly":
                if (attackerVolatileStatus.chargingMove.chargingLength === 0) {
                    attackerVolatileStatus.chargingMove.chargingLength = 2;
                    attackerVolatileStatus.chargingMove.name = "Fly";
                    attackerVolatileStatus.semiInvulnerable = true;
                    inputChannel.send(`${attacker.nickname || attacker.name} flew in the air.`);
                } else {
                    if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
                        return;
                    }

                    if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                        inputChannel.send(`${move.name} missed.`);
                        return;
                    }
                    let flyDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                    defender.damageTaken += flyDamage;
                    defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp)

                    inputChannel.send(`${move.name} did ${flyDamage} damage.`);
                }
                break;
            case "Bind":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }

                if (defenderVolatileStatus.bound.length === 0) {
                    if (Math.floor(Math.random() * 2) === 0) {
                        inputChannel.send(`${defender.nickname || defender.name} is bounded for 4 turns.`);
                        defenderVolatileStatus.bound.length = 4;
                    } else {
                        inputChannel.send(`${defender.nickname || defender.name} is bounded for 5 turns.`);
                        defenderVolatileStatus.bound.length = 5;
                    }
                    defenderVolatileStatus.bound.name = "Bind";
                } else {
                    inputChannel.send(`${move.name} failed.`);
                }
                let bindDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                defender.damageTaken += bindDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                inputChannel.send(`${move.name} did ${bindDamage} damage.`);
                break;
            case "Stomp":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
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
                inputChannel.send(`${move.name} did ${stompDamage} damage.`);

                if (stompEffectChance < move.effect_chance) {
                    defenderVolatileStatus.flinch = true;
                    inputChannel.send(`${defender.nickname || defender.name} flinched.`);
                }
                break;
            case "Double Kick":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
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
                    inputChannel.send(`${move.name} did ${doubleKickDamage} damage.`);
                }
                break;
            case "Jump Kick":
                let crashDamage = Math.round(totalDefenderHp / 2);
                if (defenderVolatileStatus.protection.enabled) {
                    defender.damageTaken += crashDamage;
                    defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);
                    inputChannel.send(`${defender.nickname || defender.name} was protected so ${attacker.nickname || attacker.name} took crash damage.`);
                    return;
                }
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    defender.damageTaken += crashDamage;
                    defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);
                    inputChannel.send(`${defender.nickname || defender.name} was invulnerable so ${attacker.nickname || attacker.name} took crash damage.`);
                    return;
                }
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    defender.damageTaken += crashDamage;
                    defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);
                    inputChannel.send(`${move.name} missed so ${attacker.nickname || attacker.name} took crash damage.`);
                    return;
                }

                if (await isType(defender, "ghost", defenderVolatileStatus)) {
                    defender.damageTaken += crashDamage;
                    defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);
                    inputChannel.send(`${move.name} missed so ${attacker.nickname || attacker.name} took crash damage.`);
                    return;
                }

                let jumpKickDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                defender.damageTaken += jumpKickDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);
                inputChannel.send(`${move.name} did ${jumpKickDamage} damage.`);
                break;
            case "Rolling Kick":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
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
                inputChannel.send(`${move.name} did ${rollingKickDamage} damage.`);

                if (rollingKickEffectChance < move.effect_chance) {
                    defenderVolatileStatus.flinch = true;
                    inputChannel.send(`${defender.nickname || defender.name} flinched.`);
                }
                break;
            case "Headbutt":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }

                let headbuttDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)
                defender.damageTaken += headbuttDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                inputChannel.send(`${move.name} did ${headbuttDamage} damage.`);

                let headbuttEffectChance = Math.floor(Math.random() * 100);
                if (headbuttEffectChance < move.effect_chance) {
                    defenderVolatileStatus.flinch = true;
                    inputChannel.send(`${defender.nickname || defender.name} flinched.`);
                }
                break;
            case "Fury Attack":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
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

                    inputChannel.send(`${move.name} did ${damage} damage.`);
                }

                inputChannel.send(`${move.name} was used ${furyAttackCount} times.`);
                break;
            case "Horn Drill":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                if (defender.level > attacker.level) {
                    inputChannel.send(`${move.name} failed.`);
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
                inputChannel.send(`One-Hit KO!`);
                break;
            case "Body Slam":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
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
                    inputChannel.send(`${defender.nickname || defender.name} was paralyzed.`);
                    defender.status = "paralyzed";
                }
                inputChannel.send(`${move.name} did ${bodySlamDamage} damage.`);
                break;
            case "Wrap":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }

                if (defenderVolatileStatus.bound.length === 0) {
                    if (Math.floor(Math.random() * 2) === 0) {
                        inputChannel.send(`${defender.nickname || defender.name} is bounded for 4 turns.`);
                        defenderVolatileStatus.bound.length = 4;
                    } else {
                        inputChannel.send(`${defender.nickname || defender.name} is bounded for 5 turns.`);
                        defenderVolatileStatus.bound.length = 5;
                    }
                    defenderVolatileStatus.bound.name = "Wrap";
                } else {
                    inputChannel.send(`${move.name} failed.`);
                }
                let wrapDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                defender.damageTaken += wrapDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                inputChannel.send(`${move.name} did ${wrapDamage} damage.`);
                break;
            case "Take Down":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                let takeDownDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)
                defender.damageTaken += takeDownDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                inputChannel.send(`${move.name} did ${takeDownDamage} damage.`);

                attacker.damageTaken += Math.round(takeDownDamage / 4);
                attacker.damageTaken = Math.min(attacker.damageTaken, totalAttackerHp);

                inputChannel.send(`${attacker.nickname || attacker.name} got hit with recoil.`);
                break;
            case "Thrash":
                if (attackerVolatileStatus.thrashing.length === 0) {
                    attackerVolatileStatus.thrashing.length = (Math.floor(Math.random() * 2) === 0) ? 3 : 4;
                    attackerVolatileStatus.thrashing.name = "Thrash";
                    inputChannel.send(`${attacker.nickname || attacker.name} is thrashing about.`);
                }
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                let thrashDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)
                defender.damageTaken += thrashDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);
                inputChannel.send(`${move.name} did ${thrashDamage} damage.`);

                attackerVolatileStatus.thrashing.length--;
                if (attackerVolatileStatus.thrashing.length === 0) {
                    if (attackerVolatileStatus.confusionLength === 0) {
                        attackerVolatileStatus.confusionLength = Math.floor(Math.random() * 4 + 1);
                        inputChannel.send(`${attacker.nickname || attacker.name}'s thrashing ended.`);
                    }
                }
                break;
            case "Double-Edge":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                let doubleEdgeDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)
                defender.damageTaken += doubleEdgeDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);
                inputChannel.send(`${move.name} did ${doubleEdgeDamage} damage.`);

                attacker.damageTaken += Math.round(doubleEdgeDamage / 3);
                attacker.damageTaken = Math.min(attacker.damageTaken, totalAttackerHp);
                inputChannel.send(`${attacker.nickname || attacker.name} got hit with recoil.`);

                break;
            case "Poison Sting":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                let poisonStingDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                defender.damageTaken += poisonStingDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                let poisonStingEffectChance = Math.floor(Math.random() * 100);
                if (poisonStingEffectChance < move.effect_chance && defender.status === "normal" && !await isType(defender, "steel", defenderVolatileStatus) && !await isType(defender, "poison", defenderVolatileStatus)) {
                    inputChannel.send(`${defender.nickname || defender.name} was poisoned.`);
                    defender.status = "poisoned";
                }

                inputChannel.send(`${move.name} did ${poisonStingDamage} damage.`);
                break;
            case "Twineedle":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
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

                    inputChannel.send(`${move.name} did ${twineedleDamage} damage.`);

                    let twineedleEffectChance = Math.floor(Math.random() * 100);
                    if (twineedleEffectChance < move.effect_chance && defender.status === "normal" && !await isType(defender, "steel", defenderVolatileStatus) && !await isType(defender, "poison", defenderVolatileStatus)) {
                        inputChannel.send(`${defender.nickname || defender.name} was poisoned.`);
                        defender.status = "poisoned";
                    }
                }
                break;
            case "Pin Missile":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
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

                    inputChannel.send(`${move.name} did ${damage} damage.`);
                }

                inputChannel.send(`${move.name} was used ${pinMissileCount} times.`);
                break;
            case "Bite":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }

                let biteDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)
                defender.damageTaken += biteDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                inputChannel.send(`${move.name} did ${biteDamage} damage.`);

                let biteEffectChance = Math.floor(Math.random() * 100);
                if (biteEffectChance < move.effect_chance) {
                    defenderVolatileStatus.flinch = true;
                    inputChannel.send(`${defender.nickname || defender.name} flinched.`);
                }
                break;
            case "Sonic Boom":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                defender.damageTaken += 20;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                inputChannel.send(`${move.name} did 20 damage.`);
                break;
            case "Acid":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                let acidDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)
                defender.damageTaken += acidDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                inputChannel.send(`${move.name} did ${acidDamage} damage.`);

                let acidChance = Math.floor(Math.random() * 100);
                if (acidChance < move.effect_chance && defenderVolatileStatus.mistLength === 0) {
                    defenderStatStage.spDef = Math.max(-6, defenderStatStage.spDef - 1)
                    inputChannel.send(`${defender.nickname || defender.name}'s special defense was decreased.`);
                }
                break;
            case "Ember":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
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
                    inputChannel.send(`${defender.nickname || defender.name} was burned.`);
                    defender.status = "burned";
                }

                inputChannel.send(`${move.name} did ${emberDamage} damage.`);
                break;
            case "Flamethrower":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
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
                    inputChannel.send(`${defender.nickname || defender.name} was burned.`);
                    defender.status = "burned";
                }

                inputChannel.send(`${move.name} did ${flamethrowerDamage} damage.`);
                break;
            case "Ice Beam":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
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
                    inputChannel.send(`${defender.nickname || defender.name} was frozen.`);
                    defender.status = "frozen";
                }

                inputChannel.send(`${move.name} did ${iceBeamDamage} damage.`);
                break;
            case "Blizzard":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
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
                    inputChannel.send(`${defender.nickname || defender.name} was frozen.`);
                    defender.status = "frozen";
                }

                inputChannel.send(`${move.name} did ${blizzardDamage} damage.`);
                break;
            case "Psybeam":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
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
                        inputChannel.send(`${defender.nickname || defender.name} is now confused.`);
                        defenderVolatileStatus.confusionLength = Math.floor(Math.random() * (4 - 1) + 1);
                    }
                }

                inputChannel.send(`${move.name} did ${psybeamDamage} damage.`);
                break;
            case "Bubble Beam":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
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
                    inputChannel.send(`${defender.nickname || defender.name}'s speed was decreased.`);
                    defenderStatStage.speed = Math.max(-6, defenderStatStage.speed - 1)
                }

                inputChannel.send(`${move.name} did ${bubbleBeamDamage} damage.`);
                break;
            case "Aurora Beam":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
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
                    inputChannel.send(`${defender.nickname || defender.name}'s attack was decreased.`);
                    defenderStatStage.atk = Math.max(-6, defenderStatStage.atk - 1)
                }

                inputChannel.send(`${move.name} did ${auroraBeamDamage} damage.`);
                break;
            case "Hyper Beam":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                let hyperBeamDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)
                defender.damageTaken += hyperBeamDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);
                inputChannel.send(`${move.name} did ${hyperBeamDamage} damage.`);

                attackerVolatileStatus.recharging.name = move.name;
                attackerVolatileStatus.recharging.enabled = true;
                break;
            case "Submission":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                let submissionDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)
                defender.damageTaken += submissionDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);
                inputChannel.send(`${move.name} did ${submissionDamage} damage.`);

                attacker.damageTaken += Math.round(submissionDamage / 4);
                attacker.damageTaken = Math.min(attacker.damageTaken, totalAttackerHp);
                inputChannel.send(`${attacker.nickname || attacker.name} got hit with recoil.`);
                break;
            case "Low Kick":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }

                let lowKickDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)
                defender.damageTaken += lowKickDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                inputChannel.send(`${move.name} did ${lowKickDamage} damage.`);

                let lowKickEffectChance = Math.floor(Math.random() * 100);
                if (lowKickEffectChance < move.effect_chance) {
                    defenderVolatileStatus.flinch = true;
                    inputChannel.send(`${defender.nickname || defender.name} flinched.`);
                }
                break;
            case "Counter":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
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

                inputChannel.send(`${move.name} did ${attackerVolatileStatus.counter} damage.`);
                break;
            case "Seismic Toss":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
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

                inputChannel.send(`${move.name} did ${seismicTossDamage} damage.`);
                break;
            case "Absorb":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
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
                    inputChannel.send(`${attacker.nickname || attacker.name} was healed for ${healAmount}.`);
                } else {
                    inputChannel.send(`${attacker.nickname || attacker.name}'s healing was blocked.`);
                }
                inputChannel.send(`${move.name} did ${absorbDamage} damage.`);
                break;
            case "Mega Drain":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
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
                    megaDrainDamage = totalDefenderHp - defender.damageTaken;
                }

                defender.damageTaken += megaDrainDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);


                if (attackerVolatileStatus.healBlockLength === 0) {
                    let healAmount = Math.round(megaDrainDamage / 2);
                    attacker.damageTaken -= healAmount;
                    attacker.damageTaken = Math.max(0, attacker.damageTaken);
                    inputChannel.send(`${attacker.nickname || attacker.name} was healed for ${healAmount}.`);
                } else {
                    inputChannel.send(`${attacker.nickname || attacker.name}'s healing was blocked.`);
                }
                inputChannel.send(`${move.name} did ${megaDrainDamage} damage.`);
                break;
            case "Solar Beam":
                if (attackerVolatileStatus.chargingMove.chargingLength === 0) {
                    attackerVolatileStatus.chargingMove.chargingLength = 2;
                    attackerVolatileStatus.chargingMove.name = "Solar Beam";
                    inputChannel.send(`${attacker.nickname || attacker.name} starts charging.`);
                } else {
                    if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
                        return;
                    }

                    if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                        inputChannel.send(`${move.name} missed.`);
                        return;
                    }
                    let solarBeamDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                    defender.damageTaken += solarBeamDamage;
                    defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp)

                    inputChannel.send(`${move.name} did ${solarBeamDamage} damage.`);
                }
                break;
            case "Petal Dance":
                if (attackerVolatileStatus.thrashing.length === 0) {
                    attackerVolatileStatus.thrashing.length = (Math.floor(Math.random() * 2) === 0) ? 3 : 4;
                    attackerVolatileStatus.thrashing.name = "Petal Dance";
                    inputChannel.send(`${attacker.nickname || attacker.name} is thrashing about.`);
                }
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                let petalDanceDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)
                defender.damageTaken += petalDanceDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);
                inputChannel.send(`${move.name} did ${petalDanceDamage} damage.`);

                attackerVolatileStatus.thrashing.length--;
                if (attackerVolatileStatus.thrashing.length === 0) {
                    attackerVolatileStatus.confusionLength = Math.floor(Math.random() * 4 + 1);
                    inputChannel.send(`Thrashing has ended and left ${attacker.nickname || attacker.name} confused.`);
                }
                break;
            case "Dragon Rage":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                let dragonRageDamage = 40;
                defender.damageTaken += dragonRageDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                inputChannel.send(`${move.name} did ${dragonRageDamage} damage.`);
                break;
            case "Fire Spin":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }

                if (defenderVolatileStatus.bound.length === 0) {
                    if (Math.floor(Math.random() * 2) === 0) {
                        inputChannel.send(`${defender.nickname || defender.name} is bounded for 4 turns.`);
                        defenderVolatileStatus.bound.length = 4;
                    } else {
                        inputChannel.send(`${defender.nickname || defender.name} is bounded for 5 turns.`);
                        defenderVolatileStatus.bound.length = 5;
                    }
                    defenderVolatileStatus.bound.name = "Fire Spin";
                } else {
                    inputChannel.send(`${move.name} failed.`);
                }
                let fireSpinDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                defender.damageTaken += fireSpinDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                inputChannel.send(`${move.name} did ${fireSpinDamage} damage.`);
                break;
            case "Thunder Shock":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
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
                    inputChannel.send(`${defender.nickname || defender.name} was paralyzed.`);
                    defender.status = "paralyzed";
                }

                inputChannel.send(`${move.name} did ${thunderShockDamage} damage.`);
                break;
            case "Thunderbolt":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
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
                    inputChannel.send(`${defender.nickname || defender.name} was paralyzed.`);
                    defender.status = "paralyzed";
                }

                inputChannel.send(`${move.name} did ${thunderboltDamage} damage.`);
                break;
            case "Thunder":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
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
                    inputChannel.send(`${defender.nickname || defender.name} was paralyzed.`);
                    defender.status = "paralyzed";
                }

                inputChannel.send(`${move.name} did ${thunderDamage} damage.`);
                break;
            case "Fissure":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                if (defender.level > attacker.level) {
                    inputChannel.send(`${move.name} failed.`);
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
                inputChannel.send(`One-Hit KO!`);
                break;
            case "Dig":
                if (attackerVolatileStatus.chargingMove.chargingLength === 0) {
                    attackerVolatileStatus.chargingMove.chargingLength = 2;
                    attackerVolatileStatus.chargingMove.name = "Dig";
                    attackerVolatileStatus.semiInvulnerable = true;
                    inputChannel.send(`${attacker.nickname || attacker.name} dug into the ground.`);
                } else {
                    if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
                        return;
                    }

                    if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                        inputChannel.send(`${move.name} missed.`);
                        return;
                    }
                    let digDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                    defender.damageTaken += digDamage;
                    defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp)

                    inputChannel.send(`${move.name} did ${digDamage} damage.`);
                }
                break;
            case "Confusion":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
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
                        inputChannel.send(`${defender.nickname || defender.name} is now confused.`);
                        defenderVolatileStatus.confusionLength = Math.floor(Math.random() * (4 - 1) + 1);
                    }
                }

                inputChannel.send(`${move.name} did ${confusionDamage} damage.`);
                break;
            case "Psychic":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
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
                    inputChannel.send(`${defender.nickname || defender.name}'s special defense was decreased.`);

                    defenderStatStage.spDef = Math.max(-6, defenderStatStage.spDef - 1)
                }

                inputChannel.send(`${move.name} did ${psychicDamage} damage.`);
                break;
            case "Night Shade":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
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
                inputChannel.send(`${move.name} did ${nightShadeDamage} damage.`);
                break;
            case "Self-Destruct":
                attacker.damageTaken += totalAttackerHp;

                inputChannel.send(`${attacker.nickname || attacker.name} self-destructed.`);

                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                let selfDestructDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)
                defender.damageTaken += selfDestructDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                inputChannel.send(`${move.name} did ${selfDestructDamage} damage.`);
                break;
            case "Lick":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
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
                    inputChannel.send(`${defender.nickname || defender.name} was paralyzed.`);
                    defender.status = "paralyzed";
                }

                inputChannel.send(`${move.name} did ${lickDamage} damage.`);
                break;
            case "Smog":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
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
                    inputChannel.send(`${defender.nickname || defender.name} was poisoned.`);
                    defender.status = "poisoned";
                }

                inputChannel.send(`${move.name} did ${smogDamage} damage.`);
                break;
            case "Sludge":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
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
                    inputChannel.send(`${defender.nickname || defender.name} was poisoned.`);
                    defender.status = "poisoned";
                }

                inputChannel.send(`${move.name} did ${sludgeDamage} damage.`);
                break;
            case "Fire Blast":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
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
                    inputChannel.send(`${defender.nickname || defender.name} was burned.`);
                    defender.status = "burned";
                }

                inputChannel.send(`${move.name} did ${fireBlastDamage} damage.`);
                break;
            case "Waterfall":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
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
                    inputChannel.send(`${defender.nickname || defender.name} flinched.`);
                }

                inputChannel.send(`${move.name} did ${waterfallDamage} damage.`);
                break;
            case "Swift":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                let swiftDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)
                defender.damageTaken += swiftDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                inputChannel.send(`${move.name} did ${swiftDamage} damage.`);
                break;
            case "Skull Bash":
                if (attackerVolatileStatus.chargingMove.chargingLength === 0) {
                    attackerVolatileStatus.chargingMove.chargingLength = 2;
                    attackerVolatileStatus.chargingMove.name = "Skull Bash";

                    inputChannel.send(`${attacker.nickname || attacker.name} tucks it's head in getting ready to charge.`);
                    attackerStatStage.def = Math.min(6, attackerStatStage.def + 1);

                    inputChannel.send(`${attacker.nickname || attacker.name}'s defense was increased.`);
                } else {
                    if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
                        return;
                    }

                    if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                        inputChannel.send(`${move.name} missed.`);
                        return;
                    }
                    let skullBashDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                    defender.damageTaken += skullBashDamage;
                    defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp)

                    inputChannel.send(`${move.name} did ${skullBashDamage} damage.`);
                }
                break;
            case "High Jump Kick":
                let highJumpKickCrashDamage = Math.round(totalDefenderHp / 2);
                if (defenderVolatileStatus.protection.enabled) {
                    defender.damageTaken += highJumpKickCrashDamage;
                    defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);
                    inputChannel.send(`${defender.nickname || defender.name} was protected so ${attacker.nickname || attacker.name} took crash damage.`);
                    return;
                }
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    defender.damageTaken += highJumpKickCrashDamage;
                    defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);
                    inputChannel.send(`${defender.nickname || defender.name} was invulnerable so ${attacker.nickname || attacker.name} took crash damage.`);
                    return;
                }
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    defender.damageTaken += highJumpKickCrashDamage;
                    defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);
                    inputChannel.send(`${move.name} missed so ${attacker.nickname || attacker.name} took crash damage.`);
                    return;
                }
                if (await isType(defender, "ghost", defenderVolatileStatus)) {
                    defender.damageTaken += highJumpKickCrashDamage;
                    defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);
                    inputChannel.send(`${move.name} missed so ${attacker.nickname || attacker.name} took crash damage.`);
                    return;
                }

                let highJumpKickDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)
                defender.damageTaken += highJumpKickDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                inputChannel.send(`${move.name} did ${highJumpKickDamage} damage.`);
                break;
            case "Dream Eater":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                if (defender.status !== "sleeping") {
                    inputChannel.send(`${move.name} failed.`);
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
                    inputChannel.send(`${attacker.nickname || attacker.name} was healed for ${healAmount}.`);
                } else {
                    inputChannel.send(`${attacker.nickname || attacker.name}'s healing was blocked.`);
                }

                inputChannel.send(`${move.name} did ${dreamEaterDamage} damage.`);
                break;
            case "Leech Life":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
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
                    inputChannel.send(`${attacker.nickname || attacker.name} was healed for ${healAmount}.`);
                } else {
                    inputChannel.send(`${attacker.nickname || attacker.name}'s healing was blocked.`);
                }

                inputChannel.send(`${move.name} did ${leechLifeDamage} damage.`);
                break;
            case "Sky Attack":
                if (attackerVolatileStatus.chargingMove.chargingLength === 0) {
                    attackerVolatileStatus.chargingMove.chargingLength = 2;
                    attackerVolatileStatus.chargingMove.name = "Sky Attack";

                    inputChannel.send(`${attacker.nickname || attacker.name} starts glowing.`);
                } else {
                    if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                        inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
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
                        inputChannel.send(`${defender.nickname || defender.name} flinched.`);
                    }
                    inputChannel.send(`${move.name} did ${skyAttackDamage} damage.`);
                }
                break;
            case "Bubble":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
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
                    inputChannel.send(`${defender.nickname || defender.name}'s speed was decreased.`);
                    defenderStatStage.speed = Math.max(-6, defenderStatStage.speed - 1)
                }

                inputChannel.send(`${move.name} did ${bubbleDamage} damage.`);
                break;
            case "Splash":
                inputChannel.send(`${move.name} had no effect.`);
                break;
            case "Explosion":
                attacker.damageTaken += totalAttackerHp;
                inputChannel.send(`${attacker.nickname || attacker.name} exploded.`);

                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                let explosionDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                defender.damageTaken += explosionDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                inputChannel.send(`${move.name} did ${explosionDamage} damage.`);
                break;
            case "Fury Swipes":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
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

                    inputChannel.send(`${move.name} did ${damage} damage.`);
                }

                inputChannel.send(`${move.name} was used ${furySwipesCount} times.`);
                break;
            case "Bonemerang":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
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

                    inputChannel.send(`${move.name} did ${damage} damage.`);
                }
                inputChannel.send(`${move.name} was used twice.`);
                break;
            case "Rock Slide":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
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
                    inputChannel.send(`${defender.nickname || defender.name} flinched.`);
                }

                inputChannel.send(`${move.name} did ${rockSlideDamage} damage.`);
                break;
            case "Tri Attack":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
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
                            inputChannel.send(`${defender.nickname || defender.name} was frozen.`);
                            defender.status = "frozen";
                        }
                    } else if (randomStatus === 1) {
                        if (defender.status === "normal" && !await isType(defender, "fire", defenderVolatileStatus)) {
                            inputChannel.send(`${defender.nickname || defender.name} was burned.`);
                            defender.status = "burned";
                        }
                    } else {
                        if (defender.status === "normal" && !await isType(defender, "electric", defenderVolatileStatus) && !await isType(defender, "normal", defenderVolatileStatus)) {
                            inputChannel.send(`${defender.nickname || defender.name} was paralyzed.`);
                            defender.status = "paralyzed";
                        }
                    }
                }

                inputChannel.send(`${move.name} did ${triAttackDamage} damage.`);
                break;
            case "Super Fang":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
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

                inputChannel.send(`${move.name} did ${superFangDamage} damage.`);
                break;
            case "Struggle":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                let struggleDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)
                defender.damageTaken += struggleDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);
                inputChannel.send(`${move.name} did ${struggleDamage} damage.`);

                attacker.damageTaken += Math.round(struggleDamage / 2);
                attacker.damageTaken = Math.min(attacker.damageTaken, totalAttackerHp);
                inputChannel.send(`${attacker.nickname || attacker.name} got hit with recoil.`);
                break;
            case "Triple Kick":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
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

                    inputChannel.send(`${move.name} did ${tripleKickDamage * i} damage.`);
                }
                break;
            case "Flame Wheel":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
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
                    inputChannel.send(`${defender.nickname || defender.name} was burned.`);
                    defender.status = "burned";
                }

                inputChannel.send(`${move.name} did ${flameWheelDamage} damage.`);
                break;
            case "Snore":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
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
                    inputChannel.send(`${defender.nickname || defender.name} flinched.`);
                }

                inputChannel.send(`${move.name} did ${snoreDamage} damage.`);
                break;
            case "Powder Snow":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
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
                    inputChannel.send(`${defender.nickname || defender.name} was frozen.`);
                    defender.status = "frozen";
                }

                inputChannel.send(`${move.name} did ${powderSnowDamage} damage.`);
                break;
            case "Feint Attack":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                let feintAttackDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                defender.damageTaken += feintAttackDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                inputChannel.send(`${move.name} did ${feintAttackDamage} damage.`);
                break;
            case "Sludge Bomb":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                let sludgeBombDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                defender.damageTaken += sludgeBombDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                let sludgeBombEffectChance = Math.floor(Math.random() * 100);
                if (sludgeBombEffectChance < move.effect_chance && defender.status === "normal" && !await isType(defender, "steel", defenderVolatileStatus) && !await isType(defender, "poison", defenderVolatileStatus)) {
                    inputChannel.send(`${defender.nickname || defender.name} was poisoned.`);
                    defender.status = "poisoned";
                }

                inputChannel.send(`${move.name} did ${sludgeBombDamage} damage.`);
                break;
            case "Mud Slap":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }

                let mudSlapDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                defender.damageTaken += mudSlapDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);
                inputChannel.send(`${move.name} did ${mudSlapDamage} damage.`);

                if (defenderVolatileStatus.mistLength > 0) {
                    inputChannel.send("Mist covers the field so the attack couldn't bring their speed down.")
                    return;
                }

                inputChannel.send(`${defender.nickname || defender.name}'s accuracy was decreased.`);
                defenderStatStage.accuracy = Math.max(-6, defenderStatStage.accuracy - 1);
                break;
            case "Octazooka":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }

                let octazookaDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                defender.damageTaken += octazookaDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);
                inputChannel.send(`${move.name} did ${octazookaDamage} damage.`);

                if (defenderVolatileStatus.mistLength > 0) {
                    inputChannel.send("Mist covers the field so the attack couldn't bring their speed down.")
                    return;
                }

                let octazookaEffectChance = Math.floor(Math.random() * 100);
                if (octazookaEffectChance < move.effect_chance) {
                    inputChannel.send(`${defender.nickname || defender.name}'s accuracy was decreased.`);
                    defenderStatStage.accuracy = Math.max(-6, defenderStatStage.accuracy - 1);
                }
                break;
            case "Zap Cannon":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                let zapCannonDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                defender.damageTaken += zapCannonDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                let zapCannonEffectChance = Math.floor(Math.random() * 100);
                if (zapCannonEffectChance < move.effect_chance && defender.status === "normal" && !await isType(defender, "electric", defenderVolatileStatus)) {
                    inputChannel.send(`${defender.nickname || defender.name} was paralyzed.`);
                    defender.status = "paralyzed";
                }

                inputChannel.send(`${move.name} did ${zapCannonDamage} damage.`);
                break;
            case "Icy Wind":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                let icyWindDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                defender.damageTaken += icyWindDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);

                inputChannel.send(`${move.name} did ${icyWindDamage} damage.`);

                if (defenderVolatileStatus.mistLength > 0) {
                    inputChannel.send("Mist covers the field so the attack couldn't bring their speed down.")
                    return;
                }

                inputChannel.send(`${defender.nickname || defender.name}'s speed was decreased.`);
                defenderStatStage.speed = Math.max(-6, defenderStatStage.speed - 1);
                break;

            case "Bone Rush":
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
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

                    inputChannel.send(`${move.name} did ${damage} damage.`);
                }
                inputChannel.send(`${move.name} was used ${boneRushCount} times.`);
                break;

            case "Outrage":
                if (attackerVolatileStatus.thrashing.length === 0) {
                    attackerVolatileStatus.thrashing.length = (Math.floor(Math.random() * 2) === 0) ? 3 : 4;
                    attackerVolatileStatus.thrashing.name = "Outrage";
                    inputChannel.send(`${attacker.nickname || attacker.name} is thrashing about.`);
                }
                if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }
                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                let outrageDamage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)
                defender.damageTaken += outrageDamage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp);
                inputChannel.send(`${move.name} did ${outrageDamage} damage.`);

                attackerVolatileStatus.thrashing.length--;
                if (attackerVolatileStatus.thrashing.length === 0) {
                    attackerVolatileStatus.confusionLength = Math.floor(Math.random() * 4 + 1);
                    inputChannel.send(`Thrashing has ended and left ${attacker.nickname || attacker.name} confused.`);
                }
                break;
            // case "Move":
            //     if (doesInvulnerableMatter(attackerVolatileStatus, defenderVolatileStatus, move)) {
            //         inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
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
                    inputChannel.send(`${defender.nickname || defender.name} is invulnerable for this turn so ${move.name} missed.`);
                    return;
                }

                if (Math.floor(Math.random() * 101) > getEffectiveAcc(move, attackerStatStage.accuracy, defenderStatStage.evasion, defenderVolatileStatus, attackerVolatileStatus)) {
                    inputChannel.send(`${move.name} missed.`);
                    return;
                }
                let damage = await getDmg(attacker, defender, move, attackerStatStage, defenderStatStage, defenderVolatileStatus)

                defender.damageTaken += damage;
                defender.damageTaken = Math.min(defender.damageTaken, totalDefenderHp)

                inputChannel.send(`${move.name} did ${damage} damage.`);
                break;
        }
        //TODO: endure isnt programmed yet
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
        inputChannel.send(`${move.name} was a critical hit.`);

    let power = move.pwr || 0;
    if (move.name === "Gust" && defenderVolatileStatus.semiInvulnerable && (defenderVolatileStatus.chargingMove.name === "Fly" || defenderVolatileStatus.chargingMove.name === "Bounce")) {
        power *= 2;
    }
    if (move.name === "Surf" && defenderVolatileStatus.semiInvulnerable && defenderVolatileStatus.chargingMove.name === "Dive") {
        power *= 2;
    }
    if (defenderVolatileStatus.minimized && (move.name === "Body Slam" || move.name === "Stomp" || move.name === "Dragon Rush" || move.name === "Steamroller" ||
        move.name === "Heat Crash" || move.name === "Heavy Slam" || move.name === "Flying Press" || move.name === "Malicious Moonsault")) {
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

    let effectiveAtk;
    let effectiveDef;

    if (move.category === "physical") {
        let atkMultiplier = Math.round(pokemonFunctions.multiplierCalculation(attacker.evLevels.atk));
        let atkElb = Math.round(pokemonFunctions.elbCalculation(attacker.base.attack, atkMultiplier, attacker.level));
        let atk = Math.round(pokemonFunctions.otherStatCalculation(attacker.level, attacker.base.attack, getNatureValue("atk", attacker.nature), atkElb));

        effectiveAtk = getEffectiveAtk(atk, attackerStatStage.atk, critical);

        let defMultiplier = Math.round(pokemonFunctions.multiplierCalculation(defender.evLevels.def));
        let defElb = Math.round(pokemonFunctions.elbCalculation(defender.base.defense, defMultiplier, defender.level));
        let def = Math.round(pokemonFunctions.otherStatCalculation(defender.level, defender.base.defense, getNatureValue("def", defender.nature), defElb));

        effectiveDef = getEffectiveDef(def, defenderStatStage.def, critical);
    } else {
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

    let type = getTypeCalculation(move.type, fullDefenderDetails.types, defenderVolatileStatus.typeChange, defenderVolatileStatus.identified);

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
        combinedStage = accuracyStage - Math.min(evasionStage, 0)
    } else {
        combinedStage = accuracyStage - evasionStage;
    }

    if (combinedStage > 6) combinedStage = 6;
    if (combinedStage < -6) combinedStage = -6;

    let other = 1;

    return (move.acc || 100) * stageMultiplier[combinedStage.toString()] * other;
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

    if (multiplier === 0)
        inputChannel.send("Attack had no effect.");
    else if (multiplier < 1)
        inputChannel.send("Attack was not very effective.");
    else if (multiplier > 1)
        inputChannel.send("Attack was super effective.");

    return multiplier;
}

function runThroughStatusEffects(pokemon, volatileStatus, totalHp, enemy, enemyVolatileStatus) {

    if (pokemon.status === "burned") {
        inputChannel.send(`${pokemon.nickname || pokemon.name} was hurt by burn.`);
        pokemon.damageTaken += Math.round(totalHp / 16);
        pokemon.damageTaken = Math.min(totalHp, pokemon.damageTaken);
    }
    if (pokemon.status === "poisoned") {
        inputChannel.send(`${pokemon.nickname || pokemon.name} was hurt by poison.`);
        pokemon.damageTaken += Math.round(totalHp / 8);
        pokemon.damageTaken = Math.min(totalHp, pokemon.damageTaken);
    }
    if (pokemon.status === "badly poisoned") {
        inputChannel.send(`${pokemon.nickname || pokemon.name} was badly hurt by poison.`);
        pokemon.damageTaken += Math.round(totalHp * (volatileStatus.badlyPoisonTurn + 1) / 16);
        pokemon.damageTaken = Math.min(totalHp, pokemon.damageTaken);
        volatileStatus.badlyPoisonTurn++;
    }
    if (volatileStatus.sleepTurnLength > 0) {
        volatileStatus.sleepTurnLength--;

    }

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
        inputChannel.send(`${volatileStatus.bound.name} did ${boundDmg} dmg to ${pokemon.nickname || pokemon.name}.`);

        if (volatileStatus.bound.length === 0) {
            inputChannel.send(`${pokemon.nickname || pokemon.name} was freed from being bound.`);
        }
    }

    if (volatileStatus.cursed) {
        inputChannel.send(`${pokemon.nickname || pokemon.name} damaged by curse.`);
        pokemon.damageTaken += Math.round(totalHp / 4);
        pokemon.damageTaken = Math.min(totalHp, pokemon.damageTaken);
    }

    if (volatileStatus.drowsy === 1) {
        if (pokemon.status === "normal") {
            volatileStatus.sleepTurnLength = Math.floor(Math.random() * (4 - 1) + 1);
            pokemon.status = "sleeping";
            inputChannel.send(`Due to it's drowsiness ${pokemon.nickname || pokemon.name} fell asleep.`);
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

            inputChannel.send(`${pokemon.nickname || pokemon.name}'s healing was blocked.`);
        }

        inputChannel.send(`Leech seed did ${newDmg} to ${enemy.nickname || enemy.name} damage.`);
        inputChannel.send(`${pokemon.nickname || pokemon.name} was healed for ${newDmg}.`);
    }
    if (pokemon.status === "sleeping" && volatileStatus.nightmare) {
        inputChannel.send(`${pokemon.nickname || pokemon.name} had a nightmare.`);
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
        inputChannel.send(`${pokemon.nickname || pokemon.name} perish song length is now ${volatileStatus.perishSongLength}.`);
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
        inputChannel.send(`${pokemon.nickname || pokemon.name} was healed by rooting.`);
    }

    if (volatileStatus.healBlockLength === 0 && pokemon.damageTaken < totalHp && volatileStatus.aquaRing) {
        pokemon.damageTaken -= Math.round(totalHp / 16);
        pokemon.damageTaken = Math.max(0, pokemon.damageTaken);
        inputChannel.send(`${pokemon.nickname || pokemon.name} was healed by aqua ring.`);
    }
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

async function getWeight(pokeId) {
    let fullPokemon = await pokemonListFunctions.getPokemonFromId(pokeId);
    const weight = fullPokemon.weight;
    const match = weight.match(/\(([^)]+)\)/);

    return parseFloat(match[1].replace("lbs"));
}

async function getNewLevelAndXp(pokemon, inputChannel) {

    const pokemonDetails = await pokemonListFunctions.getPokemonFromId(pokemon.pokeId);

    let levelingRate = pokemonDetails.levelingRate;

    let xpNeededForNextLevel = pokemonFunctions.getCurrentTotalXpAtLevel(levelingRate, pokemon.level + 1) - pokemonFunctions.getCurrentTotalXpAtLevel(levelingRate, pokemon.level);

    let leveledUp = false;

    while (pokemon.exp > xpNeededForNextLevel) {
        leveledUp = true;
        pokemon.level += 1;
        inputChannel.send(`${pokemon.nickname || pokemon.name} leveled up to ${pokemon.level}.`);

        for (let i = 0; i < pokemonDetails.moves.length; i++) {
            if (pokemonDetails.moves[i].level > pokemon.level) {
                break;
            } else if (pokemonDetails.moves[i].level === pokemon.level) {
                inputChannel.send(`${pokemon.nickname || pokemon.name} can learn ${pokemonDetails.moves[i].name} please see a move tutor to learn this move.`);
            }

        }
        pokemon.exp -= xpNeededForNextLevel;
        xpNeededForNextLevel = pokemonFunctions.getCurrentTotalXpAtLevel(levelingRate, pokemon.level + 1) - pokemonFunctions.getCurrentTotalXpAtLevel(levelingRate, pokemon.level);
    }

    return leveledUp;
}

function isPokemonEvolving(pokemon) {
    return pokemon.level >= pokemonFunctions.levelNeededToEvolve(pokemon.name);
}

function getMoneyFromSpawnedPokemon(pokemonLevel) {
    if (pokemonLevel < 10)
        return Math.floor(Math.random() * 100) + 10;
    else if (pokemonLevel < 20)
        return Math.floor(Math.random() * 100) + 50;
    else if (pokemonLevel < 30)
        return Math.floor(Math.random() * 150) + 100;
    else if (pokemonLevel < 40)
        return Math.floor(Math.random() * 300) + 200;
    else if (pokemonLevel < 50)
        return Math.floor(Math.random() * 500) + 350;
    else if (pokemonLevel < 60)
        return Math.floor(Math.random() * 750) + 575;
    else
        return Math.floor(Math.random() * 1200) + 800;
}

async function getGainedXpFromBattle(feintedPokemon, winningPokemon) {
    let feintedPokemonDetails = await pokemonListFunctions.getPokemonFromId(feintedPokemon.pokeId);

    //base experience yield of feinted pokemon
    let b = feintedPokemonDetails.baseExperience;
    //level of feinted pokemon
    let L = feintedPokemon.level;
    //1 when pokemon is in battle, 2 if pokemon is using exp share
    let s = 1;
    //level of victorious pokemon
    let L_p = winningPokemon.level;
    //1 if original owner, 1.5 is traded
    let t = 1;
    if (winningPokemon.caughtTimestamp !== winningPokemon.receivedTimestamp)
        t = 1.5
    //1.5 is holding lucky egg, else 1
    let e = 1;
    //1.2 if past the level to evolve, else 1
    let v = 1;
    if (isPokemonEvolving(winningPokemon))
        v = 1.2
    //1.2 if affection of 2+hearts, else 1
    let f = 1;
    //depends on exp point power
    let p = 1;


    let firstPart = Math.floor(((b * L) / 5) * (1 / s));


    let num = ((2 * L) + 10);
    let dem = (L + L_p + 10);
    let secondPart = Math.floor(firstPart * Math.pow(num / dem, 2.5));

    // console.log(b, L, s, firstPart);
    // console.log(num, dem, secondPart);
    // console.log(t, e, v, f, p);

    return Math.floor(secondPart * t * e * v * f * p);
}
