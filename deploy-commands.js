const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, token, guildId } = require('./config.json');

const commands = []
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(token);
rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
    .then(() => console.log('Successfully registered guild application commands.'))
    .catch(console.error);

// const rest = new REST({ version: '9' }).setToken(token);
// rest.put(Routes.applicationCommands(clientId), { body: commands })
//     .then(() => console.log('Successfully registered global application commands.'))
//     .catch(console.error);

