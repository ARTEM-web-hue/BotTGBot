const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

// Создаем бота
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// Обработка команды /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    // Отправляем приветствие
    bot.sendMessage(chatId, 'Привет!');

    // Шанс 10%
    if (Math.random() < 0.1) {
        bot.sendMessage(chatId, 'Хах сработало!');
    }
});
