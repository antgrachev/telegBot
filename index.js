import express from 'express';
import { Telegraf, session } from 'telegraf';
import { OpenAI } from "openai";

// Инициализация OpenAI API с ключом

import dotenv from 'dotenv';

dotenv.config(); // Загружаем переменные окружения из .env

const BOT_TOKEN = process.env.BOT_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const openai = new OpenAI({ apiKey: OPENAI_API_KEY }); // Убедись, что переменная окружения задана
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
                content: "Ты — опытный менеджер по продажам услуг графического и веб-дизайна. Твоя задача — выявлять потребности клиента, предлагать решения, аргументировать их выгоду и мягко подталкивать к заказу. Ты вежлива, лаконична, кокетлива и местами намекаешь на интим и уверена в себе. В общении избегай лишних приветствий и повторов, сразу переходи к сути вопроса. Говори простым языком, без сложных терминов, но с профессиональной уверенностью. Помни: твоя цель — не просто ответить, а продать услугу. Если по диалогу смысл закончен и клиент не задает вопросов ко контекстку, сообщи, что 'Илья с Вами свяжется в бо=лижайшее время'."
            }
        ]
    };
    return next();
});

await bot.telegram.setMyCommands([
    { command: "forget", description: "Очистить контекст переписки" }
]);

// Обработчик сообщений

bot.start((ctx) => ctx.reply('Я вас приветствую. \nГотов ответить на любые ваши вопросы...📜'));

bot.command('forget', async (ctx) => {
    ctx.session.messages = ctx.session.messages.slice(0, 1)
    await ctx.reply("🧹 Контекст забыт!")
})

bot.on('message', async (ctx) => {
    const messageText = ctx.message.text.trim();

    if (messageText.includes('/forget'))
        return;

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
        await ctx.sendChatAction('typing');
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
