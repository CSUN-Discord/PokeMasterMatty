/*
This command sends a simple message to check if the bot is active
*/

const {SlashCommandBuilder} = require("@discordjs/builders");
const trainerFunctions = require("../db/functions/trainerFunctions");
const generalFunctions = require("../globals/generalFunctions");
const {MessageFlags, PermissionsBitField} = require("discord.js");
module.exports = {
    data: new SlashCommandBuilder()
        .setName("p-present")
        .setDescription("Claims a present if you have one available."),
    permission: [PermissionsBitField.Flags.SendMessages],

    /**
     *
     * @param interaction
     * @returns {Promise<void>}
     */
    async execute(interaction) {
        await interaction.deferReply({flags: MessageFlags.Ephemeral});

        // if (!(await pokemonGameFunctions.getPlaying(interaction.guild.id)))
        //     return interaction.editReply({
        //         content: "A game hasn't been started in this server.",
        //         flags: MessageFlags.Ephemeral
        //     });

        const user = await trainerFunctions.getUser(interaction.user.id);
        if (!await generalFunctions.allowedToUseCommand(user, interaction)) {
            return;
        }

        if (!user.presentReady)
            return interaction.editReply({
                content: `You're present isn't ready yet. You should get notified when it is.`,
                // flags: MessageFlags.Ephemeral
            });

        // const pokeBall = itemListFunctions.getItem("Poke Ball");
        // const greatBall = itemListFunctions.getItem("Great Ball");
        // const ultraBall = itemListFunctions.getItem("Ultra Ball");
        // const revive = itemListFunctions.getItem("Revive");
        // const potion = itemListFunctions.getItem("Potion");
        // const superPotion = itemListFunctions.getItem("Super Potion");
        // const hyperPotion = itemListFunctions.getItem("Hyper Potion");

        let pokeBallCount = 0;
        let greatBallCount = 0;
        let ultraBallCount = 0;
        let reviveCount = 0;
        let potionCount = 0;
        let superPotionCount = 0;
        let hyperPotionCount = 0;

        pokeBallCount = createItem(10, 50, pokeBallCount, user.bag, "Poke Ball", "poke-ball");
        greatBallCount = createItem(5, 25, greatBallCount, user.bag, "Great Ball", "poke-ball");
        ultraBallCount = createItem(3, 10, ultraBallCount, user.bag, "Ultra Ball", "poke-ball");
        reviveCount = createItem(1, 10, reviveCount, user.bag, "Revive", "recovery");
        potionCount = createItem(5, 35, potionCount, user.bag, "Potion", "recovery");
        superPotionCount = createItem(3, 25, superPotionCount, user.bag, "Super Potion", "recovery");
        hyperPotionCount = createItem(1, 10, hyperPotionCount, user.bag, "Hyper Potion", "recovery");

        let itemString = "You received: nothing."
        itemString = getItemString("Poke Ball", pokeBallCount, itemString);
        itemString = getItemString("Great Ball", greatBallCount, itemString);
        itemString = getItemString("Ultra Ball", ultraBallCount, itemString);
        itemString = getItemString("Revive", reviveCount, itemString);
        itemString = getItemString("Potion", potionCount, itemString);
        itemString = getItemString("Super Potion", superPotionCount, itemString);
        itemString = getItemString("Hyper Potion", hyperPotionCount, itemString);

        await interaction.editReply({
            content: itemString.trim() + ".",
            // flags: MessageFlags.Ephemeral
        });

        await trainerFunctions.addPresentToBag(user.userId, user.bag);
        setTimeout(() => {
            trainerFunctions.setPresent(user.userId, true);
            interaction.channel.send(`<@${user.userId}>, your present is ready to claim, just use /p-present.`);
        }, 21600000);
    },
};

function createItem(itemMax, percentage, itemCount, bag, name, category) {

    for (let i = 0; i < itemMax; i++) {
        if (generalFunctions.randomIntFromInterval(0, 100) < percentage) {
            itemCount++;
            if (bag[category].has(name)) {
                bag[category].set(name, bag[category].get(name) + 1)
            } else {
                bag[category].set(name, 1)
            }
        }
    }
    return itemCount;
}

function getItemString(itemName, quantity, itemString) {
    if (quantity > 0) {
        let tempString = itemString.replace("nothing.", "")
        return (tempString + `${itemName}: ${quantity} `)
    }
    return itemString;
}
