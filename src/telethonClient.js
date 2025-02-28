import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js"; // указываем индексный файл
import { API_ID, API_HASH, STRING_SESSION, PHONE_NUMBER, TELEGRAM_PASSWORD, TELEGRAM_USER_ID } from "./config.js";
import { generateOpenAIResponse } from "./openaiClient.js";
import { logger } from "./logger.js";
import bot from "./telegramBot.js";

const session = new StringSession(STRING_SESSION);
export const client = new TelegramClient(session, Number(API_ID), API_HASH, { connectionRetries: 5 });

export async function startTelethonClient() {
    await client.start({
        phoneNumber: async () => PHONE_NUMBER,
        password: async () => TELEGRAM_PASSWORD,
        phoneCode: async () => {
            console.log("Введите код, отправленный в Telegram:");
            return await new Promise(resolve => process.stdin.once("data", data => resolve(data.toString().trim())));
        },
        onError: (err) => console.error(err),
    });
    console.log("Telethon клиент запущен.");

    client.addEventHandler(async (event) => {
        const message = event.message;
        if (message && message.senderId === Number(TELEGRAM_USER_ID)) {
            logger.info(`Перехвачено сообщение от пользователя: ${message.text}`);
            const response = await generateOpenAIResponse(message.text);
            await bot.telegram.sendMessage(TELEGRAM_USER_ID, response);
        }
    });
}