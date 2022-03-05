const movesListSchema = require("../schemas/movesListSchema");

module.exports = {
    getMove: async function (name) {
        try {
            return await movesListSchema
                .findOne(
                    {
                        name: name,
                    }
                )
                .exec();
        } catch (e) {
            console.log(e);
        }
    },

    updateMove: async function (id, type) {
        try {
            return await movesListSchema
                .findOneAndUpdate(
                    {
                        id: id,
                    },
                    {
                        type: type
                    }
                )
        } catch (e) {
            console.log(`${id}: ${e}`);
        }
    },
}