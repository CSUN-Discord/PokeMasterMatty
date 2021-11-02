const movesListSchema = require("../schemas/movesListSchema");

module.exports = {
    getMove: function (name) {
        try {
            movesListSchema
                .findOne(
                    {
                        name: name
                    }, (err, docs) => {
                        if (err) console.log(err + "with the name:" + name)
                        else {
                            console.log(name + " true")
                        }
                    });
        } catch (e) {
            console.log(e);
        }
    },
}