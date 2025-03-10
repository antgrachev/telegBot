// import { Api, TelegramClient } from "telegram";
// import { StringSession } from "telegram/sessions/index.js";
// import { API_ID, API_HASH, SESSION_STRING } from "./config.js";
// import input from "input"; // Для ввода кода при первом запуске
// import dotenv from 'dotenv';
// import { bot } from './bot.js';

// dotenv.config();

// const session = new StringSession(SESSION_STRING);

// export const client = new TelegramClient(session, API_ID, API_HASH, {
//     connectionRetries: 5
// });

// async function startClient() {
//     await client.start({
//         phoneNumber: async () => await input.text("Введите ваш номер телефона: "),
//         password: async () => await input.text("Введите пароль (если есть 2FA): "),
//         phoneCode: async () => await input.text("Введите код из Telegram: "),
//         onError: (err) => console.error(err),
//     });

//     console.log("✅ Личный Telegram-клиент запущен!");
//     process.env.SESSION_STRING = client.session.save(); // Сохраняем сессию

//     // Добавляем обработчик событий
//     client.addEventHandler(async (event) => {
//         if (!event.message || event.message.out) return; // Игнорируем исходящие сообщения

//         const messageText = event.message.message || ''; // Убедитесь, что текст существует
//         console.log(`📩 Получено сообщение: ${messageText}`);

//         if (!messageText.trim()) {
//             console.log("❌ Сообщение пустое");
//             return; // Пропускаем пустые сообщения
//         }

//         try {
//             await bot.handleUpdate({
//                 update_id: Date.now(),
//                 message: {
//                     message_id: event.message.id || 'неизвестно', // Защищаем от ошибок с пустыми id
//                     from: {
//                         id: event.message.senderId ? event.message.senderId.value : 'неизвестно', // Защищаем от ошибки
//                         is_bot: false,
//                         first_name: "Вы",
//                         username: "user",
//                     },
//                     chat: {
//                         id: event.message.chatId || 'неизвестно', // Защищаем от ошибки с пустыми chatId
//                         type: "private"
//                     },
//                     date: event.message.date || Math.floor(Date.now() / 1000), // Защищаем от ошибки с пустой датой
//                     text: messageText
//                 }
//             });

//             console.log(`✅ Ответ отправлен`);
//         } catch (error) {
//             console.error(`❌ Ошибка обработки сообщения:`, error);
//         }
//     });
// }

// // Запускаем клиент
// startClient().catch(console.error);
