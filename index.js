import express from 'express';
import { Telegraf } from 'telegraf';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config(); // Загружаем переменные окружения из .env

const BOT_TOKEN = process.env.BOT_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const WEBHOOK_URL = `https://telegbot-qgzu.onrender.com/${BOT_TOKEN}`; // Укажи свой домен

if (!BOT_TOKEN || !OPENAI_API_KEY) {
    console.error('❌ ERROR: Убедись, что BOT_TOKEN и OPENAI_API_KEY указаны в .env');
    process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);
const app = express();
app.use(express.json());

// Обработчик сообщений
bot.on('text', async (ctx) => {
    const userMessage = ctx.message.text;
    console.log(`📩 Сообщение от пользователя: ${userMessage}`);

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: userMessage }]
            })
        });

        const data = await response.json();
        const botReply = data.choices?.[0]?.message?.content || 'Извините, не могу ответить 😢';

        console.log(`🤖 Ответ бота: ${botReply}`);
        ctx.reply(botReply);

    } catch (error) {
        console.error('❌ Ошибка при запросе к OpenAI:', error);
        ctx.reply('Произошла ошибка, попробуйте позже 🙏');
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
