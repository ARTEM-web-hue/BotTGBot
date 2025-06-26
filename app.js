// === Импорты ===
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const fetch = require('node-fetch'); // ✅ Подключаем один раз в начале
require('dotenv').config();

// === Настройки бота ===
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

// === Установка вебхука ===
bot.setWebHook(url)
    .then(() => console.log('✅ Вебхук установлен:', url))
    .catch(err => console.error('❌ Ошибка установки вебхука:', err));

// === Обработка команды /start с кнопками ===
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    const options = {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Кнопка 3', callback_data: 'btn3' }],
                [
                    { text: 'Кнопка 1', callback_data: 'btn1' },
                    { text: 'Кнопка 2', callback_data: 'btn2' }
                ],
                [
                    { text: 'Кнопка 4', callback_data: 'btn4' },
                    { text: 'Кнопка 5', callback_data: 'btn5' }
                ]
            ]
        }
    };

    bot.sendMessage(chatId, 'Выберите действие:', options);
});

// === Обработка нажатий на инлайн-кнопки ===
bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;

    let responseText = '';

    switch (data) {
        case 'btn1':
            responseText = 'Кнопка 1 нажата!';
            break;
        case 'btn2':
            responseText = 'Кнопка 2 нажата!';
            break;
        case 'btn3':
            responseText = 'Кнопка 3 нажата!';
            break;
        case 'btn4':
            responseText = 'Кнопка 4 нажата!';
            break;
        case 'btn5':
            responseText = 'Кнопка 5 нажата!';
            break;
        default:
            responseText = 'Неизвестная кнопка!';
    }

    bot.answerCallbackQuery(query.id, { text: responseText });
});

// === Роут для вебхука ===
app.post(webhookEndpoint, (req, res) => {
    if (!req.body) return res.sendStatus(400);

    try {
        bot.processUpdate(req.body);
        res.sendStatus(200);
    } catch (err) {
        console.error('Ошибка обработки обновления:', err.message);
        res.sendStatus(500);
    }
});

// === Главная страница ===
app.get('/', (req, res) => {
    res.send('Бот работает!');
});

// === Пинг самого себя, чтобы Render не усыпал сервис ===
function wakeUpRender() {
    const HOST = `https://${host}`;
    console.log(`📡 Пингую себя: ${HOST}`);

    fetch(HOST)
        .then(res => {
            if (res.status === 200) {
                console.log('✅ Render ответил OK — бот жив!');
            } else {
                console.warn(`⚠️ Render ответил статусом: ${res.status}`);
            }
        })
        .catch(err => {
            console.error('❌ Ошибка пинга:', err.message);
        });
}

// Запуск каждые 14 минут
setInterval(wakeUpRender, 14 * 60 * 1000);

// Первый пинг при старте
wakeUpRender();

// === Запуск сервера ===
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
});
