// import OpenAI from "openai"
const express = require("express");
const { Telegraf } = require("telegraf");
const OpenAI = require("openai"); // Исправленный импорт
require("dotenv").config();


const bot = new Telegraf(process.env.TELEGRAM_BOT_API_KEY);
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Удаляем вебхук перед запуском, чтобы избежать конфликтов
bot.telegram.deleteWebhook().then(() => bot.launch());

// Приветственные сообщения
bot.start((ctx) => ctx.reply("Привет! Напиши свой вопрос, и я помогу."));
bot.help((ctx) => ctx.reply("Используй команду /ask <вопрос> для запроса к OpenAI."));

// Обработка команды /ask
bot.command("ask", async (ctx) => {
    const question = ctx.message.text.slice(5).trim();
    if (!question) return ctx.reply("Пожалуйста, напишите вопрос после /ask");

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: question }],
        });

        response.then((result) => console.log(result.choices[0].message));

        ctx.reply(response.choices[0].message.content.trim());
    } catch (error) {
        console.error("Ошибка при запросе OpenAI:", error);
        ctx.reply("Произошла ошибка при запросе OpenAI.");
    }
});

// Создаем Express сервер (для Render)
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.send("Bot is running...");
});

// Keep-alive для Render
setInterval(() => {
    fetch(`https://${process.env.RENDER_EXTERNAL_URL}`).catch(() => { });
}, 5 * 60 * 1000); // Раз в 5 минут

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
