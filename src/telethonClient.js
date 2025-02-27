import pkg from 'telegram';  // Импортируем дефолтный экспорт
const { TelegramClient, events } = pkg;  // Деструктурируем TelegramClient и events
import { StringSession } from 'telegram/sessions/index.js';
import { API_ID, API_HASH, STRING_SESSION, PHONE_NUMBER, TELEGRAM_PASSWORD, TELEGRAM_USER_ID } from './config.js';
import { generateOpenAIResponse } from './openaiClient.js';
import { logger } from './logger.js';
import bot from './telegramBot.js';

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

        // Подписка на текстовые сообщения
        client.addEventHandler(async (event) => {
            const message = event.message;
            if (message && message.text) {
                // Логирование текста сообщения
                logger.info(`Перехвачено сообщение: ${message.text}`);
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
        }, new events.NewMessage({ incoming: true })); // Используем событие через events

    } catch (error) {
        logger.error("Ошибка при запуске Telethon клиента:", error);
        console.error("Ошибка при запуске Telethon клиента:", error);
    }
}
