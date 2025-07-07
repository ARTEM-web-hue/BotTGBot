const { Telegraf } = require('telegraf');
const { InlineKeyboard } = require('telegraf/scenes');
const express = require('express');
const path = `/bot${process.env.BOT_TOKEN}`;
require('dotenv').config();
// === SQLite База данных ===
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./bot.db');

// === Инициализация бота ===
const bot = new Telegraf(process.env.BOT_TOKEN);

// === Создание таблицы при старте ===
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            first_seen TEXT
        )
    `);

    // Добавляем запись о первом запуске, если её нет
    db.get("SELECT value FROM meta WHERE key = 'first_launch'", [], (err, row) => {
        if (!row) {
            const now = new Date().toISOString();
            db.run("INSERT INTO meta (key, value) VALUES ('first_launch', ?)", [now]);
        }
    });

    // Создаём таблицу meta для служебных данных
    db.run(`
        CREATE TABLE IF NOT EXISTS meta (
            key TEXT PRIMARY KEY,
            value TEXT
        )
    `);
});


// === Express сервер (для вебхуков) ===
const app = express();
const PORT = process.env.PORT || 3000;

bot.start((ctx) => {
    const userId = ctx.from.id;
    const now = new Date().toISOString();

    // Проверяем, есть ли пользователь в БД
    db.get("SELECT id FROM users WHERE id = ?", [userId], (err, row) => {
        if (!row) {
            // Добавляем нового пользователя
            db.run("INSERT INTO users (id, first_seen) VALUES (?, ?)", [userId, now]);
        }
    });

    // === Твоя клавиатура ===
    const buttons = {
        reply_markup: {
            keyboard: [
                [{ text: '🪀 Заработок' }],
                [{ text: '❄️ О боте' }]
            ],
            resize_keyboard: true
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
bot.hears('❄️ О боте', (ctx) => {
    // Считаем общее количество пользователей
    db.get("SELECT COUNT(*) as total FROM users", [], (err, rowTotal) => {
        if (err) return console.error(err);

        const totalUsers = rowTotal.total || 0;

        // Считаем новых за сегодня
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        db.get("SELECT COUNT(*) as newToday FROM users WHERE first_seen LIKE ?", [`${today}%`], (err, rowToday) => {
            if (err) return console.error(err);

            const newToday = rowToday.newToday || 0;

            // Считаем сколько дней прошло
            db.get("SELECT value FROM meta WHERE key = 'first_launch'", [], (err, rowLaunch) => {
                if (err) return console.error(err);

                let daysWorking = 0;
                if (rowLaunch?.value) {
                    const launchDate = new Date(rowLaunch.value);
                    const diffDays = Math.floor((new Date() - launchDate) / (1000 * 60 * 60 * 24));
                    daysWorking = diffDays >= 0 ? diffDays : 0;
                }

                // Сообщение со статистикой
                const statsText = `
📊 Статистика нашего бота:
────────────────────
👤 Пользователей в боте: ${totalUsers}
🔥 Новых за сегодня: ${newToday}
💎 Выплачено gram: 0.00
🗓️ Дней в работе: ${daysWorking}
                `;

                // Инлайн-кнопки
                const inlineButtons = new InlineKeyboard()
                    .url('📢 Канал', 'https://t.me/channel_ot_bota')
                    .row()
                    .url('💬 Чат', 'https://t.me/+0ayvMuQkwDZlZmEy')
                    .row()
                    .url('🧑‍💻 Администратор', 'https://t.me/artemax102');

                // Отправляем сообщение
                ctx.reply(statsText, {
                    reply_markup: inlineButtons
                });
            });
        });
    });
});
// === Запуск сервера ===
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
});
