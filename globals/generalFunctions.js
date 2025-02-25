const pokemonGameFunctions = require("../db/functions/pokemonGameFunctions");
const {MessageFlags} = require("discord.js");
module.exports = {

    //TODO: create a function that replies to an interaction with .reply or .editReply, then have all replies come from this function

    randomIntFromInterval: function (min, max) { // min and max included
        return Math.floor(Math.random() * (max - min + 1) + min)
    },

    allowedToUseCommand: async function (user, interaction) {
        const response = {
            content: "",
            flags: MessageFlags.Ephemeral
        };

        if (user == null) {
            response.content = "You need to join the game. (/p-join)";
            try {
                if (interaction.deferred) {
                    await interaction.editReply(response);
                } else {
                    await interaction.reply(response);
                }
            } catch (e) {
                console.error("Error saying you need to join the game:", e);
            }
            return false;
        }

        if (!await pokemonGameFunctions.correctChannel(interaction.guild.id, interaction.channel.id)) {
            response.content = "Incorrect game channel.";
            try {
                if (interaction.deferred) {
                    await interaction.editReply(response);
                } else {
                    await interaction.reply(response);
                }
            } catch (e) {
                console.error("Error saying you need to use the correct game channel:", e);
            }
            return false;
        }

        if (user.battling) {
            response.content = "Finish your battle first.";
            try {
                if (interaction.deferred) {
                    await interaction.editReply(response);
                } else {
                    await interaction.reply(response);
                }
            } catch (e) {
                console.error("Error saying you need to finish your battle first:", e);
            }
            return false;
        }

        return true;
    }

}