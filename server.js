import express from 'express';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = 3000;
const SECRET_KEY = 'your_secret_key';

// Використовуємо вбудований парсер Express
app.use(express.json());

// Демонстраційні користувачі
const users = [{ id: 1, username: 'admin', password: 'password' }];

// Маршрут для входу та отримання JWT
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
    
    res.json({ token });
});



/**
 * Middleware для перевірки токена
 */
export const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        // Зазвичай токен передається у форматі "Bearer <token>"
        const token = authHeader.split(' ')[1] || authHeader;

        jwt.verify(token, SECRET_KEY, (err, user) => {
            if (err) {
                return res.status(403).json({ message: 'Невірний або прострочений токен' });
            }
            req.user = user;
            next();
        });
    } else {
        res.status(403).json({ message: 'Заголовок авторизації відсутній' });
    }
};

// Захищений маршрут
app.get('/protected', authenticateJWT, (req, res) => {
    res.json({ 
        message: 'Це захищений маршрут', 
        user: req.user 
    });
});

app.listen(PORT, () => {
    console.log(`Сервер працює на http://localhost:${PORT}`);
});