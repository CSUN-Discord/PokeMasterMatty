/*
This command sends a simple message to check if the bot is active
*/

let request = require("request");
let fs = require("fs");
const fetch = require('node-fetch');
const Pokemon = require('pokemon.js');
Pokemon.setLanguage('english');
const pokemonName = require('pokemon');
const pokemonListFunctions = require("../db/functions/pokemonListFunctions")
const itemListFunctions = require("../db/functions/itemListFunctions")
const mergeImages = require('merge-images');
const {Canvas, Image} = require('canvas');
const base64Img = require('base64-img');

// const fs = require("fs");

const {SlashCommandBuilder} = require("@discordjs/builders");
const {MessageEmbed} = require("discord.js");
module.exports = {
    data: new SlashCommandBuilder()
        .setName("test")
        .setDescription("Tests things"),
    permission: ["ADMINISTRATOR"],

    /**
     *
     * @param interaction
     * @returns {Promise<void>}
     */
    async execute(interaction) {
        interaction.reply({content: "checking stuff", ephemeral: true});


        const hp = 35;
        const testEmbed = new MessageEmbed()
            .setColor('RANDOM')
            .setTitle(`test`)
            .addFields(
                {name: 'Regular field title', value: 'Some value here'},
                {name: '\u200B', value: '\u200B'},
                {name: 'Inline field title', value: '<:kami:789730583944757319>', inline: true},
                {name: 'Inline field title', value: 'Some value here', inline: true},
            )
            .setTimestamp()

        interaction.channel.send({embeds: [testEmbed]})


        // mergeImages(['/body.png', '/eyes.png', '/mouth.png'])
        //     .then(b64 => document.querySelector('img').src = b64);

        // mergeImages(['./media/body.png', './media/eyes.png'], {
        //     Canvas: Canvas,
        //     Image: Image
        // }).then(b64 => {
        //     console.log(b64)
        // })
        // async b64 => {
        //     console.log(b64)
        //     // base64Img.img(b64, '/media/', 'test.png', function (err, filepath) {
        //     // });
        //     // const buffer = Buffer.from(b64, "base64");
        //     // const base64 = fs.readFileSync("./media/test.png", "base64");
        //     // let temp = "data:image/png;base64," + b64;
        //     // temp.download = "./media/test.png";
        //     // await download(encodeURI(b64), `./media/test.png`, function () {
        //     //     console.log('done');
        //     // });
        // }
        // )


// for (let i = 1; i < 151; i++) {
//     try {
//         let name;
//         try {
//             name = pokemonName.getName(i).toLowerCase();
//         } catch (e) {
//             console.log(e + " " + name)
//         }
//
//         try {
//             await download(encodeURI(`http://play.pokemonshowdown.com/sprites/ani/${name}.gif`), `./media/pokemon/normal-gif/front/${i}.gif`, function () {
//                 // console.log('done');
//             });
//             await download(encodeURI(`http://play.pokemonshowdown.com/sprites/ani-back/${name}.gif`), `./media/pokemon/normal-gif/back/${i}.gif`, function () {
//                 // console.log('done');
//             });
//
//             await download(encodeURI(`http://play.pokemonshowdown.com/sprites/ani-shiny/${name}.gif`), `./media/pokemon/shiny-gif/front/${i}.gif`, function () {
//                 // console.log('done');
//             });
//
//             await download(encodeURI(`http://play.pokemonshowdown.com/sprites/ani-back-shiny/${name}.gif`), `./media/pokemon/shiny-gif/back/${i}.gif`, function () {
//                 // console.log('done');
//             });
//         } catch (e) {
//             console.log(e + " " + name)
//         }
//     } catch (e) {
//         console.log(e + " pokemon id " + i)
//     }
// }

// const item = {
//     name: "Beast Ball",
//     sprite: "beastball.png",
//     description: "A special Poke Ball designed to catch Ultra Beasts. It has a low success rate for catching others.",
//     uses: 1,
//     usable: false,
//     fling: null,
//     category: "poke-ball",
//     purchase: 0,
//     sell: 0
// };
// await itemListFunctions.addItem(item);

// pokemonListFunctions.getAllPokemon();

// https://www.smogon.com/dex/media/sprites/xy/bulbasaur.gif


// for (let i = 1; i < 899; i++) {
//     try {
//         const name = pokemonName.getName(i).toLowerCase();
//         await interaction.channel.send({files: [`https://www.smogon.com/dex/media/sprites/xy/${name}.gif`]})
//     } catch (e) {
//         console.log(e + " pokemon id " + i)
//     }
// }


// Pokemon.getAbility(1).then(console.log);

// for (let i = 1; i < 152; i++) {
//     const pokeId = i;
//     const name = pokemonName.getName(i)
//     const spawnRate = null;
//     const weight = null;
//     const height = null;
//     const description = null;
//     let types = [];
//     Pokemon.getType(i).then((res) => {
//         res.forEach((type) => {
//             // console.log(type.name)
//             types.push(type.name);
//         })
//         let baseStats;
//         Pokemon.getStats(i).then((res2) => {
//             baseStats = res2;
//
//             const baseFriendship = null;
//             const evolutionType = null;
//             let abilities = [];
//             Pokemon.getAbility(i).then((res3) => {
//                 abilities = res3;
//
//                 const catchRate = null;
//                 const levelingRate = null;
//                 const baseExperience = null;
//                 const EVYield = {
//                     "hp": 0,
//                     "atk": 0,
//                     "def": 0,
//                     "spAtk": 0,
//                     "spDef": 0,
//                     "speed": 0
//                 };
//                 const moves = null;
//
//                 pokemonListFunctions.addPokemon(pokeId, name, spawnRate, weight, height, description, types,
//                     baseStats, baseFriendship, evolutionType, abilities, catchRate, levelingRate, baseExperience,
//                     EVYield, moves)
//             });
//
//         });
//
//     });
// }

// for (let i = 1; i < 899; i++) {
//     try {
//         // let num = i + "";
//                 // if (num < 10)
//                 //     num = "00" + num;
//                 // else if (num < 100)
//                 //     num = "0" + num
//         await download(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${i}.png`, `./media/pokemon/normal-icons/${i}.png`, function(){
//             // console.log('done');
//         });
//
//         await download(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/${i}.png`, `./media/pokemon/shiny-icons/${i}.png`, function(){
//             // console.log('done');
//         });
//
//         await download(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-viii/icons/${i}.png`, `./media/pokemon/box-icons/${i}.png`, function(){
//             // console.log('done');
//         });
//
//     }catch (e) {
//         console.log(e + " pokemon id " + i)
//     }
// }

// for (let i = 1; i < 899; i++) {
//     try {
//         let num = i + "";
//         if (num < 10)
//             num = "00" + num;
//         else if (num < 100)
//             num = "0" + num
//         await interaction.channel.send({files: [`https://pokecharms.com/data/trainercardmaker/pokemon/${num}-30.png`]})
//     }catch (e) {
//         console.log(e + " pokemon id " + i)
//     }
// }

// for (let i = 0; i < 900; i++) {
//     if (i > 826) {
//
//     } else {
//         try {
//             fetchAllMoves(`https://pokeapi.co/api/v2/move/?offset=${i}&limit=${1}`, i)
//         }catch (e) {
//             console.log(e)
//         }
//     }
// }
//   fetchAllMoves("https://pokeapi.co/api/v2/move/max-starfall/")
    },
}


// function download(uri, filename, callback) {
//     try {
//         request.head(uri, function (err, res, body) {
//             if (err) console.log(err)
//
//             request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
//         });
//     } catch (e) {
//         console.log(e)
//         console.log(uri)
//     }
//
// }
//
//
// function fetchAllMoves(url, id) {
//     fetch(url)
//         .then(response => response.json())
//         .then((moves) => {
//             moves.results.forEach((move) => {
//                 try {
//                     let url = move.url
//                     fetch(url)
//                         .then(response => response.json())
//                         .then(function (moveData) {
//                             try {
//                                 let flavor;
//                                 try {
//                                     flavor = moveData.flavor_text_entries.find(obj => {
//                                         return obj.language.name === "en"
//                                     }).flavor_text.replace(/(\r\n|\n|\r)/gm, " ").replace("­ ", "");
//                                 } catch (e) {
//                                     flavor = null;
//                                 }
//                                 let name;
//                                 try {
//                                     name = moveData.names.find(obj => {
//                                         return obj.language.name === "en"
//                                     }).name;
//                                 } catch (e) {
//                                     name = moveData.name;
//                                 }
//
//                                 let move = {
//                                     "id": moveData.id,
//                                     "name": name,
//                                     "type": "normal",
//                                     "category": moveData.damage_class.name,
//                                     "pp": moveData.pp,
//                                     "pwr": moveData.power,
//                                     "priority": moveData.priority,
//                                     "acc": moveData.accuracy,
//                                     "effect_chance": moveData.effect_chance,
//                                     "flavorText": flavor
//                                 }
//
//                                 console.log(JSON.stringify(move) + ",")
//                             } catch (e) {
//                                 console.log(e + " " + id + " " + moveData.name)
//                             }
//                         })
//                 } catch (e) {
//                     console.log(e)
//                 }
//             })
//         })
// }