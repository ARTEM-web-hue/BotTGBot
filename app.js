const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
require('dotenv').config();

// === Настройки ===
const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { webHook: true });
const app = express();
const PORT = process.env.PORT || 3000;

// === Middleware для парсинга JSON ===
app.use(express.json());

// === URL для вебхука ===
const webhookEndpoint = `/bot${token}`;
const host = process.env.RENDER_EXTERNAL_HOSTNAME || 'localhost';
const url = `https://${host}${webhookEndpoint}`; 

bot.setWebHook(url)
    .then(() => console.log('Вебхук установлен:', url))
    .catch(err => console.error('Ошибка установки вебхука:', err));

// === Обработка команды /start ===
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, 'Привет!');

    if (Math.random() < 0.1) {
        bot.sendMessage(chatId, 'Хах сработало!');
    }
});

// === Роут для вебхука ===
app.post(webhookEndpoint, (req, res) => {
    console.log('Получено обновление:', req.body); // 👈 Для отладки
    if (!req.body) return res.sendStatus(400);     // 👈 Проверка на пустой body

    try {
        bot.processUpdate(req.body);
        res.sendStatus(200);
    } catch (err) {
        console.error('Ошибка обработки обновления:', err);
        res.sendStatus(500);
    }
});

// === Главная страница ===
app.get('/', (req, res) => {
    res.send('Бот работает!');
});

// === Запуск сервера ===
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
