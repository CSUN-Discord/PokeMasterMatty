const emojiListSchema = require("../schemas/emojiListSchema");

module.exports = {
    addBoxIcon: async function (pokemon, emoji) {
        try {
            await emojiListSchema
                .findOneAndUpdate(
                    {},
                    {
                        $set: {
                            [`boxIcon.${pokemon}`]: emoji
                        }
                    },
                    {
                        upsert: true,
                    }
                )
                .exec();
        } catch (e) {
            console.log(e);
        }
    },
    addNormalGif: async function (pokemon, emoji) {
        try {
            await emojiListSchema
                .findOneAndUpdate(
                    {},
                    {
                        $set: {
                            [`normalGif.${pokemon}`]: emoji
                        }
                    },
                    {
                        upsert: true,
                    }
                )
                .exec();
        } catch (e) {
            console.log(e);
        }
    },
    addShinyGif: async function (pokemon, emoji) {
        try {
            await emojiListSchema
                .findOneAndUpdate(
                    {},
                    {
                        $set: {
                            [`shinyGif.${pokemon}`]: emoji
                        }
                    },
                    {
                        upsert: true,
                    }
                )
                .exec();
        } catch (e) {
            console.log(e);
        }
    },

    getBoxIcon: function (pokeId) {
        return new Promise((resolve, reject) => {
            try {
                emojiListSchema
                    .findOne({}, (err, emojiList) => {
                        if (err) {
                            // console.log(err);
                            reject(err);
                        } else {
                            const boxIconValue = emojiList.boxIcon.get(pokeId.toString());
                            console.log(pokeId, emojiList.boxIcon.get(pokeId.toString()));
                            resolve(boxIconValue);
                        }
                    })
            } catch (e) {
                reject(e);
            }
        });
    },

    getNormalGif: async function (pokeId) {
        return new Promise((resolve, reject) => {
            try {
                emojiListSchema
                    .findOne({}, (err, emojiList) => {
                        if (err) {
                            // console.log(err);
                            reject(err);
                        } else {
                            const boxIconValue = emojiList.normalGif.get(pokeId.toString());
                            console.log(pokeId, emojiList.normalGif.get(pokeId.toString()));
                            resolve(boxIconValue);
                        }
                    })
            } catch (e) {
                reject(e);
            }
        });
    },

    getShinyGif: async function (pokeId) {
        return new Promise((resolve, reject) => {
            try {
                emojiListSchema
                    .findOne({}, (err, emojiList) => {
                        if (err) {
                            // console.log(err);
                            reject(err);
                        } else {
                            const boxIconValue = emojiList.shinyGif.get(pokeId.toString());
                            console.log(pokeId, emojiList.shinyGif.get(pokeId.toString()));
                            resolve(boxIconValue);
                        }
                    })
            } catch (e) {
                reject(e);
            }
        });
    },
}