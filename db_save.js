import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
//import dotenv from 'dotenv';

const app = express();
const PORT = 3000;
const SECRET_KEY = 'your_secret_key'; // У реальному проекті використовуйте .env

app.use(express.json());

// Підключення до БД
mongoose.connect('mongodb://127.0.0.1:27017/authDB') // Використовуйте 127.0.0.1 замість localhost для уникнення проблем з IPv6
    .then(() => console.log('MongoDB підключено'))
    .catch(err => console.error('Помилка БД:', err));

// Схема токенів
const tokenSchema = new mongoose.Schema({
    userId: Number,
    token: String,
    createdAt: { type: Date, default: Date.now, expires: '1h' }
});
const Token = mongoose.model('Token', tokenSchema);

// Дані користувачів (імітація БД)
const users = [{ id: 1, username: 'admin', password: 'password', role: 'admin' }];

// МАРШРУТ LOGIN
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    
    if (!user) {
        return res.status(401).json({ message: 'Невірні облікові дані' });
    }
    
    const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role }, 
        SECRET_KEY, 
        { expiresIn: '1h' }
    );
    
    // Зберігаємо токен у "White-list"
    await Token.create({ userId: user.id, token });
    
    res.json({ token });
});

// MIDDLEWARE АУТЕНТИФІКАЦІЇ (JWT + DB Check)
export const authenticateJWT = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({ message: 'Відсутній заголовок авторизації' });
    }

    const token = authHeader.split(' ')[1]; // Очікуємо "Bearer TOKEN"

    try {
        // 1. Перевірка в БД (чи не був токен видалений при logout)
        const storedToken = await Token.findOne({ token });
        if (!storedToken) {
            return res.status(401).json({ message: 'Сесія завершена або токен недійсний' });
        }
        
        // 2. Валідація JWT
        jwt.verify(token, SECRET_KEY, (err, decoded) => {
            if (err) return res.status(403).json({ message: 'Токен прострочений або підроблений' });
            req.user = decoded; // Додаємо дані користувача в запит
            next();
        });
    } catch (error) {
        res.status(500).json({ message: 'Помилка сервера' });
    }
};

// MIDDLEWARE АВТОРИЗАЦІЇ (Перевірка ролі адміна)
export const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Доступ заборонено: потрібно бути адміністратором' });
    }
};

// ЗАХИЩЕНІ МАРШРУТИ
app.get('/admin/data', authenticateJWT, isAdmin, (req, res) => {
    res.json({ message: 'Вітаємо, Адмін!', data: 'Чутливі дані' });
});

app.post('/logout', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        await Token.deleteOne({ token });
    }
    res.json({ message: 'Вихід успішний' });
});

app.listen(PORT, () => console.log(`Сервер: http://localhost:${PORT}`));