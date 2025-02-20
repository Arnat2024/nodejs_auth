const path = require('path');
const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo'); // Використання MongoDB для зберігання сесій
const mongoose = require('mongoose');
const flash = require('connect-flash');

const config = require('../config');
const app = express();

// Перевірка наявності необхідних змінних середовища
if (!config.mongoURI) {
  throw new Error("MongoDB URI не вказано у конфігурації");
}
if (!config.sessionSecret) {
  throw new Error("Секретний ключ сесії не вказано у конфігурації");
}

// Підключення до MongoDB
mongoose.connect(config.mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB підключено'))
  .catch(err => {
    console.error('Помилка підключення до MongoDB:', err);
    process.exit(1); // Завершення процесу у разі помилки підключення
  });

// Налаштування body-parser для обробки запитів
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // Додано підтримку JSON-запитів

// Ініціалізація аутентифікації
require('./authentication').init(app);

// Налаштування сесій із використанням MongoDB
app.use(session({
  store: MongoStore.create({ mongoUrl: config.mongoURI }), // Використання MongoDB для збереження сесій
  secret: config.sessionSecret, // Секретний ключ для підпису сесій
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true, maxAge: 1000 * 60 * 60 * 24 } // Додано налаштування cookie
}));

app.use(flash()); // Підключення flash-повідомлень
// Middleware для додавання flash-повідомлень у `res.locals`
app.use((req, res, next) => {
  res.locals.messages = req.flash();
  next();
});

// Ініціалізація Passport.js для автентифікації
app.use(passport.initialize());
app.use(passport.session());

// Налаштування Handlebars як шаблонізатора
app.engine('.hbs', exphbs.engine({ // Використання `exphbs.engine` для нових версій
  defaultLayout: 'layout',
  extname: '.hbs',
  layoutsDir: path.join(__dirname, '/'), // Виправлено шлях до папки layouts
  partialsDir: path.join(__dirname, '/partials') // Виправлено шлях до папки partials
}));

app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, '/'));

// Ініціалізація модулів для роботи з користувачами та нотатками
require('./user').init(app);
require('./note').init(app);

module.exports = app;
