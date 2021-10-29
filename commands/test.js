/*
This command sends a simple message to check if the bot is active
*/

let request = require("request");
let fs = require("fs");
const fetch = require('node-fetch');

const { SlashCommandBuilder } = require("@discordjs/builders");
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
};

function download (uri, filename, callback){
    request.head(uri, function(err, res, body){
        console.log('content-type:', res.headers['content-type']);
        console.log('content-length:', res.headers['content-length']);

        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};

function fetchAllMoves(url, id){
    fetch(url)
        .then(response => response.json())
        .then((moves) => {
            moves.results.forEach((move) => {
                try {
                    let url = move.url
                    fetch(url)
                        .then(response => response.json())
                        .then(function(moveData){
                            try {
                                let flavor;
                                try {
                                    flavor = moveData.flavor_text_entries.find(obj => {
                                        return obj.language.name === "en"
                                    }).flavor_text.replace(/(\r\n|\n|\r)/gm, " ").replace("­ ", "");
                                } catch (e) {
                                    flavor = null;
                                }
                                let name;
                                try {
                                    name = moveData.names.find(obj => {
                                        return obj.language.name === "en"
                                    }).name;
                                } catch (e) {
                                    name = moveData.name;
                                }

                                let move = {
                                    "id": moveData.id,
                                    "name": name,
                                    "type": "normal",
                                    "category": moveData.damage_class.name,
                                    "pp": moveData.pp,
                                    "pwr": moveData.power,
                                    "priority": moveData.priority,
                                    "acc": moveData.accuracy,
                                    "effect_chance": moveData.effect_chance,
                                    "flavorText": flavor
                                }

                                console.log(JSON.stringify(move) + ",")
                            } catch (e) {
                                console.log(e + " " + id + " " + moveData.name)
                            }
                        })
                }catch (e) {
                    console.log(e)
                }
            })
        })
}