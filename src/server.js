import express from "express";
import { PORT } from "./config.js";
import { logger } from "./logger.js";
import { startTelethonClient } from "./telethonClient.js";
import app from "./telegramBot.js";

// Express сервер для Render
app.get("/", (req, res) => {
    res.send("Бот работает!");
});

app.listen(PORT, () => {
    logger.info(`Сервер запущен на порту ${PORT}`);
    startTelethonClient();
});