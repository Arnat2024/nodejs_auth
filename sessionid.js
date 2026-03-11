import express from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import session from 'express-session';
import { v4 as uuidv4 } from 'uuid';

const app = express();

// Налаштування body-parser (вбудовано в Express)
app.use(express.json());

// Налаштування сесій
app.use(session({
    secret: 'secret', // Секретний ключ для підпису сесій
    resave: false,    // Забороняє збереження сесії, якщо вона не змінювалася
    saveUninitialized: false, // Забороняє створення порожньої сесії
    genid: () => uuidv4() // Генерація унікального sessionID через uuid
}));

// Ініціалізація Passport.js
app.use(passport.initialize());
app.use(passport.session());

// Демонстраційний масив користувачів
const users = [{ id: 1, username: 'admin', password: 'password' }];

// Налаштування локальної стратегії авторизації
passport.use(new LocalStrategy((username, password, done) => {
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
        return done(null, false, { message: 'Невірні облікові дані' });
    }
    return done(null, user);
}));

// Серіалізація користувача (збереження ID у сесії)
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Десеріалізація користувача (отримання даних за ID із сесії)
passport.deserializeUser((id, done) => {
    const user = users.find(u => u.id === id);
    done(null, user);
});



// Маршрут для входу в систему
app.post('/login', passport.authenticate('local', {
    successRedirect: '/profile',
    failureRedirect: '/login'
}));

// Маршрут для отримання профілю користувача
app.get('/profile', (req, res) => {
    // Перевірка авторизації через вбудований метод Passport
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Будь ласка, увійдіть' });
    }
    res.json({ 
        message: 'Ви авторизовані', 
        user: req.user, 
        sessionID: req.sessionID 
    });
});

// Маршрут для виходу із системи
app.post('/logout', (req, res) => {
    req.logout(err => {
        if (err) {
            return res.status(500).json({ message: 'Помилка виходу' });
        }
        // Знищення сесії після виходу
        req.session.destroy(() => {
            res.json({ message: 'Вихід виконано' });
        });
    });
});

// Запуск сервера
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущено на http://localhost:${PORT}`);
});