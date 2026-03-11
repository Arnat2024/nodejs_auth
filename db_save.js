import express from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import session from 'express-session';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const app = express();
const PORT = 3000;
const SECRET_KEY = 'your_secret_key';

// Підтримка JSON (express.json замінює bodyParser у сучасних версіях)
app.use(express.json());

// Налаштування сесій
app.use(session({ 
    secret: 'secret', 
    resave: false, 
    saveUninitialized: false 
}));

// Ініціалізація Passport.js
app.use(passport.initialize());
app.use(passport.session());

// Підключення до MongoDB
mongoose.connect('mongodb://localhost:27017/authDB')
    .then(() => console.log('MongoDB підключено'))
    .catch(err => console.error('Помилка підключення до БД:', err));

// Схема для збереження токенів у базі (Whitelist токенів)
const tokenSchema = new mongoose.Schema({
    userId: Number,
    token: String,
    createdAt: { type: Date, default: Date.now, expires: '1h' } // Автовидалення через годину
});

const Token = mongoose.model('Token', tokenSchema);

// Демонстраційні дані користувачів
const users = [{ id: 1, username: 'admin', password: 'password' }];

// Налаштування локальної стратегії Passport
passport.use(new LocalStrategy((username, password, done) => {
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) return done(null, false, { message: 'Невірні облікові дані' });
    return done(null, user);
}));

// Серіалізація та десеріалізація користувача
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
    const user = users.find(u => u.id === id);
    done(null, user);
});



// Маршрут для входу та генерації токена
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    
    if (!user) {
        return res.status(401).json({ message: 'Невірні облікові дані' });
    }
    
    // Створення JWT
    const token = jwt.sign(
        { id: user.id, username: user.username }, 
        SECRET_KEY, 
        { expiresIn: '1h' }
    );
    
    // Збереження токена в БД (дозволяє керувати активними сесіями)
    await Token.create({ userId: user.id, token });
    
    res.json({ token });
});

/**
 * Middleware для перевірки токена (JWT + БД)
 */
export const authenticateJWT = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && (authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader);

    if (!token) {
        return res.status(403).json({ message: 'Немає доступу (відсутній токен)' });
    }
    
    try {
        // Перевірка, чи існує токен у базі (чи не був він видалений при логауті)
        const storedToken = await Token.findOne({ token });
        if (!storedToken) {
            return res.status(403).json({ message: 'Токен недійсний або сесія завершена' });
        }
        
        // Валідація самого токена
        jwt.verify(token, SECRET_KEY, (err, user) => {
            if (err) return res.status(403).json({ message: 'Помилка валідації токена' });
            req.user = user;
            next();
        });
    } catch (error) {
        res.status(500).json({ message: 'Помилка сервера при перевірці' });
    }
};

// Захищений маршрут
app.get('/protected', authenticateJWT, (req, res) => {
    res.json({ message: 'Це захищений маршрут', user: req.user });
});

// Маршрут для виходу (видалення токена з БД)
app.post('/logout', async (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && (authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader);
    
    if (token) {
        await Token.deleteOne({ token });
    }
    res.json({ message: 'Вихід виконано (токен анульовано)' });
});

app.listen(PORT, () => {
    console.log(`Сервер працює на http://localhost:${PORT}`);
});