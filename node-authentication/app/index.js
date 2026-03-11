import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import exphbs from 'express-handlebars';
import passport from 'passport';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import mongoose from 'mongoose';
import flash from 'connect-flash';

// Імпорт конфігурації (додайте .js, якщо це локальний файл)
import config from '../config/index.js';

// Імпорт ініціалізаторів модулів
import { init as initAuth } from './authentication/index.js';
import { init as initUser } from './user/index.js';
import { init as initNote } from './note/index.js';

const app = express();

// Емуляція __dirname для ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Перевірка конфігурації
if (!config.mongoURI) {
    throw new Error("MongoDB URI не вказано у конфігурації");
}
if (!config.sessionSecret) {
    throw new Error("Секретний ключ сесії не вказано у конфігурації");
}

// Підключення до MongoDB
mongoose.connect(config.mongoURI)
    .then(() => console.log('MongoDB підключено'))
    .catch(err => {
        console.error('Помилка підключення до MongoDB:', err);
        process.exit(1);
    });

// Обробка тіла запиту (замість bodyParser використовуємо вбудований express)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Ініціалізація аутентифікації
initAuth(app);

// Налаштування сесій із збереженням у MongoDB
app.use(session({
    store: MongoStore.create({ mongoUrl: config.mongoURI }),
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // встановіть true, якщо використовуєте HTTPS
        httpOnly: true, 
        maxAge: 1000 * 60 * 60 * 24 
    }
}));

app.use(flash());

// Middleware для передачі flash-повідомлень у шаблони
app.use((req, res, next) => {
    res.locals.messages = req.flash();
    next();
});

// Ініціалізація Passport.js
app.use(passport.initialize());
app.use(passport.session());

// Налаштування Handlebars
app.engine('.hbs', exphbs.engine({
    defaultLayout: 'layout',
    extname: '.hbs',
    layoutsDir: path.join(__dirname, '/'),
    partialsDir: path.join(__dirname, '/partials')
}));

app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, '/'));

// Ініціалізація модулів користувачів та нотаток
initUser(app);
initNote(app);

export default app;