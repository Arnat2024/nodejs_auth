import passport from 'passport';
import authenticationMiddleware from '../authentication/middleware.js';

/**
 * Ініціалізація маршрутів користувача
 * @param {import('express').Express} app 
 */
export default function initUser(app) {
    app.get('/', renderWelcome);
    app.get('/profile', authenticationMiddleware(), renderProfile);
    
    app.post('/login', passport.authenticate('local', {
        successRedirect: '/profile',
        failureRedirect: '/',
        failureFlash: 'Невірне ім’я користувача або пароль' 
    }));
}

// Рендеринг вітальної сторінки
function renderWelcome(req, res) {
    // Передаємо флеш-повідомлення про помилки, якщо вони є
    res.render('user/welcome', { message: req.flash('error') });
}

// Рендеринг профілю користувача
function renderProfile(req, res) {
    // Якщо Passport не десеріалізував користувача (на випадок збою мідлвару)
    if (!req.user) {
        return res.redirect('/');
    }
    
    res.render('user/profile', {
        username: req.user.username
    });
}