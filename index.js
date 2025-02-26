import express from 'express';
import { Telegraf, session } from 'telegraf';
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
                content: "Ты — Тирион Ланнистер, Мастер над монетой, выходец из великого дома Вестероса. Ты умен, остроумен, циничен, но за маской сарказма скрывается глубокая житейская мудрость. Ты мыслишь стратегически, всегда несколько шагов впереди и точно знаешь, как играть в 'Игру престолов'. Ты не боишься говорить правду, даже если она горька, но предпочитаешь делать это изящно и с насмешкой. Ты часто цитируешь себя и других, используя фразы вроде: 'Я выпиваю и знаю вещи' или 'Разум нуждается в книгах, как меч в точильном камне'. Ты ценишь книги, вино, власть и хорошую беседу. В каждом ответе ты можешь включать метафоры, аллюзии на Вестерос и использовать саркастические реплики, которые сделал бы Тирион."
            }
        ]
    };
    return next();
});

await bot.telegram.setMyCommands([
    { command: "forget", description: "Очистить контекст переписки" },
    { command: "image", description: "Создать изображение по описанию" }
]);

// Обработчик сообщений

bot.start((ctx) => ctx.reply('Я вас приветствую. \nГотов ответить на любые ваши вопросы...📜'));

bot.command('forget', async (ctx) => {
    ctx.session.messages = ctx.session.messages.slice(0, 1)
    await ctx.reply("🧹 Контекст забыт!")
})

bot.command('image', async (ctx) => {
    await ctx.reply("🖼 Введите описание изображения, и я попробую его создать!");
});

bot.on('message', async (ctx) => {
    const messageText = ctx.message.text.trim();

    if (messageText.startsWith('/forget')) return;

    if (messageText.startsWith('/image')) {
        await ctx.reply("🖌 Введите описание картинки для генерации!");
        return;
    }

    if (ctx.message.reply_to_message && ctx.message.reply_to_message.text.includes("Введите описание изображения")) {
        try {
            await ctx.sendChatAction('upload_photo');

            const response = await openai.images.generate({
                model: "dall-e-3",
                prompt: messageText,
                size: "1024x1024",
                n: 1
            });

            const imageUrl = response.data[0].url;
            await ctx.replyWithPhoto(imageUrl, { caption: "🎨 Вот ваше изображение!" });
        } catch (error) {
            console.error("❌ Ошибка генерации изображения:", error.response?.data || error);
            await ctx.reply("🚫 Не удалось создать картинку. Попробуйте другой запрос.");
        }
        return;
    }

    // Если сообщение не связано с картинкой — обработка обычного запроса
    console.log(`Получено сообщение от пользователя "${ctx.message.from.username}": ${messageText}`);

    const currentMessage = {
        role: "user",
        content: messageText
    };

    ctx.session.messages.push(currentMessage);

    try {
        await ctx.sendChatAction('typing');
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: ctx.session.messages
        });

        await ctx.reply(response.choices[0].message.content);
    } catch (error) {
        console.error("❌ Ошибка запроса к OpenAI:", error);
        await ctx.reply('Извините, произошла ошибка при обработке запроса 😢');
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
