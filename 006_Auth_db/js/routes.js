/**
 * Модуль маршрутизації додатку
 * @param {import('express').Express} app 
 */
export default function (app) {
    
    // Вихід із системи
    app.get('/logout', (req, res) => {
        req.session.username = '';
        console.log('Користувач вийшов із системи'); 
        res.send('Ви вийшли із системи!');  
    }); 

    // Обмеження доступу до контенту на основі авторизації 
    app.get('/admin', (req, res) => {
        // Сторінка доступна тільки для адміна 
        if (req.session.username === 'admin') {
            console.log(`${req.session.username} запитав сторінку адміністратора`);
            res.render('admin_page');
        } else {
            res.status(403).send('Доступ заборонено (тільки для admin)!');
        }
    }); 

    app.get('/user', (req, res) => {
        // Сторінка доступна для будь-якого авторизованого користувача 
        const name = req.session.username || "";
        if (name.length > 0) {
            console.log(`${req.session.username} запитав сторінку користувача`);
            res.render('user_page');
        } else {
            res.status(403).send('Доступ заборонено! Будь ласка, увійдіть у систему.');
        }
    });

    app.get('/guest', (req, res) => {
        // Сторінка без обмеження доступу 
        res.render('guest_page'); 
    });
}