const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'your_secret_key';

app.use(bodyParser.json());

// Демонстраційні користувачі
const users = [{ id: 1, username: 'admin', password: 'password' }];

// Маршрут для входу та отримання JWT
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ message: 'Невірні облікові дані' });
  const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
  res.json({ token });
});

// Middleware для перевірки токена
const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(403).json({ message: 'Немає доступу' });
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: 'Невірний токен' });
    req.user = user;
    next();
  });
};

// Захищений маршрут
app.get('/protected', authenticateJWT, (req, res) => {
  res.json({ message: 'Це захищений маршрут', user: req.user });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));