/*
event that happens on start up to display activity
 */

const mongo = require("../db/mongo");
let dbObjects = require("../db/dbObjects");
const trainerFunctions = require("../db/functions/trainerFunctions");
const pokemonGameFunctions = require("../db/functions/pokemonGameFunctions");
const battlingFunctions = require("../db/functions/battlingFunctions");

module.exports = {
    name: "ready",
    once: true,
    /**
     * @param {Client} client
     */
    async execute(client) {
        client.user.setActivity("Pokemon.", {
            type: "PLAYING",
        });

        await mongo().then(async (mongoose) => {
            console.log(`Connected to mongoDB.`);
            dbObjects.mongoo = mongoose;
        });

        trainerFunctions.resetAllPresents()
        pokemonGameFunctions.resetAllGames()
        battlingFunctions.deleteAllBattles()

        console.log(`Ready! Logged in as ${client.user.tag}`);
    },
};
