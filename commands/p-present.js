/*
This command allows users to claim a present if they have one available.
*/

const {SlashCommandBuilder} = require("@discordjs/builders");
const trainerFunctions = require("../db/functions/trainerFunctions");
const generalFunctions = require("../globals/generalFunctions");
const {MessageFlags, PermissionsBitField} = require("discord.js");

const SIX_HOURS = 21600000;  // Constant for 6 hours in milliseconds

module.exports = {
    data: new SlashCommandBuilder()
        .setName("p-present")
        .setDescription("Claims a present if you have one available."),
    permission: [PermissionsBitField.Flags.SendMessages],

    /**
     * Executes the /p-present command to allow users to claim a present.
     * @param {import("discord.js").Interaction} interaction - The interaction object.
     * @returns {Promise<void>}
     */
    async execute(interaction) {
        await interaction.deferReply({
            flags: MessageFlags.Ephemeral
        });

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
            });

        // Create and count the items in the user's bag
        let pokeBallCount = createItem(10, 50, user.bag, "Poke Ball", "poke-ball");
        let greatBallCount = createItem(5, 25, user.bag, "Great Ball", "poke-ball");
        let ultraBallCount = createItem(3, 10, user.bag, "Ultra Ball", "poke-ball");
        let reviveCount = createItem(1, 10, user.bag, "Revive", "recovery");
        let potionCount = createItem(5, 35, user.bag, "Potion", "recovery");
        let superPotionCount = createItem(3, 25, user.bag, "Super Potion", "recovery");
        let hyperPotionCount = createItem(1, 10, user.bag, "Hyper Potion", "recovery");

        // Build the string of items the user has received
        let itemString = "You received:";
        itemString = appendItemString("Poke Ball", pokeBallCount, itemString);
        itemString = appendItemString("Great Ball", greatBallCount, itemString);
        itemString = appendItemString("Ultra Ball", ultraBallCount, itemString);
        itemString = appendItemString("Revive", reviveCount, itemString);
        itemString = appendItemString("Potion", potionCount, itemString);
        itemString = appendItemString("Super Potion", superPotionCount, itemString);
        itemString = appendItemString("Hyper Potion", hyperPotionCount, itemString);

        // Respond to the user with the items they've received
        await interaction.editReply({
            content: itemString.trim() + ".",
        });

        // Add the present to the user's bag and notify them when it is ready to claim again
        await trainerFunctions.addPresentToBag(user.userId, user.bag);

        setTimeout(() => {
            trainerFunctions.setPresent(user.userId, true);
            interaction.channel.send(`<@${user.userId}>, your present is ready to claim, just use /p-present.`);
        }, SIX_HOURS);
    },
};

/**
 * Creates an item and adds it to the user's bag if it meets the percentage chance.
 * @param {number} itemMax - The maximum number of times the item can be added.
 * @param {number} percentage - The percentage chance of adding the item.
 * @param {Object} bag - The user's bag where items will be stored.
 * @param {string} name - The name of the item.
 * @param {string} category - The category in the bag where the item will be added.
 * @returns {number} - The number of items created.
 */
function createItem(itemMax, percentage, bag, name, category) {
    let itemCount = 0;

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

/**
 * Appends a formatted string for an item if its quantity is greater than 0.
 * @param {string} itemName - The name of the item.
 * @param {number} quantity - The quantity of the item.
 * @param {string} itemString - The existing string that will be updated.
 * @returns {string} - The updated string with the item's information.
 */
function appendItemString(itemName, quantity, itemString) {
    if (quantity > 0) {
        return `${itemString}\n• ${itemName}: ${quantity}`;
    }
    return itemString;
}