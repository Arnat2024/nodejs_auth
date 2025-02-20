const mongoose = require("mongoose");
const pass_handler = require("./password_handler");

// Подключение к MongoDB
if (mongoose.connection.readyState === 0) {
mongoose.connect("mongodb://127.0.0.1:27017/USERS", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
}

// Определение схемы пользователя
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
});

// Создание модели пользователя
const User = mongoose.model("User", userSchema);

module.exports = {
    // Получение списка пользователей
    get_users: async function (req, res) {
        try {
            const users = await User.find();
            const docs = users.map((row) => `<h3>${row.username}</h3>`);

            res.send(docs.join(""));
        } catch (err) {
            console.error("Ошибка при получении пользователей:", err);
            res.status(500).send("Ошибка сервера");
        }
    },

    // Добавление нового пользователя
    add_user: async function (req, res) {
        try {
            const user = new User({
                username: req.body.username,
                password_hash: pass_handler.encrypt_pass(req.body.password),
            });

            await user.save();
            res.status(200).send("Пользователь успешно создан!");
        } catch (err) {
            console.error("Ошибка при добавлении пользователя:", err);
            res.status(500).send("Ошибка сервера");
        }
    },

    // Проверка пользователя (авторизация)
    check_user: async function (req, res) {
        try {
            const login = req.body.username;
            const passw = pass_handler.encrypt_pass(req.body.password);

            const user = await User.findOne({ username: login, password_hash: passw });

            if (user) {
                req.session.username = user.username;
                res.status(200).send(user);
            } else {
                req.session.username = "";
                res.status(404).send("Пользователь не найден!");
            }
        } catch (err) {
            console.error("Ошибка при проверке пользователя:", err);
            res.status(500).send("Ошибка сервера");
        }
    },
};
