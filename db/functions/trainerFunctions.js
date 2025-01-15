const trainerSchema = require("../schemas/trainerSchema");

module.exports = {
    resetAllPresents: function () {
        try {
            trainerSchema
                .updateMany(
                    {}, {
                        $set: {
                            presentReady: true
                        }
                    }, (err, res) => {
                        if (err) {
                            console.error("Error resetting presents:", err);
                        } else console.log(`Reset ${res.modifiedCount} presents.`)
                    });
        } catch (e) {
            console.error("Error resetting presents:", e);
        }
    },

    getUser: async function (userId) {
        try {
            return await trainerSchema.findOne(
                {
                    userId: userId
                });
        } catch (e) {
            console.error(`Error fetching user ${userId}:`, e);
        }
    },

    setBattling: async function (userId, inBattle) {
        try {
            await trainerSchema
                .findOneAndUpdate(
                    {
                        userId: userId,
                    },
                    {
                        $set: {
                            battling: inBattle
                        }
                    },
                    {
                        upsert: false,
                    }
                )
                .exec();
        } catch (e) {
            console.error(`Error updating user ${userId}:`, e);
        }
    },

    resetBattling: async function () {
        try {
            await trainerSchema
                .updateMany(
                    {},
                    {
                        $set: {
                            battling: false
                        }
                    }
                )
                .exec();
        } catch (e) {
            console.error(`Error resetting battles:`, e);
        }
    },

    setBag: async function (userId, bag) {
        try {
            await trainerSchema
                .findOneAndUpdate(
                    {
                        userId: userId,
                    },
                    {
                        $set: {
                            bag: bag
                        }
                    },
                    {
                        upsert: false,
                    }
                )
                .exec();
        } catch (e) {
            console.log(e);
        }
    },

    setTeam: async function (userId, team) {
        try {
            await trainerSchema
                .findOneAndUpdate(
                    {
                        userId: userId,
                    },
                    {
                        $set: {
                            team: team
                        }
                    },
                    {
                        upsert: false,
                    }
                )
                .exec();
        } catch (e) {
            console.log(e);
        }
    },

    setBox: async function (userId, box) {
        try {
            await trainerSchema
                .findOneAndUpdate(
                    {
                        userId: userId,
                    },
                    {
                        $set: {
                            pokebox: box
                        }
                    },
                    {
                        upsert: false,
                    }
                )
                .exec();
        } catch (e) {
            console.log(e);
        }
    },

    addPokemonToUser: async function (user, newPokemon) {
        let player = await module.exports.getUser(user.id);
        if (player == null) {
            await addUser(user);
            player = await module.exports.getUser(user.id);
        }

        if (player.team.length < 6) {
            // newPokemon.teamNumber = player.team.length + 1;
            newPokemon.status = "normal";
            await module.exports.addPokemonToTeam(user.id, newPokemon);
        } else {
            // newPokemon.boxNumber = player.team.length + 1;
            newPokemon.status = "normal";
            newPokemon.damageTaken = 0;
            await module.exports.addPokemonToBox(user.id, newPokemon);
        }
    },

    addPokemonToCreatedUser: async function (userId, newPokemon) {
        let player = await module.exports.getUser(userId);
        if (player == null) {
            console.error("Error getting user to add pokemon.")
        }

        if (player.team.length < 6) {
            // newPokemon.teamNumber = player.team.length + 1;
            newPokemon.status = "normal";
            await module.exports.addPokemonToTeam(userId, newPokemon);
        } else {
            // newPokemon.boxNumber = player.team.length + 1;
            newPokemon.status = "normal";
            newPokemon.damageTaken = 0;
            await module.exports.addPokemonToBox(userId, newPokemon);
        }
    },

    addPresentToBag: async function (userId, bag) {
        try {
            await trainerSchema
                .findOneAndUpdate(
                    {
                        userId: userId,
                    },
                    {
                        bag: bag,
                        presentReady: false
                    },
                    {
                        upsert: false,
                    }
                )
                .exec();
        } catch (e) {
            console.error(`Error adding present for user ${userId}:`, e);
        }
    },

    setPresent: async function (userId, ready) {
        try {
            await trainerSchema
                .findOneAndUpdate(
                    {
                        userId: userId,
                    },
                    {
                        presentReady: ready
                    },
                    {
                        upsert: false,
                    }
                )
                .exec();
        } catch (e) {
            console.error(`Error setting present for user ${userId}:`, e);
        }
    },

    setMoney: async function (userId, money) {
        try {
            await trainerSchema
                .findOneAndUpdate(
                    {
                        userId: userId,
                    },
                    {
                        $set: {
                            money: money
                        }
                    },
                    {
                        upsert: false,
                    }
                )
                .exec();
        } catch (e) {
            console.error(`Error setting money for user ${userId}:`, e);
        }
    },
    addPokemonToTeam: async function (userId, pokemon) {
        try {
            await trainerSchema
                .findOneAndUpdate(
                    {
                        userId: userId,
                    },
                    {
                        $push: {
                            team: pokemon
                        }
                    },
                    {
                        upsert: false,
                    }
                )
                .exec();
        } catch (e) {
            console.error(`Error adding Pokemon to team for user ${userId}:`, e);
        }
    },

    addPokemonToBox: async function (userId, pokemon) {
        try {
            await trainerSchema
                .findOneAndUpdate(
                    {
                        userId: userId,
                    },
                    {
                        $push: {
                            pokebox: pokemon
                        }
                    },
                    {
                        upsert: false,
                    }
                )
                .exec();
        } catch (e) {
            console.error(`Error adding Pokemon to box for user ${userId}:`, e);
        }
    },

    removeUser: async function (userId) {
        try {
            await trainerSchema
                .deleteOne(
                    {
                        userId: userId,
                    },
                    {}
                )
                .exec();
        } catch (e) {
            console.error(`Error removing user ${userId}:`, e);
        }
    }
}

async function addUser(user) {
    const defaultData = {
        userId: user.id,
        name: user.username,
        pokebox: [],
        team: [],
        bag: {
            "battle-effect": new Map(),
            "hold-items": new Map(),
            "poke-ball": new Map(),
            miscellaneous: new Map(),
            recovery: new Map(),
            vitamins: new Map()
        },
        storyProgress: "0",
        trainerCard: {
            background: "/media/trainer-card/backgroundsOriginals/general/(1).png",
            trainerSprite: "/media/trainer-card/sprites/heartGold-soulSilver/(1).png"
        },
        money: 3000,
        battling: false,
        achievements: new Map(),
        badges: new Map(),
        trainerBattles: {
            win: 0,
            loss: 0
        },
        npc: {
            win: 0,
            loss: 0
        },
        presentReady: true
    };

    try {
        await trainerSchema
            .findOneAndUpdate(
                {
                    userId: user.id,
                },
                defaultData,
                {
                    upsert: true,
                }
            )
            .exec();
    } catch (e) {
        console.error(`Error adding user ${user.id}:`, e);
    }
}

