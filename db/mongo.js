const mongoose = require("mongoose");

const {mongoURL} = require("../config.json");

module.exports = async () => {
    mongoose.set('strictQuery', false);

    await mongoose.connect(mongoURL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    return mongoose;
};
