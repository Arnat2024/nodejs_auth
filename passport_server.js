import express from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import session from 'express-session';

const app = express();

// Підтримка JSON та URL-encoded даних (корисно для форм)
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Налаштування сесій
app.use(session({ 
    secret: 'secret', 
    resave: false, 
    saveUninitialized: false 
}));

// Ініціалізація Passport.js
app.use(passport.initialize());
app.use(passport.session());

// Приклад масиву користувачів (у реальних проектах використовуйте БД)
const users = [{ id: 1, username: 'admin', password: 'password' }];

// Налаштування локальної стратегії авторизації
passport.use(new LocalStrategy((username, password, done) => {
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
        return done(null, false, { message: 'Невірні облікові дані' });
    }
    return done(null, user);
}));



// Серіалізація користувача (зберігаємо лише ID у сесії для економії місця)
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Десеріалізація користувача (отримання об'єкта за ID під час кожного запиту)
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
    // req.isAuthenticated() — це вбудований метод Passport
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Будь ласка, увійдіть' });
    }
    res.json({ message: 'Ви авторизовані', user: req.user });
});

// Запуск сервера
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Сервер працює на http://localhost:${PORT}`);
});