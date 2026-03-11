import passport from 'passport';

/**
 * Ініціалізація маршрутів для нотаток
 * @param {import('express').Express} app 
 */
export default function initNote(app) {
    // Отримання конкретної нотатки за ID
    // Доступ дозволено лише авторизованим користувачам
    app.get('/notes/:id', passport.authenticationMiddleware(), (req, res) => {
        res.render('note/overview', {
            id: req.params.id
        });
    });
}