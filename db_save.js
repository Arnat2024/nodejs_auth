const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'your_secret_key';

app.use(express.json()); // Додаємо підтримку JSON у запитах
app.use(bodyParser.json()); // Додаємо body-parser для роботи з JSON

// Налаштування сесій
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }));

app.use(passport.initialize()); // Ініціалізація Passport.js
app.use(passport.session()); // Використання Passport.js для управління сесіями

// Підключення до MongoDB
mongoose.connect('mongodb://localhost:27017/authDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Схема для збереження токенів
const tokenSchema = new mongoose.Schema({
  userId: Number,
  token: String,
});

const Token = mongoose.model('Token', tokenSchema);

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

// Маршрут для входу та генерації токена
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ message: 'Невірні облікові дані' });
  
  const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
  await Token.create({ userId: user.id, token });
  res.json({ token });
});

// Middleware для перевірки токена
const authenticateJWT = async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(403).json({ message: 'Немає доступу' });
  
  const storedToken = await Token.findOne({ token });
  if (!storedToken) return res.status(403).json({ message: 'Невірний токен' });
  
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: 'Невірний токен' });
    req.user = user;
    next();
  });
};

// Захищений маршрут
app.get('/protected', authenticateJWT, (req, res) => {
  res.json({ message: 'Це захищений маршрут', user: req.user });
});

// Маршрут для виходу (видалення токена з БД)
app.post('/logout', async (req, res) => {
  const token = req.headers.authorization;
  await Token.deleteOne({ token });
  res.json({ message: 'Вихід виконано' });
});

// Запуск сервера
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
