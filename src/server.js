import express from 'express';
import { bot } from './bot.js';
import { WEBHOOK_URL, BOT_TOKEN } from './config.js';

const app = express();
app.use(express.json());

app.post(`/webhook/${BOT_TOKEN}`, (req, res) => {
    bot.handleUpdate(req.body);
    res.sendStatus(200);
});

app.listen(3000, async () => {
    console.log('🚀 Webhook сервер запущен на порту 3000');
    try {
        await bot.telegram.setWebhook(WEBHOOK_URL);
        console.log(`✅ Webhook установлен: ${WEBHOOK_URL}`);
    } catch (error) {
        console.error('❌ Ошибка при установке Webhook:', error);
    }
});
