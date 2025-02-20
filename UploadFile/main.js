const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { MongoClient } = require("mongodb");

const app = express();
const port = 8080;

// Подключение к MongoDB
const mongoClient = new MongoClient('mongodb://127.0.0.1:27017/');
let db;

async function connectDB() {
    if (!db) {
        await mongoClient.connect();
        db = mongoClient.db("FILES");
    }
    return db;
}

// Настройка Multer (загрузка в папку uploads)
const upload = multer({ dest: path.join(__dirname, 'uploads') });
const type = upload.single('recfile');

app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Раздаем загруженные файлы

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Обработка загрузки файла
app.post('/upload', type, async (req, res) => {
    if (!req.file) return res.status(400).send('Файл не загружен');

    let tmp_path = req.file.path;
    let target_path = path.join(req.file.destination, req.file.originalname);
    let file_url = `/uploads/${req.file.originalname}`;

    // Перемещение файла
    fs.rename(tmp_path, target_path, async (err) => {
        if (err) return res.status(500).send('Ошибка при сохранении файла');

        try {
            let db = await connectDB();
            let collection = db.collection("files");

            // Проверяем, есть ли такой файл в базе
            let existingFile = await collection.findOne({ path: file_url });

            if (!existingFile) {
                await collection.insertOne({ path: file_url });
            }

            res.sendFile(__dirname + '/index.html');
        } catch (err) {
            console.error(err);
            res.status(500).send('Ошибка сервера');
        }
    });
});


// Получение загруженных файлов
app.get('/get_uploads', async (req, res) => {
    try {
        let db = await connectDB();
        let collection = db.collection("files");
        let results = await collection.find().toArray();

        let images = results.map(row => `<img src="${row.path}" style="width:400px" />`);
        
        res.setHeader("Content-Type", "text/html");
        res.send(images.join(''));
    } catch (err) {
        console.error("Ошибка загрузки файлов", err);
        res.status(500).send('Ошибка сервера');
    }
});

app.listen(port, () => {
    console.log('Сервер запущен на порту ' + port);
});
