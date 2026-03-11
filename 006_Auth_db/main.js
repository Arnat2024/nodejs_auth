import express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';

// Імпорт власних модулів (обов'язково з розширенням .js)
import { createStore } from './js/session_handler.js';
import * as handlers from './js/queries.js';
import routes_handler from './js/routes.js';

const app = express();
const port = 8080;

// Емуляція __dirname для ES-модулів
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Налаштування body-parser (тепер вбудовано в express)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Створення сховища для сесій
const store = createStore();

// Налаштування сесій
app.use(cookieParser());
app.use(session({
    store: store,
    resave: false,
    saveUninitialized: true,
    secret: 'supersecret'
}));

// Налаштування шаблонізатора
app.set('views', path.join(__dirname, 'pages'));
app.set('view engine', 'ejs');

// Ініціалізація роутів (якщо ваш routes.js експортує функцію за замовчуванням)
routes_handler(app);

// Маршрути (Routes)
app.get('/', (req, res) => {
    res.render('sign_up');
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/all', handlers.get_users);

app.post('/login', handlers.check_user);

// Реєстрація користувача
app.post('/signup', handlers.add_user);

// Обмеження доступу до контенту на основі авторизації
app.get('/check', (req, res) => {
    if (req.session.username) {
        res.send(`Привіт, користувачу ${req.session.username}`);
    } else {
        res.send('Ви не авторизовані (');
    }
});

app.listen(port, () => {
    console.log(`Додаток запущено на порту ${port}`);
});