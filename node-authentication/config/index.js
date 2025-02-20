const config = {};

config.mongoURI = process.env.MONGO_STORE_URI || 'mongodb://localhost:27017/session'; // URI підключення до MongoDB
config.sessionSecret = process.env.SESSION_SECRET || 'default_secret'; // Секретний ключ для сесій

config.sessionStore = { 
  mongoUrl: config.mongoURI, // Використання коректного ключа для `connect-mongo`
  collectionName: 'sessions', // Явно вказуємо, де зберігати сесії
  ttl: 14 * 24 * 60 * 60 // Час життя сесії (14 днів)
};

module.exports = config;
