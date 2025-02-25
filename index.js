import express from 'express';
import { Telegraf } from 'telegraf';
import { OpenAI } from "openai";

// Инициализация OpenAI API с ключом


import dotenv from 'dotenv';

dotenv.config(); // Загружаем переменные окружения из .env

const BOT_TOKEN = process.env.BOT_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Убедись, что переменная окружения задана
});
const WEBHOOK_URL = `https://telegbot-qgzu.onrender.com/webhook/${BOT_TOKEN}`; // Укажи свой домен

if (!BOT_TOKEN || !OPENAI_API_KEY) {
    console.error('❌ ERROR: Убедись, что BOT_TOKEN и OPENAI_API_KEY указаны в .env');
    process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);
const app = express();
app.use(express.json());

// Подключаем сессию
bot.use(session());

// Инициализация контекста пользователя
bot.use((ctx, next) => {
    if (!ctx.session) ctx.session = {
        messages: [
            {
                role: "system",
                content: "Ты помошница по бизнесу, разговариваешь простым языком, нежно и ласково. Но говори почаще 'Дон', так как это делает Кадыров"
            }
        ]
    };
    return next();
});

// Обработчик сообщений

bot.start((ctx) => ctx.reply('Хай балагай'));

bot.command('/forget', async (ctx) => ctx.session.messages.slice(0, 1))

bot.on('message', async (ctx) => {
    const messageText = ctx.message.text.trim();

    console.log(`Получено сообщение от пользователя "${ctx.message.from.username}": ${messageText}`);

    const currentMessage = {
        role: "user",
        content: messageText
    }

    // Добавляем сообщение пользователя в историю
    ctx.session.messages.push(currentMessage);

    const request = {
        model: "gpt-4o-mini",
        messages: ctx.session.messages
    }
    try {
        const response = await openai.chat.completions.create(request);

        ctx.reply(response.choices[0].message.content);
    } catch (error) {
        console.error(`❌ Ошибка запроса к OpenAI:`, error);
        ctx.reply('Извините, произошла ошибка при обработке запроса 😢');
    }
});


// Устанавливаем Webhook 
app.post(`/webhook/${BOT_TOKEN}`, (req, res) => {
    bot.handleUpdate(req.body);
    res.sendStatus(200);
});

// Запускаем сервер
app.listen(3000, async () => {
    console.log('🚀 Webhook сервер запущен на порту 3000');

    try {
        await bot.telegram.setWebhook(WEBHOOK_URL);
        console.log(`✅ Webhook установлен: ${WEBHOOK_URL}`);
    } catch (error) {
        console.error('❌ Ошибка при установке Webhook:', error);
    }
});
