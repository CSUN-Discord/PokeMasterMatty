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
                        if (err) console.log(err);
                        else console.log(`Reset ${res.modifiedCount} presents.`)
                    });
        } catch (e) {
            console.log(e);
        }
    },

    getUser: async function (userId) {
        try {
            return await trainerSchema.findOne(
                {
                    userId: userId
                });
        } catch (e) {

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
            console.log(e);
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

    addPokemonToUser: async function (user, newPokemon) {
        let player = await module.exports.getUser(user.id);
        if (player == null) {
            await addUser(user);
            player = await module.exports.getUser(user.id);
        }

        if (player.team.length < 6) {
            // newPokemon.teamNumber = player.team.length + 1;
            await addPokemonToTeam(user.id, newPokemon);
        } else {
            // newPokemon.boxNumber = player.team.length + 1;
            await addPokemonToBox(user.id, newPokemon);
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
            console.log(e);
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
            console.log(e);
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
            console.log(e);
        }
    },
}

async function addPokemonToTeam(userId, pokemon) {
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
        console.log(e);
    }
}

async function addPokemonToBox(userId, pokemon) {
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
        console.log(e);
    }
}

async function addUser(user) {
    try {
        await trainerSchema
            .findOneAndUpdate(
                {
                    userId: user.id,
                },
                {
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
                },
                {
                    upsert: true,
                }
            )
            .exec();
    } catch (e) {
        console.log(e);
    }
}

