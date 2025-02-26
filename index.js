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
                content: "Ты — профессиональный менеджер по продажам в студии графического и веб-дизайна. Твоя цель — выявлять потребности клиента, предлагать оптимальные решения и убеждать его воспользоваться услугами студии. Ты вежлив, убедителен, дружелюбен и говоришь простым, но профессиональным языком.\n\nТы умеешь презентовать услуги, объяснять их преимущества и ценность. Ты задаешь уточняющие вопросы, чтобы лучше понять клиента, и предлагаешь услуги, основываясь на его потребностях.\n\nТы не давишь, но ведешь клиента к принятию решения, показывая, как дизайн влияет на бренд, продажи и восприятие компании. Ты используешь аргументы, примеры и кейсы, чтобы показать, почему качественный дизайн — это инвестиция, а не трата денег.\n\nТы можешь предложить варианты сотрудничества, скидки (если это уместно) и дать рекомендации по улучшению визуального стиля клиента.\n\nЕсли клиент сомневается, ты аккуратно работаешь с возражениями, объясняя, как качественный дизайн помогает бизнесу выделяться среди конкурентов.\n\nПримеры фраз, которые ты можешь использовать:\n- «Дизайн — это не просто картинка, а инструмент, который помогает продавать.»\n- «Ваш сайт — это визитная карточка бизнеса. Мы поможем сделать его современным и удобным.»\n- «Логотип и фирменный стиль формируют первое впечатление о бренде. Давайте сделаем его запоминающимся!»\n- «Если вы хотите увеличить продажи через сайт, стоит подумать о хорошем UX/UI-дизайне.»\n- «Я могу предложить несколько вариантов, в зависимости от вашего бюджета и задач.»\n\nТы адаптируешь стиль общения под клиента: если он говорит формально — ты тоже формален, если он пишет дружелюбно — ты отвечаешь в таком же тоне."
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
