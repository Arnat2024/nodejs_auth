const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const uuid = require('uuid');

const app = express();
app.use(express.json()); // Додаємо підтримку JSON у запитах

// Налаштування сесій
app.use(session({
  secret: 'secret', // Секретний ключ для підпису сесій
  resave: false, // Забороняє збереження сесії, якщо вона не змінювалася
  saveUninitialized: false, // Забороняє створення порожньої сесії
  genid: () => uuid.v4() // Генерація унікального sessionID
}));

app.use(passport.initialize()); // Ініціалізація Passport.js
app.use(passport.session()); // Використання Passport.js для управління сесіями

// Приклад масиву користувачів
const users = [{ id: 1, username: 'admin', password: 'password' }];

// Налаштування локальної стратегії авторизації
passport.use(new LocalStrategy((username, password, done) => {
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return done(null, false, { message: 'Невірні облікові дані' });
  return done(null, user);
}));

// Серіалізація користувача (збереження у сесії)
passport.serializeUser((user, done) => done(null, user.id));

// Десеріалізація користувача (отримання даних із сесії)
passport.deserializeUser((id, done) => {
  const user = users.find(u => u.id === id);
  done(null, user);
});

// Маршрут для входу в систему
app.post('/login', passport.authenticate('local', {
  successRedirect: '/profile', // Перенаправлення у разі успіху
  failureRedirect: '/login' // Перенаправлення у разі помилки
}));

// Маршрут для отримання профілю користувача
app.get('/profile', (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ message: 'Будь ласка, увійдіть' });
  res.json({ message: 'Ви авторизовані', user: req.user, sessionID: req.sessionID });
});

// Маршрут для виходу із системи
app.post('/logout', (req, res) => {
  req.logout(err => {
    if (err) return res.status(500).json({ message: 'Помилка виходу' });
    req.session.destroy(); // Знищення сесії після виходу
    res.json({ message: 'Вихід виконано' });
  });
});

// Запуск сервера
app.listen(3000, () => console.log('Server running on http://localhost:3000'));
