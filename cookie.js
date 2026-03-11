import express from 'express';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

const app = express();
const PORT = 3000;
const SECRET_KEY = 'your_secret_key';

// Використовуємо вбудований в express парсер замість body-parser
app.use(express.json());
app.use(cookieParser());

// Демонстраційні користувачі
const users = [{ id: 1, username: 'admin', password: 'password' }];

// Маршрут для входу та отримання JWT у кукі
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    
    if (!user) {
        return res.status(401).json({ message: 'Невірні облікові дані' });
    }
    
    // Створення токена
    const token = jwt.sign(
        { id: user.id, username: user.username }, 
        SECRET_KEY, 
        { expiresIn: '1h' }
    );
    
    // Встановлення токена в HttpOnly кукі
    res.cookie('token', token, { 
        httpOnly: true, 
        secure: false, // Встановіть true, якщо використовуєте HTTPS
        maxAge: 3600000 
    });
    
    res.json({ message: 'Успішний вхід' });
});

/**
 * Middleware для перевірки токена з кукі
 */
export const authenticateJWT = (req, res, next) => {
    const token = req.cookies.token;
    
    if (!token) {
        return res.status(403).json({ message: 'Немає доступу' });
    }
    
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Невірний токен' });
        }
        req.user = user;
        next();
    });
};

// Захищений маршрут
app.get('/protected', authenticateJWT, (req, res) => {
    res.json({ message: 'Це захищений маршрут', user: req.user });
});

// Маршрут для виходу
app.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Вихід виконано' });
});

app.listen(PORT, () => {
    console.log(`Сервер запущено на http://localhost:${PORT}`);
});