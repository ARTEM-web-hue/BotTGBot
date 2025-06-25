const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
require('dotenv').config();

// === Настройки ===
const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { webHook: true });
const app = express();
const PORT = process.env.PORT || 3000;

// === URL для вебхука ===
const webhookEndpoint = `/bot${token}`;
bot.setWebHook(`https://${process.env.RENDER_EXTERNAL_HOSTNAME}${webhookEndpoint}`); 

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
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

// === Главная страница (для Render) ===
app.get('/', (req, res) => {
    res.send('Бот работает!');
});

// === Запуск сервера ===
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
