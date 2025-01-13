/*
This command deletes a user
*/

const {SlashCommandBuilder} = require("@discordjs/builders");
const trainerFunctions = require("../db/functions/trainerFunctions");
const {ActionRowBuilder, ButtonBuilder, MessageFlags, PermissionsBitField} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("p-leave")
        .setDescription("Deletes user's trainer account."),
    permission: [PermissionsBitField.Flags.SendMessages],

    /**
     * Command execution to remove the user from the game.
     * @param {import("discord.js").Interaction} interaction - The interaction object.
     * @returns {Promise<void>}
     */
    async execute(interaction) {
        // Get the user from the database
        const user = await trainerFunctions.getUser(interaction.user.id);

        // Check if the user is in the game
        if (user == null) {
            return interaction.reply({
                content: "You are not in the game.",
                flags: MessageFlags.Ephemeral
            });
        }

        // Ask for confirmation before removing the account
        await interaction.reply({
            content: "Are you sure you want to delete your account? This action cannot be undone. Please confirm by clicking 'Yes' or 'No'.",
            flags: MessageFlags.Ephemeral,
            components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId("confirm_yes")
                        .setLabel("Yes")
                        .setStyle("Danger"),
                    new ButtonBuilder()
                        .setCustomId("confirm_no")
                        .setLabel("No")
                        .setStyle("Secondary")
                )
            ]
        });

        // Create a collector for button interactions
        const filter = (i) => i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({filter, time: 30000});

        collector.on('collect', async (i) => {
            if (i.customId === "confirm_yes") {
                try {
                    // Remove the user from the database
                    await trainerFunctions.removeUser(interaction.user.id);
                    await i.update({
                        content: "Your account has been successfully removed.",
                        components: []
                    });
                } catch (error) {
                    console.error("Error removing user:", error);
                    await i.update({
                        content: "There was an error while removing your account. Please try again.",
                        components: []
                    });
                }
            } else {
                await i.update({
                    content: "Account deletion was canceled.",
                    components: []
                });
            }
        });

        collector.on('end', async () => {
            await interaction.editReply({
                    content: "Time limit exceeded.",
                    components: []
                }
            );
        });
    },
};
