const generalFunctions = require("./generalFunctions");
const moveListFunctions = require("../db/functions/moveListFunctions");
const {EmbedBuilder, AttachmentBuilder} = require("discord.js");
const emojiListFunctions = require("../db/functions/emojiListFunctions");
const itemListFunctions = require("../db/functions/itemListFunctions");

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
            // "traded": false,
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
            // "boxNumber": null,
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
        const currentTime = Date.now();
        let fullDetailsPokemon = {
            "pokeId": defaultPokemon.pokeId,
            "name": defaultPokemon.name,
            "level": level,
            "owner": user,
            "nickname": null,
            "exp": 0,
            // "traded": false,
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
            // "boxNumber": null,
            "item": null,
            "shiny": false,
            "ball": "Poke Ball",
            "currentMoves": null,
            "caughtTimestamp": currentTime,
            "receivedTimestamp": currentTime,
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
    },

    getCurrentTotalXpAtLevel: function (levelingRate, currentLevel) {
        switch (levelingRate) {
            case "Fast":
                const fast = {
                    '1': 0,
                    '2': 6,
                    '3': 21,
                    '4': 51,
                    '5': 100,
                    '6': 172,
                    '7': 274,
                    '8': 409,
                    '9': 583,
                    '10': 800,
                    '11': 1064,
                    '12': 1382,
                    '13': 1757,
                    '14': 2195,
                    '15': 2700,
                    '16': 3276,
                    '17': 3930,
                    '18': 4665,
                    '19': 5487,
                    '20': 6400,
                    '21': 7408,
                    '22': 8518,
                    '23': 9733,
                    '24': 11059,
                    '25': 12500,
                    '26': 14060,
                    '27': 15746,
                    '28': 17561,
                    '29': 19511,
                    '30': 21600,
                    '31': 23832,
                    '32': 26214,
                    '33': 28749,
                    '34': 31443,
                    '35': 34300,
                    '36': 37324,
                    '37': 40522,
                    '38': 43897,
                    '39': 47455,
                    '40': 51200,
                    '41': 55136,
                    '42': 59270,
                    '43': 63605,
                    '44': 68147,
                    '45': 72900,
                    '46': 77868,
                    '47': 83058,
                    '48': 88473,
                    '49': 94119,
                    '50': 100000,
                    '51': 106120,
                    '52': 112486,
                    '53': 119101,
                    '54': 125971,
                    '55': 133100,
                    '56': 140492,
                    '57': 148154,
                    '58': 156089,
                    '59': 164303,
                    '60': 172800,
                    '61': 181584,
                    '62': 190662,
                    '63': 200037,
                    '64': 209715,
                    '65': 219700,
                    '66': 229996,
                    '67': 240610,
                    '68': 251545,
                    '69': 262807,
                    '70': 274400,
                    '71': 286328,
                    '72': 298598,
                    '73': 311213,
                    '74': 324179,
                    '75': 337500,
                    '76': 351180,
                    '77': 365226,
                    '78': 379641,
                    '79': 394431,
                    '80': 409600,
                    '81': 425152,
                    '82': 441094,
                    '83': 457429,
                    '84': 474163,
                    '85': 491300,
                    '86': 508844,
                    '87': 526802,
                    '88': 545177,
                    '89': 563975,
                    '90': 583200,
                    '91': 602856,
                    '92': 622950,
                    '93': 643485,
                    '94': 664467,
                    '95': 685900,
                    '96': 707788,
                    '97': 730138,
                    '98': 752953,
                    '99': 776239,
                    '100': 800000
                }
                return fast[currentLevel];
            case "Medium Fast":
                const medFast = {
                    '1': 0,
                    '2': 8,
                    '3': 27,
                    '4': 64,
                    '5': 125,
                    '6': 216,
                    '7': 343,
                    '8': 512,
                    '9': 729,
                    '10': 1000,
                    '11': 1331,
                    '12': 1728,
                    '13': 2197,
                    '14': 2744,
                    '15': 3375,
                    '16': 4096,
                    '17': 4913,
                    '18': 5832,
                    '19': 6859,
                    '20': 8000,
                    '21': 9261,
                    '22': 10648,
                    '23': 12167,
                    '24': 13824,
                    '25': 15625,
                    '26': 17576,
                    '27': 19683,
                    '28': 21952,
                    '29': 24389,
                    '30': 27000,
                    '31': 29791,
                    '32': 32768,
                    '33': 35937,
                    '34': 39304,
                    '35': 42875,
                    '36': 46656,
                    '37': 50653,
                    '38': 54872,
                    '39': 59319,
                    '40': 64000,
                    '41': 68921,
                    '42': 74088,
                    '43': 79507,
                    '44': 85184,
                    '45': 91125,
                    '46': 97336,
                    '47': 103823,
                    '48': 110592,
                    '49': 117649,
                    '50': 125000,
                    '51': 132651,
                    '52': 140608,
                    '53': 148877,
                    '54': 157464,
                    '55': 166375,
                    '56': 175616,
                    '57': 185193,
                    '58': 195112,
                    '59': 205379,
                    '60': 216000,
                    '61': 226981,
                    '62': 238328,
                    '63': 250047,
                    '64': 262144,
                    '65': 274625,
                    '66': 287496,
                    '67': 300763,
                    '68': 314432,
                    '69': 328509,
                    '70': 343000,
                    '71': 357911,
                    '72': 373248,
                    '73': 389017,
                    '74': 405224,
                    '75': 421875,
                    '76': 438976,
                    '77': 456533,
                    '78': 474552,
                    '79': 493039,
                    '80': 512000,
                    '81': 531441,
                    '82': 551368,
                    '83': 571787,
                    '84': 592704,
                    '85': 614125,
                    '86': 636056,
                    '87': 658503,
                    '88': 681472,
                    '89': 704969,
                    '90': 729000,
                    '91': 753571,
                    '92': 778688,
                    '93': 804357,
                    '94': 830584,
                    '95': 857375,
                    '96': 884736,
                    '97': 912673,
                    '98': 941192,
                    '99': 970299,
                    '100': 1000000
                }
                return medFast[currentLevel];
            case "Medium Slow":
                const medSlow = {
                    '1': 0,
                    '2': 9,
                    '3': 57,
                    '4': 96,
                    '5': 135,
                    '6': 179,
                    '7': 236,
                    '8': 314,
                    '9': 419,
                    '10': 560,
                    '11': 742,
                    '12': 973,
                    '13': 1261,
                    '14': 1612,
                    '15': 2035,
                    '16': 2535,
                    '17': 3120,
                    '18': 3798,
                    '19': 4575,
                    '20': 5460,
                    '21': 6458,
                    '22': 7577,
                    '23': 8825,
                    '24': 10208,
                    '25': 11735,
                    '26': 13411,
                    '27': 15244,
                    '28': 17242,
                    '29': 19411,
                    '30': 21760,
                    '31': 24294,
                    '32': 27021,
                    '33': 29949,
                    '34': 33084,
                    '35': 36435,
                    '36': 40007,
                    '37': 43808,
                    '38': 47846,
                    '39': 52127,
                    '40': 56660,
                    '41': 61450,
                    '42': 66505,
                    '43': 71833,
                    '44': 77440,
                    '45': 83335,
                    '46': 89523,
                    '47': 96012,
                    '48': 102810,
                    '49': 109923,
                    '50': 117360,
                    '51': 125126,
                    '52': 133229,
                    '53': 141677,
                    '54': 150476,
                    '55': 159635,
                    '56': 169159,
                    '57': 179056,
                    '58': 189334,
                    '59': 199999,
                    '60': 211060,
                    '61': 222522,
                    '62': 234393,
                    '63': 246681,
                    '64': 259392,
                    '65': 272535,
                    '66': 286115,
                    '67': 300140,
                    '68': 314618,
                    '69': 329555,
                    '70': 344960,
                    '71': 360838,
                    '72': 377197,
                    '73': 394045,
                    '74': 411388,
                    '75': 429235,
                    '76': 447591,
                    '77': 466464,
                    '78': 485862,
                    '79': 505791,
                    '80': 526260,
                    '81': 547274,
                    '82': 568841,
                    '83': 590969,
                    '84': 613664,
                    '85': 636935,
                    '86': 660787,
                    '87': 685228,
                    '88': 710266,
                    '89': 735907,
                    '90': 762160,
                    '91': 789030,
                    '92': 816525,
                    '93': 844653,
                    '94': 873420,
                    '95': 902835,
                    '96': 932903,
                    '97': 963632,
                    '98': 995030,
                    '99': 1027103,
                    '100': 1059860
                }
                return medSlow[currentLevel];
            case "Slow":
                const slow = {
                    '1': 0,
                    '2': 10,
                    '3': 33,
                    '4': 80,
                    '5': 156,
                    '6': 270,
                    '7': 428,
                    '8': 640,
                    '9': 911,
                    '10': 1250,
                    '11': 1663,
                    '12': 2160,
                    '13': 2746,
                    '14': 3430,
                    '15': 4218,
                    '16': 5120,
                    '17': 6141,
                    '18': 7290,
                    '19': 8573,
                    '20': 10000,
                    '21': 11576,
                    '22': 13310,
                    '23': 15208,
                    '24': 17280,
                    '25': 19531,
                    '26': 21970,
                    '27': 24603,
                    '28': 27440,
                    '29': 30486,
                    '30': 33750,
                    '31': 37238,
                    '32': 40960,
                    '33': 44921,
                    '34': 49130,
                    '35': 53593,
                    '36': 58320,
                    '37': 63316,
                    '38': 68590,
                    '39': 74148,
                    '40': 80000,
                    '41': 86151,
                    '42': 92610,
                    '43': 99383,
                    '44': 106480,
                    '45': 113906,
                    '46': 121670,
                    '47': 129778,
                    '48': 138240,
                    '49': 147061,
                    '50': 156250,
                    '51': 165813,
                    '52': 175760,
                    '53': 186096,
                    '54': 196830,
                    '55': 207968,
                    '56': 219520,
                    '57': 231491,
                    '58': 243890,
                    '59': 256723,
                    '60': 270000,
                    '61': 283726,
                    '62': 297910,
                    '63': 312558,
                    '64': 327680,
                    '65': 343281,
                    '66': 359370,
                    '67': 375953,
                    '68': 393040,
                    '69': 410636,
                    '70': 428750,
                    '71': 447388,
                    '72': 466560,
                    '73': 486271,
                    '74': 506530,
                    '75': 527343,
                    '76': 548720,
                    '77': 570666,
                    '78': 593190,
                    '79': 616298,
                    '80': 640000,
                    '81': 664301,
                    '82': 689210,
                    '83': 714733,
                    '84': 740880,
                    '85': 767656,
                    '86': 795070,
                    '87': 823128,
                    '88': 851840,
                    '89': 881211,
                    '90': 911250,
                    '91': 941963,
                    '92': 973360,
                    '93': 1005446,
                    '94': 1038230,
                    '95': 1071718,
                    '96': 1105920,
                    '97': 1140841,
                    '98': 1176490,
                    '99': 1212873,
                    '100': 1250000
                }
                return slow[currentLevel];
            default:
                console.log("Leveling rate is not programmed.")
                break;
        }
    },

    levelNeededToEvolve: function (pokemonName) {
        let levelNeeded = {
            'Bulbasaur': 16,
            'Ivysaur': 32,
            'Charmander': 16,
            'Charmeleon': 36,
            'Squirtle': 16,
            'Wartortle': 36,
            'Caterpie': 7,
            'Metapod': 10,
            'Weedle': 7,
            'Kakuna': 10,
            'Pidgey': 18,
            'Pidgeotto': 36,
            'Rattata*': 20,
            'Spearow': 20,
            'Ekans': 22,
            'Sandshrew': 22,
            'Nidoran F': 16,
            'Nidoran M': 16,
            'Zubat': 22,
            'Oddish': 21,
            'Paras': 24,
            'Venonat': 31,
            'Diglett': 26,
            'Meowth': 28,
            'Psyduck': 33,
            'Mankey': 28,
            'Poliwag': 25,
            'Abra': 16,
            'Machop': 28,
            'Bellsprout': 21,
            'Tentacool': 30,
            'Geodude': 25,
            'Ponyta': 40,
            'Slowpoke': 37,
            'Magnemite': 30,
            'Doduo': 31,
            'Seel': 34,
            'Grimer': 38,
            'Gastly': 25,
            'Drowzee': 26,
            'Krabby': 28,
            'Voltorb': 30,
            'Cubone*': 28,
            'Koffing': 35,
            'Rhyhorn': 42,
            'Horsea': 32,
            'Goldeen': 33,
            'Mr. Mime': 42,
            'Magikarp': 20,
            'Omanyte': 40,
            'Kabuto': 40,
            'Dratini': 30,
            'Dragonair': 55,
        }

        return levelNeeded[pokemonName];
    },

    createPokemonDetailsEmbed: async function (pokemon, fullPokemonDetails, interaction, user) {

        let result;
        let pokeIcon;

        if (pokemon.shiny) {
            result = await emojiListFunctions.getShinyGif(pokemon.pokeId);
            pokeIcon = new AttachmentBuilder(`./media/pokemon/shiny-icons/${pokemon.pokeId}.png`);
        } else {
            result = await emojiListFunctions.getNormalGif(pokemon.pokeId);
            pokeIcon = new AttachmentBuilder(`./media/pokemon/normal-icons/${pokemon.pokeId}.png`);
        }

        let pokeBall = await itemListFunctions.getItem(pokemon.ball);
        const ballIcon = new AttachmentBuilder(`./media/items/poke-balls/${pokeBall.sprite}`);

        let pokemonEmbed = new EmbedBuilder()
            .setColor('Random')
            .setThumbnail(`attachment://${pokemon.pokeId}.png`)
            .setAuthor({name: `${user.name}`, iconURL: `${interaction.user.avatarURL()}`})
            .setDescription(`${fullPokemonDetails.description}`)
            .setTimestamp(pokemon.receivedTimestamp)
        let pokemonStringDetails = `\n**Height:** ${fullPokemonDetails.height} **Weight:** ${fullPokemonDetails.weight} \n**Held Item:** ${pokemon.item || "nothing"} \n**Friendship:** ${pokemon.friendship} \n**Type:** `;
        for (let i = 0; i < fullPokemonDetails.types.length; i++) {
            pokemonStringDetails += `• ${fullPokemonDetails.types[i]} `;
        }
        pokemonStringDetails += "\n**Abilities:** "
        for (let i = 0; i < fullPokemonDetails.abilities.length; i++) {
            pokemonStringDetails += `• ${fullPokemonDetails.abilities[i].name} `;
        }
        pokemonStringDetails += `\n**Nature:** ${pokemon.nature}`

        pokemonEmbed.addFields([
            {
                name: '\u200b',
                value: pokemonStringDetails,
                inline: false
            },
            {
                name: "Base Stats",
                value: `**HP:** ${pokemon.base.hp} \n**ATK:** ${pokemon.base.attack} \n**DEF:** ${pokemon.base.defense} \n**SPATK:** ${pokemon.base['special-attack']} \n**SPDEF:** ${pokemon.base['special-defense']} \n**SPEED:** ${pokemon.base.speed}`,
                inline: true
            },
            {
                name: "IV Stats",
                value: `**HP:** ${pokemon.ivStats.hp} \n**ATK:** ${pokemon.ivStats.atk} \n**DEF:** ${pokemon.ivStats.def} \n**SPATK:** ${pokemon.ivStats.spAtk} \n**SPDEF:** ${pokemon.ivStats.spDef} \n**SPEED:** ${pokemon.ivStats.speed}`,
                inline: true
            },
            {
                name: "EV Stats",
                value: `**HP:** ${pokemon.evLevels.hp} \n**ATK:** ${pokemon.evLevels.atk} \n**DEF:** ${pokemon.evLevels.def} \n**SPATK:** ${pokemon.evLevels.spAtk} \n**SPDEF:** ${pokemon.evLevels.spDef} \n**SPEED:** ${pokemon.evLevels.speed}`,
                inline: true
            },
        ])
        const currentMoves = pokemon.currentMoves;

        for (let i = 0; i < currentMoves.length; i++) {
            pokemonEmbed.addFields([
                {
                    name: `${currentMoves[i].name}`,
                    value: `${currentMoves[i].flavorText}`
                },
                {
                    name: 'PP',
                    value: `${currentMoves[i].currentPP}/${currentMoves[i].pp}`,
                    inline: true
                },
            ])
            if (currentMoves[i].pwr == null)
                pokemonEmbed.addFields([{name: 'Power', value: `0`, inline: true}])
            else
                pokemonEmbed.addFields([{name: 'Power', value: `${currentMoves[i].pwr}`, inline: true}])

            // let category = await emojiListFunctions.getMoveCategory(currentMoves[i].category);
            pokemonEmbed.addFields([
                {
                    name: 'Type',
                    value: `${currentMoves[i].type}`,
                    inline: true
                },
                {
                    name: 'Category',
                    value: currentMoves[i].category,
                    inline: true
                }
            ])
        }

        const pokemonHpMultiplier = Math.round(module.exports.multiplierCalculation(pokemon.evLevels.hp));
        const pokemonElb = Math.round(module.exports.elbCalculation(pokemon.base.hp, pokemonHpMultiplier, pokemon.level));
        const maxHP = Math.round(module.exports.hpCalculation(pokemon.level, pokemon.base.hp, pokemonElb));
        let currentHP = maxHP - pokemon.damageTaken;

        let levelingRate = fullPokemonDetails.levelingRate;
        let xpNeededForNextLevel = module.exports.getCurrentTotalXpAtLevel(levelingRate, pokemon.level + 1) - module.exports.getCurrentTotalXpAtLevel(levelingRate, pokemon.level);


        if (pokemon.male) {
            pokemonEmbed.setTitle(`♀️ No. ${pokemon.pokeId} ${pokemon.nickname || pokemon.name} ${result} LVL: ${pokemon.level} HP: ${currentHP}/${maxHP} EXP: ${pokemon.exp}/${xpNeededForNextLevel}`);
        } else {
            pokemonEmbed.setTitle(`♂️ No. ${pokemon.pokeId} ${pokemon.nickname || pokemon.name} ${result} LVL: ${pokemon.level} HP: ${currentHP}/${maxHP} EXP: ${pokemon.exp}/${xpNeededForNextLevel}`);
        }

        if (pokemon.receivedTimestamp === pokemon.caughtTimestamp) {
            pokemonEmbed.setFooter({
                iconURL: `attachment://${pokeBall.sprite}`,
                text: 'Caught',
            })
        } else {
            pokemonEmbed.setFooter({
                iconURL: `attachment://${pokeBall.sprite}`,
                text: 'Traded',
            })
        }

        interaction.reply({
            embeds: [pokemonEmbed],
            files: [ballIcon, pokeIcon],
            ephemeral: true
        })
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
        // // // "Sketch",
        "Triple Kick",
        // // // "Thief",
        // // "Spider Web",
        "Mind Reader",
        // // "Nightmare",
        "Flame Wheel",
        "Snore",
        "Curse",
        "Flail",
        // // // "Conversion 2",
        "Aeroblast",
        "Cotton Spore",
        "Reversal",
        "Spite",
        "Powder Snow",
        "Protect",
        "Mach Punch",
        "Scary Face",
        "Feint Attack",
        "Sweet Kiss",
        "Belly Drum",
        "Sludge Bomb",
        "Mud Slap",
        "Octazooka",
        "Spikes",
        "Zap Cannon",
        // // "Foresight",
        "Destiny Bond",
        "Perish Song",
        "Icy Wind",
        "Detect",
        "Bone Rush",
        "Lock-On",
        "Outrage",
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