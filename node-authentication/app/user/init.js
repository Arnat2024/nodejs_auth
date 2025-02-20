const passport = require('passport');
const authenticationMiddleware = require('../authentication/middleware'); 

function initUser(app) {
  app.get('/', renderWelcome);
  app.get('/profile', authenticationMiddleware(), renderProfile);
  
  app.post('/login', passport.authenticate('local', {
    successRedirect: '/profile',
    failureRedirect: '/',
    failureFlash: 'Invalid username or password' // Додає повідомлення про помилку
  }));
}

function renderWelcome(req, res) {
  res.render('user/welcome', { message: req.flash('error') }); // Передаємо флеш-повідомлення
}

function renderProfile(req, res) {
  if (!req.user) {
    return res.redirect('/');
  }
  res.render('user/profile', {
    username: req.user.username
  });
}

module.exports = initUser;
