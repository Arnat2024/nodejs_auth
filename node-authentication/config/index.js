const config = {};

// URI підключення до MongoDB (пріоритет змінним оточення)
config.mongoURI = process.env.MONGO_STORE_URI || 'mongodb://localhost:27017/session'; 

// Секретний ключ для підпису сесій
config.sessionSecret = process.env.SESSION_SECRET || 'default_secret'; 

// Налаштування сховища сесій для connect-mongo
config.sessionStore = { 
    mongoUrl: config.mongoURI,    // Шлях до БД
    collectionName: 'sessions',   // Колекція для збереження сесій
    ttl: 14 * 24 * 60 * 60        // Час життя сесії (14 днів у секундах)
};

export default config;