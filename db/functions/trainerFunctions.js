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

    addUser: async function (user) {
        try {
            await trainerSchema
                .findOneAndUpdate(
                    {
                        userId: user.id,
                    },
                    {},
                    {
                        upsert: true,
                    }
                )
                .exec();
        } catch (e) {
            console.log(e);
        }
    },
}