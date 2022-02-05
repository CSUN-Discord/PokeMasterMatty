// Import classes and files

const {token} = require("./config.json");
const {Client, Collection} = require("discord.js");
const fs = require('fs');

const dbObjects = require("./db/dbObjects");

// Create a new discord client
const client = new Client({intents: 32767, partials: ['MESSAGE', 'REACTION', 'USER']});
exports.client = client;

//create a collection to store all the commands
client.commands = new Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

//command handler
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

//get the events handler
require("./handlers/events")(client);

// This will handle process.exit():
process.on("exit", () => {
    if (dbObjects.mongoo)
        dbObjects.mongoo.connection.close().then(() => {
            console.log("MongoDb connection closed.");
            console.error("exit");
            process.exit();
        });
    else {
        console.error("exit");
        process.exit();
    }
});

// This will handle kill commands, such as CTRL+C:
process.on("SIGINT", () => {
    if (dbObjects.mongoo)
        dbObjects.mongoo.connection.close().then(() => {
            console.log("MongoDb connection closed.");
            console.error("SIGINT");
            process.exit();
        });
    else {
        console.error("SIGINT");
        process.exit();
    }
});
process.on("SIGTERM", () => {
    if (dbObjects.mongoo)
        dbObjects.mongoo.connection.close().then(() => {
            console.log("MongoDb connection closed.");
            console.error("SIGTERM");
            process.exit();
        });
    else {
        console.error("SIGTERM");
        process.exit();
    }
});

// This will prevent dirty exit on code-fault crashes:
process.on("uncaughtException", (err) => {
    console.error(err.stack)
    if (dbObjects.mongoo)
        dbObjects.mongoo.connection.close().then(() => {
            console.log("MongoDb connection closed.");
            console.error(`uncaughtException:  ${err}`);
            process.exit();
        });
    else {
        console.error(`uncaughtException:  ${err}`);
        process.exit();
    }
});

//start the bot with the token from the config file
client.login(token);
