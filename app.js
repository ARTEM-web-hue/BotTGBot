const { Telegraf } = require('telegraf');
const express = require('express');
const path = `/bot${process.env.BOT_TOKEN}`;
require('dotenv').config();

// === Инициализация бота ===
const bot = new Telegraf(process.env.BOT_TOKEN);

// === Express сервер (для вебхуков) ===
const app = express();
const PORT = process.env.PORT || 3000;

bot.start((ctx) => {
    const buttons = {
        reply_markup: {
            keyboard: [
                [{ text: '🪀 Заработок' }],
                [{ text: '❄️ О боте' }]
            ],
            resize_keyboard: true,
        }
    };

    ctx.reply('Добро пожаловать!', buttons);
});
bot.telegram.setMyCommands([
    { command: 'start', description: 'Запустить бота' },
    { command: 'help', description: 'Показать помощь' },
    { command: 'earn', description: '🪀 Заработок' },
    { command: 'about', description: '❄️ О боте' }
]);
// === Роут для вебхука ===
app.use(bot.webhookCallback(path));

// === Главная страница ===
app.get('/', (req, res) => {
    res.send('Бот работает!');
});

// === Запуск сервера ===
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
});
