const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const app = express();
app.use(express.json());

const token = process.env.BOT_TOKEN; // Используйте переменные окружения
const bot = new TelegramBot(token, { polling: true });

// Хранилище данных (можно заменить на базу данных)
const games = [];
const users = {};

// Команда /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    if (!users[userId]) {
        users[userId] = { balance: 500 };
    }

    bot.sendMessage(chatId, 'Добро пожаловать! У вас есть 500💰.');
});

// Команда /mini_app
bot.onText(/\/mini_app/, (msg) => {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, 'Откройте мини-приложение, чтобы играть в игры.', {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Открыть мини-приложение', web_app: { url: 'https://username.github.io/telegram-bot/' } }]
            ]
        }
    });
});

// Обработка запросов из мини-приложения
app.post('/webhook', (req, res) => {
    const data = req.body;

    if (data.type === 'get_games') {
        res.json({ games });
    } else if (data.type === 'get_balance') {
        const userId = data.userId;
        res.json({ balance: users[userId]?.balance || 500 });
    } else if (data.type === 'update_balance') {
        const userId = data.userId;
        const amount = data.amount;
        users[userId].balance += amount;
        res.json({ success: true });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
