const express = require('express');

const cors = require('cors');

const fs = require('fs');
const path = require('path');
const {sendTestMessage, updateData} = require("./bot");
const {getMetrics, getSystemInfo} = require("./getData");

const app = express();
const port = 3001;

app.use(cors())
app.use(express.json())


// Маршрут для получения метрик всех контейнеров
app.get('/metrics', async (req, res) => {
    try {
        res.json(await getMetrics());
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get('/server', async (req, res) => {
    try {
        const systemInfo = await getSystemInfo();
        res.json(systemInfo);
    } catch (error) {
        console.error('Ошибка при получении системной информации:', error);
        res.status(500).send('Ошибка при получении системной информации');
    }
});

app.post('/save-alert-data', async (req, res) => {
    try {
        // Проверка, что тело запроса имеет формат JSON и содержит url
        if (!req.body) {
            return res.status(400).send({ error: 'URL is required' });
        }

        // Получение JSON данных с помощью axios
        const data = req.body;

        // Определение пути к файлу
        const filePath = path.join(__dirname, 'data', 'data.json');
        console.log(`Saving data to: ${filePath}`);

        // Создание директории, если она не существует
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // Сохранение данных в файл (перезапись, если файл существует)
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

        //Обновление данных в боте
        updateData()

        res.send({ message: 'JSON data saved successfully!' });
    } catch (error) {
        // Обработка ошибок, включая ошибки с axios или файловой системой
        console.error('Error fetching or saving data:', error);
        res.status(500).send({ error: 'Failed to fetch or save data', details: error.message });
    }
});


app.get('/get-alert-data', (req, res) => {
    const filePath = path.join(__dirname, 'data', 'data.json');

    if (fs.existsSync(filePath)) {
        // Чтение файла и отправка его содержимого
        const data = fs.readFileSync(filePath, 'utf8');
        res.send(JSON.parse(data));
    } else {
        res.status(404).send({ error: 'File not found' });
    }
});

app.get('/send-test-message', (req, res) => {
    const filePath = path.join(__dirname, 'data', 'data.json');

    if (fs.existsSync(filePath)) {
        // Чтение файла и отправка его содержимого
        const data = fs.readFileSync(filePath, 'utf8');

        sendTestMessage()

        res.send({ "message-sending": true});
    } else {
        res.send({ "message-sending": false});
    }
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
