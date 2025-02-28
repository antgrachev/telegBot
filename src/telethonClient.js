import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import { API_ID, API_HASH, STRING_SESSION, PHONE_NUMBER, TELEGRAM_PASSWORD, TELEGRAM_USER_ID } from "./config.js";
import { generateOpenAIResponse } from "./openaiClient.js";
import { logger } from "./logger.js";
import bot from "./telegramBot.js";

const session = new StringSession(STRING_SESSION);
export const client = new TelegramClient(session, Number(API_ID), API_HASH, { connectionRetries: 5 });

export async function startTelethonClient() {
    try {
        // Подключаем клиент и выполняем авторизацию
        await client.start({
            phoneNumber: async () => PHONE_NUMBER,
            password: async () => TELEGRAM_PASSWORD,
            phoneCode: async () => {
                console.log("Введите код, отправленный в Telegram:");
                return await new Promise(resolve => process.stdin.once("data", data => resolve(data.toString().trim())));
            },
            onError: (err) => {
                logger.error("Ошибка при авторизации:", err);
                console.error("Ошибка при авторизации:", err);
            },
        });
        console.log("Telethon клиент запущен.");

        // Проверка авторизации
        if (!client.isUserAuthorized()) {
            console.log("Пользователь не авторизован.");
            return;
        }
        console.log("Пользователь успешно авторизован.");

        // Проверяем, что подключение к Telegram установлено
        if (!client.connected) {
            console.log("Нет подключения к Telegram.");
            return;
        }

        // Добавляем обработчик событий
        client.addEventHandler(async (event) => {
            console.log("Получено событие от Telegram:", event);

            const message = event.message;
            if (!message || !message.text) {
                console.log("Это не текстовое сообщение или оно пустое.");
                return;
            }

            console.log("Получено текстовое сообщение:", message.text);

            if (message.senderId === Number(TELEGRAM_USER_ID)) {
                logger.info(`Перехвачено сообщение от пользователя: ${message.text}`);
                try {
                    const response = await generateOpenAIResponse(message.text);
                    if (response) {
                        await bot.telegram.sendMessage(TELEGRAM_USER_ID, response);
                    } else {
                        logger.warn("Ответ от OpenAI пустой.");
                    }
                } catch (error) {
                    logger.error("Ошибка при генерации ответа от OpenAI:", error);
                    await bot.telegram.sendMessage(TELEGRAM_USER_ID, "Произошла ошибка при обработке вашего запроса.");
                }
            }
        });



    } catch (error) {
        logger.error("Ошибка при запуске Telethon клиента:", error);
        console.error("Ошибка при запуске Telethon клиента:", error);
    }
}
