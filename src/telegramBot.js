import { Telegraf, Markup } from "telegraf";
import { BOT_TOKEN, WEBHOOK_URL } from "./config.js";
import { generateOpenAIResponse } from "./openaiClient.js";
import { logger } from "./logger.js";
import express from "express";

const bot = new Telegraf(BOT_TOKEN);
const app = express();
app.use(express.json());

const userContexts = new Map();

// Обработчик сообщений от пользователей
bot.on("text", async (ctx) => {
    const userId = ctx.message.from.id;
    const userMessage = ctx.message.text;
    logger.info(`Получено сообщение от ${userId}: ${userMessage}`);

    // Очистка контекста по запросу
    if (userMessage === "Очистить контекст") {
        userContexts.delete(userId);
        await ctx.reply("Контекст очищен.");
        return;
    }

    // Инициализация контекста, если его еще нет
    if (!userContexts.has(userId)) {
        userContexts.set(userId, []);
    }

    const userContext = userContexts.get(userId);
    userContext.push({ role: "user", content: userMessage });

    try {
        // Индикация печати
        await ctx.sendChatAction("typing");

        // Логируем запрос к OpenAI
        logger.info(`Отправка запроса в OpenAI для сообщения: ${userMessage}`);

        // Генерация ответа от OpenAI
        const response = await generateOpenAIResponse(userMessage);

        if (response) {
            // Добавление ответа в контекст
            userContext.push({ role: "assistant", content: response });
            userContexts.set(userId, userContext);

            // Отправка ответа пользователю
            await ctx.reply(response, Markup.keyboard([['Очистить контекст']]).resize());
            logger.info("Ответ отправлен пользователю.");
        } else {
            logger.warn("Ответ от OpenAI пустой.");
            await ctx.reply("Не удалось получить ответ от OpenAI.");
        }

    } catch (error) {
        logger.error("Ошибка при запросе к OpenAI:", error);
        await ctx.reply("Произошла ошибка, попробуйте позже.");
    }
});

// Установка вебхука
bot.telegram.setWebhook(WEBHOOK_URL);

// Обработка запросов вебхука
app.post("/webhook", (req, res) => {
    try {
        bot.handleUpdate(req.body);
        res.sendStatus(200);
    } catch (error) {
        logger.error("Ошибка при обработке запроса вебхука:", error);
        res.sendStatus(500);
    }
});

// Возвращаем Express приложение для запуска в `server.js`
export default app;
