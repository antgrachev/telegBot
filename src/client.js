import { Api, TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import { API_ID, API_HASH, SESSION_STRING } from "./config.js";
import input from "input"; // Для ввода кода при первом запуске
import dotenv from 'dotenv';
import { bot } from './bot.js';

dotenv.config();

const session = new StringSession(SESSION_STRING);

export const client = new TelegramClient(session, API_ID, API_HASH, {
    connectionRetries: 5
});
(async () => {
    await client.start();
    console.log("✅ Клиент Telegram запущен!");
})();

(async () => {
    await client.start({
        phoneNumber: async () => await input.text("Введите ваш номер телефона: "),
        password: async () => await input.text("Введите пароль (если есть 2FA): "),
        phoneCode: async () => await input.text("Введите код из Telegram: "),
        onError: (err) => console.error(err),
    });

    console.log("✅ Личный Telegram-клиент запущен!");
    process.env.SESSION_STRING = client.session.save(); // Сохраняем сессию

    client.addEventHandler(async (event) => {
        if (!event.message || event.message.out) return; // Добавлена проверка на существование message
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

