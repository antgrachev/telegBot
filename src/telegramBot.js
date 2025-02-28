import { Telegraf, Markup } from "telegraf";
import { BOT_TOKEN, WEBHOOK_URL } from "./config.js";
import { generateOpenAIResponse } from "./openaiClient.js";
import { logger } from "./logger.js";
import express from "express";

const bot = new Telegraf(BOT_TOKEN);
const app = express();
app.use(express.json());

const userContexts = new Map(); // Хранение контекста пользователей

bot.on("text", async (ctx) => {
    const userId = ctx.message.from.id;
    const userMessage = ctx.message.text;
    logger.info(`Получено сообщение от ${userId}: ${userMessage}`);

    if (userMessage === "Очистить контекст") {
        userContexts.delete(userId);
        await ctx.reply("Контекст очищен.");
        return;
    }

    if (!userContexts.has(userId)) {
        userContexts.set(userId, []);
    }

    const userContext = userContexts.get(userId);
    userContext.push({ role: "user", content: userMessage });

    await ctx.sendChatAction("typing"); // Индикация печати
    const response = await generateOpenAIResponse(userMessage);
    userContext.push({ role: "assistant", content: response });
    userContexts.set(userId, userContext);

    await ctx.reply(response, Markup.keyboard([['Очистить контекст']]).resize());
    logger.info("Ответ отправлен пользователю.");
});

bot.telegram.setWebhook(WEBHOOK_URL);
app.post("/webhook", (req, res) => {
    bot.handleUpdate(req.body);
    res.sendStatus(200);
});

export default app;
