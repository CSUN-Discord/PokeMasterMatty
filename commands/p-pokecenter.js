/*
This command sends a simple message to check if the bot is active
*/

const {SlashCommandBuilder} = require("@discordjs/builders");
const trainerFunctions = require("../db/functions/trainerFunctions");
const generalFunctions = require("../globals/generalFunctions");
const {PermissionsBitField, MessageFlags} = require("discord.js");


module.exports = {
    data: new SlashCommandBuilder()
        .setName("p-pokecenter")
        .setDescription("Heal your pokemon for a price.")
        .addSubcommand(subcommand =>
            subcommand
                .setName('heal_all')
                .setDescription('Heal full team.')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('heal_one')
                .setDescription('Heal a single pokemon.')
                .addIntegerOption(option =>
                    option.setName('team_number')
                        .setDescription('Choose the team number of the pokemon.')
                        .setRequired(true)
                        .addChoices(
                            {name: '1', value: 1},
                            {name: '2', value: 2},
                            {name: '3', value: 3},
                            {name: '4', value: 4},
                            {name: '5', value: 5},
                            {name: '6', value: 6},
                        )
                )
        ),
    permission: [PermissionsBitField.Flags.SendMessages],

    /**
     *
     * @param interaction
     * @returns {Promise<void>}
     */
    async execute(interaction) {
        await interaction.deferReply({flags: MessageFlags.Ephemeral});

        const user = await trainerFunctions.getUser(interaction.user.id);
        if (!await generalFunctions.allowedToUseCommand(user, interaction)) {
            return;
        }

        const {options} = interaction;
        const sub = options.getSubcommand();

        switch (sub) {
            case "heal_all":

                for (let i = 0; i < user.team.length; i++) {
                    await heal(user, i);
                }

                await interaction.editReply({
                    content: "Team was healed.",
                })
                break;
            case "heal_one":
                const teamNumber = options.getInteger('team_number');

                if (teamNumber > user.team.length)
                    return interaction.editReply({
                        content: `Couldn't find the pokemon to heal.`,
                    });

                await heal(user, teamNumber - 1);

                await interaction.editReply({
                    content: `${user.team[teamNumber - 1].nickname || user.team[teamNumber - 1].name} was healed.`,
                });
                break;
            default:
                await interaction.editReply({
                    content: "Couldn't process command.",
                });
                break;
        }
    },
};

async function heal(user, teamIndex) {

    const toHeal = user.team[teamIndex];

    //TODO: Calculate the base cost as a percentage of the player's current money.
    // check if user can heal
    // const baseCost = Math.round(user.money * 0.005);
    // const healingCost = Math.min(Math.round(baseCost + (3 * toHeal.damageTaken)), 3000);

    // if (user.money < healingCost) {
    //     return await interaction.editReply({
    //         content: `You don't have enough money to heal ${toHeal.nickname || toHeal.name}. Cost: ${healingCost}`,
    //     });
    // }

    console.log(toHeal.damageTaken)

    // Heal the Pokémon
    toHeal.status = "normal";
    toHeal.damageTaken = 0;
    for (const move of toHeal.currentMoves) {
        move.currentPP = move.pp;
    }

    // user.money -= healingCost;

    await trainerFunctions.setTeam(user.userId, user.team);

}