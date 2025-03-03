import { Api, TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import input from "input"; // Для ввода кода при первом запуске
import dotenv from 'dotenv';
import { bot } from './bot.js';

dotenv.config();

const apiId = Number(process.env.TELEGRAM_API_ID);
const apiHash = process.env.TELEGRAM_API_HASH;
const stringSession = new StringSession(process.env.TELEGRAM_SESSION || "");

const client = new TelegramClient(stringSession, apiId, apiHash, { connectionRetries: 5 });

(async () => {
    await client.start({
        phoneNumber: async () => await input.text("Введите ваш номер телефона: "),
        password: async () => await input.text("Введите пароль (если есть 2FA): "),
        phoneCode: async () => await input.text("Введите код из Telegram: "),
        onError: (err) => console.error(err),
    });

    console.log("✅ Личный Telegram-клиент запущен!");
    process.env.TELEGRAM_SESSION = client.session.save(); // Сохраняем сессию

    client.addEventHandler(async (event) => {
        if (event.message.out) return; // Игнорируем свои сообщения
        const messageText = event.message.message;

        console.log(`📩 Получено сообщение: ${messageText}`);

        try {
            await bot.handleUpdate({
                update_id: Date.now(),
                message: {
                    message_id: event.message.id,
                    from: {
                        id: event.message.senderId.value,
                        is_bot: false,
                        first_name: "Вы",
                        username: "user",
                    },
                    chat: {
                        id: event.message.chatId,
                        type: "private"
                    },
                    date: Math.floor(Date.now() / 1000),
                    text: messageText
                }
            });

            console.log(`✅ Ответ отправлен`);
        } catch (error) {
            console.error(`❌ Ошибка обработки сообщения:`, error);
        }
    });
})();
