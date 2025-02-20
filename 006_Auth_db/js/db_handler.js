const mongoose = require("mongoose");

// Подключение к MongoDB (единожды)
mongoose.connect("mongodb://127.0.0.1:27017/USERS", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("✅ Успешное подключение к MongoDB"))
    .catch(err => console.error("❌ Ошибка подключения к базе данных:", err));

// Определение схемы пользователя
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, minlength: 6 }, // Минимум 6 символов
}, { timestamps: true }); // Добавляем поля createdAt и updatedAt автоматически

// Создание модели пользователя
const User = mongoose.model("User", userSchema);

module.exports = {
    connect_db: async function () {
        try {
            return User; // Возвращаем модель, чтобы работать с ней
        } catch (err) {
            console.error("❌ Ошибка при подключении к базе данных:", err);
            throw err;
        }
    }
};
