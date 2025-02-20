const passport = require('passport');
const bcrypt = require('bcryptjs'); // Використання bcryptjs для кращої сумісності
const LocalStrategy = require('passport-local').Strategy;

const authenticationMiddleware = require('./middleware');

// Генерація хешу пароля
const saltRounds = 10;
const myPlaintextPassword = 'my-password';
const passwordHash = bcrypt.hashSync(myPlaintextPassword, saltRounds);

const user = {
  username: 'test-user',
  passwordHash,
  id: 1
};

// Функція для пошуку користувача
function findUser(username, callback) {
  if (username === user.username) {
    return callback(null, user);
  }
  return callback(null, null); // Повертати null замість undefined
}

// Сереалізація користувача в сесію
passport.serializeUser((user, cb) => {
  cb(null, user.username);
});

// Десереалізація користувача із сесії
passport.deserializeUser((username, cb) => {
  findUser(username, cb);
});

function initPassport() {
  passport.use(new LocalStrategy(
    (username, password, done) => {
      findUser(username, (err, user) => {
        if (err) {
          return done(err);
        }

        // Якщо користувач не знайдений
        if (!user) {
          console.log('User not found');
          return done(null, false);
        }

        // Перевірка пароля
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

  passport.authenticationMiddleware = authenticationMiddleware;
}

module.exports = initPassport;
