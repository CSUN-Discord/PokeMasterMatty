const generalFunctions = require("./generalFunctions");
const moveListFunctions = require("../db/functions/moveListFunctions");

module.exports = {

    //give pokemon their abilities
    //check magnemites gender should be n/a
    createPokemonDetails: async function (level, defaultPokemon) {
        let fullDetailsPokemon = {
            "pokeId": defaultPokemon.pokeId,
            "name": defaultPokemon.name,
            "level": level,
            "owner": null,
            "nickname": null,
            "exp": 0,
            "traded": false,
            "ivStats": {
                "hp": generalFunctions.randomIntFromInterval(0, 31),
                "atk": generalFunctions.randomIntFromInterval(0, 31),
                "def": generalFunctions.randomIntFromInterval(0, 31),
                "spAtk": generalFunctions.randomIntFromInterval(0, 31),
                "spDef": generalFunctions.randomIntFromInterval(0, 31),
                "speed": generalFunctions.randomIntFromInterval(0, 31)
            },
            "evLevels": null,
            "base": defaultPokemon.baseStats,
            "damageTaken": 0,
            "status": "normal",
            //is team number needed?
            // "teamNumber": null,
            "boxNumber": null,
            "item": null,
            "shiny": false,
            "ball": null,
            "currentMoves": null,
            "caughtTimestamp": null,
            "receivedTimestamp": null,
            "nature": setNature(),
            "male": isFemale(defaultPokemon.genderPercentage.male),
            "friendship": defaultPokemon.baseFriendship
        }

        fullDetailsPokemon.shiny = isShiny(fullDetailsPokemon.ivStats)
        fullDetailsPokemon.evLevels = {
            "hp": getEvLevel(fullDetailsPokemon.ivStats.hp),
            "atk": getEvLevel(fullDetailsPokemon.ivStats.atk),
            "def": getEvLevel(fullDetailsPokemon.ivStats.def),
            "spAtk": getEvLevel(fullDetailsPokemon.ivStats.spAtk),
            "spDef": getEvLevel(fullDetailsPokemon.ivStats.spDef),
            "speed": getEvLevel(fullDetailsPokemon.ivStats.speed)
        };

        fullDetailsPokemon.currentMoves = await setMoves(level, defaultPokemon);

        return fullDetailsPokemon;
    },

    createStarterPokemonDetails: async function (level, defaultPokemon, user) {
        let fullDetailsPokemon = {
            "pokeId": defaultPokemon.pokeId,
            "name": defaultPokemon.name,
            "level": level,
            "owner": user,
            "nickname": null,
            "exp": 0,
            "traded": false,
            "ivStats": {
                "hp": generalFunctions.randomIntFromInterval(0, 31),
                "atk": generalFunctions.randomIntFromInterval(0, 31),
                "def": generalFunctions.randomIntFromInterval(0, 31),
                "spAtk": generalFunctions.randomIntFromInterval(0, 31),
                "spDef": generalFunctions.randomIntFromInterval(0, 31),
                "speed": generalFunctions.randomIntFromInterval(0, 31)
            },
            "evLevels": null,
            "base": defaultPokemon.baseStats,
            "damageTaken": 0,
            "status": "normal",
            // "teamNumber": null,
            "boxNumber": null,
            "item": null,
            "shiny": false,
            "ball": "Poke Ball",
            "currentMoves": null,
            "caughtTimestamp": Date.now(),
            "receivedTimestamp": Date.now(),
            "nature": setNature(),
            "male": isFemale(defaultPokemon.genderPercentage.male),
            "friendship": defaultPokemon.baseFriendship
        }

        fullDetailsPokemon.shiny = isShiny(fullDetailsPokemon.ivStats)

        fullDetailsPokemon.evLevels = {
            "hp": getEvLevel(fullDetailsPokemon.ivStats.hp),
            "atk": getEvLevel(fullDetailsPokemon.ivStats.atk),
            "def": getEvLevel(fullDetailsPokemon.ivStats.def),
            "spAtk": getEvLevel(fullDetailsPokemon.ivStats.spAtk),
            "spDef": getEvLevel(fullDetailsPokemon.ivStats.spDef),
            "speed": getEvLevel(fullDetailsPokemon.ivStats.speed)
        };

        fullDetailsPokemon.currentMoves = await setMoves(level, defaultPokemon);

        return fullDetailsPokemon;
    },

    hpCalculation: function (level, base, elb) {
        return (((level / 100 + 1) * base + level) + elb)
    },

    otherStatCalculation: function (level, base, nature, elb) {
        return (((((level / 50 + 1) * base) / 1.5) * nature) + elb)
    },

    elbCalculation: function (base, multiplier, level) {
        return ((Math.sqrt(base) * multiplier + level) / 2.5)
    },

    multiplierCalculation: function (effortLevel) {
        switch (effortLevel) {
            case 0:
                return 0;
            case 1:
                return 2;
            case 2:
                return 3;
            case 3:
                return 4;
            case 4:
                return 7;
            case 5:
                return 8;
            case 6:
                return 9;
            case 7:
                return 14;
            case 8:
                return 15;
            case 9:
                return 16;
            case 10:
                return 25;
        }
    },

    setQuantity: function (spawnRate) {
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
    },

    setLevel: function (rarity) {
        switch (rarity) {
            case "common":
                return generalFunctions.randomIntFromInterval(5, 25);
            case "uncommon":
                return generalFunctions.randomIntFromInterval(10, 32);
            case "rare":
                return generalFunctions.randomIntFromInterval(12, 45);
            case "very rare":
                return generalFunctions.randomIntFromInterval(20, 60);
            case "epic":
                return generalFunctions.randomIntFromInterval(65, 80);
        }
    }
}

function getEvLevel(ivLevel) {
    if (ivLevel === 31) {
        return 3;
    } else if (ivLevel > 25 && ivLevel < 31) {
        return 2;
    } else if (ivLevel > 19 && ivLevel < 26) {
        return 1;
    } else if (ivLevel < 20) {
        return 0;
    }
}

function isFemale(malePercentage) {
    const percentage = generalFunctions.randomIntFromInterval(0, 100);
    // console.log(percentage)
    // console.log(malePercentage)
    return percentage >= malePercentage;
}

async function setMoves(currentLevel, defaultPokemon) {
    // = programmed, but not in sw/sh
    // // = not programmed, but it not in sw/sh
    let allProgrammedMoves = new Set([
        "Pound",
        // "Karate Chop",
        // "Double Slap",
        // "Comet Punch",
        "Mega Punch",
        "Pay Day",
        "Fire Punch",
        "Ice Punch",
        "Thunder Punch",
        "Scratch",
        "Vise Grip",
        "Guillotine",
        // "Razor Wind",
        "Swords Dance",
        "Cut",
        "Gust",
        "Wing Attack",
        "Whirlwind",
        "Fly",
        "Bind",
        "Slam",
        "Vine Whip",
        "Stomp",
        "Double Kick",
        "Mega Kick",
        // "Jump Kick",
        // "Rolling Kick",
        "Sand Attack",
        "Headbutt",
        "Horn Attack",
        "Fury Attack",
        "Horn Drill",
        "Tackle",
        "Body Slam",
        "Wrap",
        "Take Down",
        "Thrash",
        "Double-Edge",
        "Tail Whip",
        "Poison Sting",
        // "Twineedle",
        "Pin Missile",
        "Leer",
        "Bite",
        "Growl",
        "Roar",
        "Sing",
        "Supersonic",
        // "Sonic Boom",
        "Disable",
        "Acid",
        "Ember",
        "Flamethrower",
        "Mist",
        "Water Gun",
        "Hydro Pump",
        "Surf",
        "Ice Beam",
        "Blizzard",
        "Psybeam",
        "Bubble Beam",
        "Aurora Beam",
        "Hyper Beam",
        "Peck",
        "Drill Peck",
        "Submission",
        "Low Kick",
        "Counter",
        "Seismic Toss",
        "Strength",
        "Absorb",
        "Leech Seed",
        "Growth",
        "Razor Leaf",
        "Solar Beam",
        "Poison Powder",
        "Stun Spore",
        "Sleep Powder",
        "Petal Dance",
        "String Shot",
        // "Dragon Rage",
        "Fire Spin",
        "Thunder Shock",
        "Thunderbolt",
        "Thunder Wave",
        "Thunder",
        "Rock Throw",
        "Earthquake",
        "Fissure",
        "Dig",
        "Toxic",
        "Confusion",
        "Psychic",
        "Hypnosis",
        // "Meditate",
        "Agility",
        "Quick Attack",
        // // "Rage",
        "Teleport",
        "Night Shade",
        "Mimic",
        "Screech",
        "Double Team",
        "Recover",
        "Harden",
        "Minimize",
        "Smokescreen",
        "Confuse Ray",
        "Withdraw",
        "Defense Curl",
        // // "Barrier",
        "Light Screen",
        "Haze",
        "Reflect",
        "Focus Energy",
        // // "Bide",
        // // "Metronome",
        // // "Mirror Move",
        "Self-Destruct",
        // // "Egg Bomb",
        "Lick",
        "Smog",
        "Sludge",
        // // "Bone Club",
        "Fire Blast",
        "Waterfall",
        // // "Clamp",
        "Swift",
        "Skull Bash",
        // // "Spike Cannon",
        // // "Constrict",
        "Amnesia",
        "Kinesis",
        "Soft-Boiled",
        "High Jump Kick",
        "Glare",
        "Dream Eater",
        "Poison Gas",
        // // "Barrage",
        "Leech Life",
        "Lovely Kiss",
        "Sky Attack",
        "Transform",
        "Bubble",
        // // "Dizzy Punch",
        "Spore",
        // // "Flash",
        // // "Psywave",
        "Splash",
        "Acid Armor",
        "Crabhammer",
        "Explosion",
        "Fury Swipes",
        "Bonemerang",
        "Rest",
        "Rock Slide",
        // // "Hyper Fang",
        // // "Sharpen",
        "Conversion",
        "Tri Attack",
        "Super Fang",
        "Slash",
        // // // "Substitute",
        "Struggle",
        // // //"Sketch",

    ]);

    let moves = defaultPokemon.moves.filter(obj => {
        return obj.level <= currentLevel;
    })

    moves = moves.filter(obj => {
        return allProgrammedMoves.has(obj.name)
    })

    // console.log(moves)

    for (let i = 0; i < moves.length; i++) {
        await moveListFunctions.getMove(moves[i].name).then((doc) => {
            if (doc == null) {
                console.error(`Can't find move: ${moves[i].name}`)
                moves.splice(i, 1)
            }
        })
    }

    let currentMoves = [];
    while (moves.length > 0 && currentMoves.length < 4) {
        currentMoves.push(moves.splice([Math.floor(Math.random() * moves.length)], 1)[0]);
    }

    let moveDetails = [];
    for (let i = 0; i < currentMoves.length; i++) {
        await moveListFunctions.getMove(currentMoves[i].name).then((move) => {
            const tempMove = {
                id: move.id,
                name: move.name,
                category: move.category,
                flavorText: move.flavorText,
                pp: move.pp,
                currentPP: move.pp,
                pwr: move.pwr,
                priority: move.priority,
                type: move.type
            }
            moveDetails.push(tempMove);
        })
    }

    return moveDetails;
}

function isShiny(ivStats) {
    return ((ivStats.def === ivStats.speed === ivStats.spAtk === ivStats.spDef) &&
        (ivStats.atk === 2 || ivStats.atk === 3 || ivStats.atk === 6 || ivStats.atk === 7 || ivStats.atk === 10 ||
            ivStats.atk === 11 || ivStats.atk === 14 || ivStats.atk === 15 || ivStats.atk === 18 || ivStats.atk === 19 ||
            ivStats.atk === 22 || ivStats.atk === 23 || ivStats.atk === 26 || ivStats.atk === 27 || ivStats.atk === 30));
}

function setNature() {
    let natures = ["adamant", "bashful", "bold", "brave", "calm", "careful", "docile", "gentle", "hardy", "hasty", "impish", "jolly", "lax",
        "lonely", "mild", "modest", "naive", "naughty", "quiet", "quirky", "rash", "relaxed", "sassy", "serious", "timid"];

    return natures[Math.floor(Math.random() * natures.length)];
}