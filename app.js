const { Telegraf } = require('telegraf');
const express = require('express');
require('dotenv').config();

// === Инициализация бота ===
const bot = new Telegraf(process.env.BOT_TOKEN);

// === Express сервер (для вебхуков) ===
const app = express();
const PORT = process.env.PORT || 3000;

// === Обработка команды /start с инлайн-кнопками ===
bot.start((ctx) => {
    const buttons = {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Кнопка 1', callback: 'btn1' }],
                [
                    { text: 'Кнопка 2', callback: 'btn2' },
                    { text: 'Кнопка 3', callback: 'btn3' }
                ],
                [{ text: 'Кнопка 4', callback: 'btn4' }],
                [{ text: 'Кнопка 5', callback: 'btn5' }]
            ]
        }
    };

    ctx.reply('Выберите действие:', buttons);
});
// === Обработка нажатий на кнопки ===
bot.action('btn1', (ctx) => {
    ctx.answerCbQuery();
    ctx.reply('Вы нажали Кнопку 1!');
});

bot.action('btn2', (ctx) => {
    ctx.answerCbQuery();
    ctx.reply('Вы нажали Кнопку 2!');
});

bot.action('btn3', (ctx) => {
    ctx.answerCbQuery();
    ctx.reply('Вы нажали Кнопку 3!');
});

bot.action('btn4', (ctx) => {
    ctx.answerCbQuery();
    ctx.reply('Вы нажали Кнопку 4!');
});

bot.action('btn5', (ctx) => {
    ctx.answerCbQuery();
    ctx.reply('Вы нажали Кнопку 5!');
});


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
