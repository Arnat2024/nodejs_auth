import mongoose from 'mongoose';
import * as pass_handler from './password_handler.js';

// Підключення до MongoDB
if (mongoose.connection.readyState === 0) {
    mongoose.connect("mongodb://127.0.0.1:27017/USERS")
        .then(() => console.log("Успішне підключення до БД"))
        .catch(err => console.error("Помилка підключення до БД:", err));
}

// Визначення схеми користувача
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
});

// Створення моделі користувача
const User = mongoose.model("User", userSchema);

// Отримання списку користувачів
export const get_users = async (req, res) => {
    try {
        const users = await User.find();
        const docs = users.map((row) => `<h3>${row.username}</h3>`);

        res.send(docs.join(""));
    } catch (err) {
        console.error("Помилка при отриманні користувачів:", err);
        res.status(500).send("Помилка сервера");
    }
};

// Додавання нового користувача
export const add_user = async (req, res) => {
    try {
        const user = new User({
            username: req.body.username,
            password_hash: pass_handler.encrypt_pass(req.body.password),
        });

        await user.save();
        res.status(200).send("Користувача успішно створено!");
    } catch (err) {
        console.error("Помилка при додаванні користувача:", err);
        res.status(500).send("Помилка сервера");
    }
};

// Перевірка користувача (авторизація)
export const check_user = async (req, res) => {
    try {
        const login = req.body.username;
        const passw = pass_handler.encrypt_pass(req.body.password);

        const user = await User.findOne({ username: login, password_hash: passw });

        if (user) {
            req.session.username = user.username;
            res.status(200).send(user);
        } else {
            req.session.username = "";
            res.status(404).send("Користувача не знайдено!");
        }
    } catch (err) {
        console.error("Помилка при перевірці користувача:", err);
        res.status(500).send("Помилка сервера");
    }
};