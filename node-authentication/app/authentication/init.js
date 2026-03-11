import passport from 'passport';
import bcrypt from 'bcryptjs';
import { Strategy as LocalStrategy } from 'passport-local';

import authenticationMiddleware from './middleware.js';

// Генерація хешу пароля (для прикладу)
const saltRounds = 10;
const myPlaintextPassword = 'my-password';
const passwordHash = bcrypt.hashSync(myPlaintextPassword, saltRounds);

// Тимчасовий об'єкт користувача (в реальному проекті це буде БД)
const user = {
    username: 'test-user',
    passwordHash,
    id: 1
};

/**
 * Функція для пошуку користувача
 */
function findUser(username, callback) {
    if (username === user.username) {
        return callback(null, user);
    }
    return callback(null, null);
}

// Серіалізація користувача в сесію (зберігаємо тільки username)
passport.serializeUser((user, cb) => {
    cb(null, user.username);
});

// Десеріалізація користувача із сесії
passport.deserializeUser((username, cb) => {
    findUser(username, cb);
});

/**
 * Ініціалізація Passport.js та налаштування локальної стратегії
 */
export default function initPassport() {
    passport.use(new LocalStrategy(
        (username, password, done) => {
            findUser(username, (err, user) => {
                if (err) {
                    return done(err);
                }

                // Якщо користувач не знайдений
                if (!user) {
                    console.log('Користувача не знайдено');
                    return done(null, false);
                }

                // Перевірка пароля за допомогою bcrypt
                bcrypt.compare(password, user.passwordHash, (err, isValid) => {
                    if (err) {
                        return done(err);
                    }
                    if (!isValid) {
                        return done(null, false);
                    }
                    return done(null, user);
                });
            });
        }
    ));

    // Прикріплюємо кастомний мідлвар безпосередньо до об'єкта passport
    passport.authenticationMiddleware = authenticationMiddleware;
}