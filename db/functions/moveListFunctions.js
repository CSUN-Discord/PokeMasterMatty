const movesListSchema = require("../schemas/movesListSchema");

module.exports = {
    getMove: async function (name) {
        try {
            return await movesListSchema
                .findOne(
                    {
                        name: name
                    }
                )
                .exec();
        } catch (e) {
            console.error("Error getting move: " + e);
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
            console.error(`Error updating move: ${id}` + e);
        }
    },
}