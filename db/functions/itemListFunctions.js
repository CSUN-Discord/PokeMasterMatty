const itemsListSchema = require("../schemas/itemsListSchema");

module.exports = {
    addItem: async function (item) {
        try {
            await itemsListSchema
                .findOneAndUpdate(
                    {
                        name: item.name,
                    },
                    {
                        $set: {
                            sprite: item.sprite,
                            description: item.description,
                            uses: item.uses,
                            usable: item.uses,
                            fling: item.fling,
                            category: item.category,
                            purchase: item.purchase,
                            sell: item.sell
                        },
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
}