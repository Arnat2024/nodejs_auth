import mongoose from 'mongoose';
import MongoStore from 'connect-mongo';

// Перевіряємо, чи підключений уже Mongoose
// (Node.js кешує модулі, тому цей стан буде спільним для всього додатка)
if (mongoose.connection.readyState === 0) {
    mongoose.connect("mongodb://localhost:27017/USERS")
        .then(() => console.log("Mongoose підключено для сесій"))
        .catch(err => console.error("Помилка підключення Mongoose:", err));
}

/**
 * Створює сховище сесій у MongoDB
 * @returns {MongoStore}
 */
export const createStore = () => {
    return MongoStore.create({
        // Використовуємо поточне підключення Mongoose
        client: mongoose.connection.getClient(), 
        // Назва колекції, де будуть зберігатися сесії
        collectionName: "sessions", 
    });
};