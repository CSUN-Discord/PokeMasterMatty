const emojiListSchema = require("../schemas/emojiListSchema");

// const updateField = async (fieldPath, key, value) => {
//     try {
//         await emojiListSchema.findOneAndUpdate(
//             {},
//             {
//                 $set: {
//                     [`${fieldPath}.${key}`]: value
//                 }
//             },
//             {
//                 upsert: true
//             }
//         ).exec();
//     } catch (e) {
//         console.error("Error updating field:", e);
//     }
// };

const getField = async (fieldPath, key) => {
    try {
        const emojiList = await emojiListSchema.findOne({}).exec();
        return emojiList?.[fieldPath]?.get(key) || null;
    } catch (e) {
        console.error("Error fetching field:", e);
        return null;
    }
};

module.exports = {
    // addBoxIcon: (pokemon, emoji) => updateField("boxIcon", pokemon, emoji),
    //
    // addNormalGif: (pokemon, emoji) => updateField("normalGif", pokemon, emoji),
    //
    // addShinyGif: (pokemon, emoji) => updateField("shinyGif", pokemon, emoji),
    //
    // addMoveType: (type, emoji) => updateField("moveType", type, emoji),
    //
    // addMoveCategory: (category, emoji) => updateField("moveCategory", category, emoji),
    //
    // getBoxIcon: (pokeId) => getField("boxIcon", pokeId.toString()),

    getNormalGif: (pokeId) => getField("normalGif", pokeId.toString()),

    getShinyGif: (pokeId) => getField("shinyGif", pokeId.toString()),

    // getMoveCategory: (category) => getField("moveCategory", category),
    //
    // getMoveType: (type) => getField("moveType", type),
};