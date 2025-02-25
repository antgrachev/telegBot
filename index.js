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

// Обработчик сообщений
bot.command('ask', async (ctx) => {
    const userMessage = ctx.message.text.replace('/ask', '').trim();

    if (!userMessage) {
        return ctx.reply('Пожалуйста, напишите вопрос после /ask');
    }

    console.log(`🔍 Отправляю запрос в OpenAI: ${userMessage}`);

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                {
                    role: "user",
                    content: "Write a haiku about recursion in programming.",
                },
            ],
            store: true,
        });

        console.log(`✅ Ответ от OpenAI: ${response.choices[0].message.content}`);

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
