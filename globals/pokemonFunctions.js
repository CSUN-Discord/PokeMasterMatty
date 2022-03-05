const generalFunctions = require("./generalFunctions");
const moveListFunctions = require("../db/functions/moveListFunctions");
var async = require("async");

module.exports = {

    createPokemonDetails: function (level, defaultPokemon) {
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
            "teamNumber": null,
            "boxNumber": null,
            "item": null,
            "shiny": false,
            "ball": null,
            "currentMoves": null,
            "caughtTimestamp": null,
            "receivedTimestamp": null,
            "nature": setNature(),
            "male": isMale(defaultPokemon.genderPercentage.male),
            "friendship": defaultPokemon.baseFriendship
        }

        fullDetailsPokemon.shiny = isShiny(fullDetailsPokemon.ivStats)
        fullDetailsPokemon.currentMoves = setMoves(level, defaultPokemon);

        fullDetailsPokemon.evLevels = {
            "hp": getEvLevel(fullDetailsPokemon.ivStats.hp),
            "atk": getEvLevel(fullDetailsPokemon.ivStats.atk),
            "def": getEvLevel(fullDetailsPokemon.ivStats.def),
            "spAtk": getEvLevel(fullDetailsPokemon.ivStats.spAtk),
            "spDef": getEvLevel(fullDetailsPokemon.ivStats.spDef),
            "speed": getEvLevel(fullDetailsPokemon.ivStats.speed)
        }

        return fullDetailsPokemon;
    },

    createStarterPokemonDetails: function (level, defaultPokemon, user) {
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
            "teamNumber": null,
            "boxNumber": null,
            "item": null,
            "shiny": false,
            "ball": "Poke Ball",
            "currentMoves": null,
            "caughtTimestamp": Date.now(),
            "receivedTimestamp": Date.now(),
            "nature": setNature(),
            "male": isMale(defaultPokemon.genderPercentage.male),
            "friendship": defaultPokemon.baseFriendship
        }

        fullDetailsPokemon.shiny = isShiny(fullDetailsPokemon.ivStats)
        fullDetailsPokemon.currentMoves = setMoves(level, defaultPokemon);

        console.log(fullDetailsPokemon.currentMoves)

        fullDetailsPokemon.evLevels = {
            "hp": getEvLevel(fullDetailsPokemon.ivStats.hp),
            "atk": getEvLevel(fullDetailsPokemon.ivStats.atk),
            "def": getEvLevel(fullDetailsPokemon.ivStats.def),
            "spAtk": getEvLevel(fullDetailsPokemon.ivStats.spAtk),
            "spDef": getEvLevel(fullDetailsPokemon.ivStats.spDef),
            "speed": getEvLevel(fullDetailsPokemon.ivStats.speed)
        }

        return fullDetailsPokemon;
    },

    hpCalculation: function (level, base, elb) {
        return (((level / 100 + 1) * base + level) + elb)
    },

    otherStateCalculation: function (level, base, nature, elb) {
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

function isMale(malePercentage) {
    return (Math.floor(Math.random() * (99) + 1) / 100) <= malePercentage;
}

function setMoves(currentLevel, defaultPokemon) {
    let moves = defaultPokemon.moves.filter(obj => {
        return obj.level <= currentLevel;
    })
    let currentMoves = [];
    while (moves.length > 0 && currentMoves.length < 4) {
        currentMoves.push(moves.splice([Math.floor(Math.random() * moves.length)], 1)[0]);
    }

    let moveDetails = [];


    for (let i = 0; i < currentMoves.length; i++) {
        moveListFunctions.getMove(currentMoves[i].name).then((move) => {
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