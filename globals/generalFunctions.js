const pokemonGameFunctions = require("../db/functions/pokemonGameFunctions");
module.exports = {

    randomIntFromInterval: function (min, max) { // min and max included
        return Math.floor(Math.random() * (max - min + 1) + min)
    },

    allowedToUseCommand: async function (user, interaction) {
        if (user == null) {
            interaction.reply({
                content: "You need to join the game. (/p-join)",
                ephemeral: true
            });
            return false;
        }

        if (!await pokemonGameFunctions.correctChannel(interaction.guild.id, interaction.channel.id)) {
            interaction.reply({
                content: "Incorrect game channel.",
                ephemeral: true
            });
            return false;
        }

        if (user.battling) {
            interaction.reply({
                content: `Finish your battle first.`,
                ephemeral: true
            });
            return false;
        }

        return true;
    }

}