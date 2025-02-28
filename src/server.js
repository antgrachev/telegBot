import express from "express";
import { PORT } from "./config.js";
import { logger } from "./logger.js";
import { startTelethonClient } from "./telethonClient.js";
import app from "./telegramBot.js"; // Здесь ты экспортируешь приложение Express

// Проверка, что приложение правильно настроено
if (!PORT) {
    throw new Error("Не указан порт в переменных окружения!");
}

// Главная страница (чтобы проверить, что сервер работает)
app.get("/", (req, res) => {
    res.send("Бот работает!");
});

// Запуск Express сервера
app.listen(PORT, () => {
    logger.info(`Сервер запущен на порту ${PORT}`);
    startTelethonClient(); // Запуск Telethon клиента
});
