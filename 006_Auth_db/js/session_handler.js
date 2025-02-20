const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");

// Проверяем, подключен ли уже Mongoose
if (mongoose.connection.readyState === 0) {
    mongoose.connect("mongodb://localhost:27017/USERS", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
}

module.exports = {
    createStore: function () {
        return MongoStore.create({
            client: mongoose.connection.getClient(), // Используем текущее подключение Mongoose
            collectionName: "sessions", // Можно указать коллекцию для хранения сессий
        });
    },
};
