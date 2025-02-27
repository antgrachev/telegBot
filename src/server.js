import "dotenv/config";
import express from "express";
import { Telegraf } from "telegraf";
import axios from "axios";

const app = express();
app.use(express.json());

const BOT_TOKEN = process.env.BOT_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const bot = new Telegraf(BOT_TOKEN);

// Обработка входящих сообщений от Python-скрипта
app.post("/forward", async (req, res) => {
    const { user_id, message } = req.body;

    if (!user_id || !message) {
        return res.status(400).send("❌ Некорректные данные");
    }

    console.log(`📥 Вопрос от ${user_id}: ${message}`);

    // Отправка запроса в OpenAI
    try {
        const openaiResponse = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4o",
                messages: [{ role: "user", content: message }],
            },
            { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
        );

        const reply = openaiResponse.data.choices[0].message.content;

        // Отправка ответа в Telegram
        await bot.telegram.sendMessage(user_id, reply);
        console.log(`📤 Ответ отправлен: ${reply}`);

        res.sendStatus(200);
    } catch (error) {
        console.error("❌ Ошибка OpenAI:", error);
        res.status(500).send("Ошибка OpenAI");
    }
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Сервер запущен на порту ${PORT}`));
