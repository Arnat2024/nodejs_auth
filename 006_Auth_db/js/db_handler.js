const mongoose = require("mongoose");

// Підключення до MongoDB 
mongoose.connect("mongodb://127.0.0.1:27017/USERS", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("Успішне подключення до MongoDB"))
    .catch(err => console.error("Помилка підключення до бази даних:", err));

// Визначення схеми користувача
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, minlength: 6 }, // Мінімум 6 символів
}, { timestamps: true }); // Додаємо поля createdAt і updatedAt автоматично

// Створення моделі користувача
const User = mongoose.model("User", userSchema);

module.exports = {
    connect_db: async function () {
        try {
            return User; // Повертаємо модель для роботи  нею
        } catch (err) {
            console.error("Помилка при підключенні до бази даних:", err);
            throw err;
        }
    }
};
