// index.js
const { Telegraf } = require('telegraf');
const { OpenAI } = require('openai'); // Импортируем OpenAI из библиотеки

// Загружаем переменные окружения
require('dotenv').config();

// Инициализация бота с Telegram API ключом из переменных окружения
const bot = new Telegraf(process.env.TELEGRAM_BOT_API_KEY);

// Инициализация OpenAI клиента (без использования конструктора)
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: 'https://api.openai.com/v1',
});

// Приветственное сообщение
bot.start((ctx) => ctx.reply('Привет! Напиши что-то, и я помогу тебе с ответом!'));
bot.help((ctx) => ctx.reply('Просто напиши свой вопрос или команду.'));

// Обработка команды /ask, которая отправляет запрос в OpenAI API
bot.command('ask', async (ctx) => {
    const question = ctx.message.text.slice(5).trim(); // получаем вопрос после команды /ask

    if (!question) {
        return ctx.reply('Пожалуйста, напишите вопрос после команды /ask');
    }

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo', // Модель для общения
            messages: [{ role: 'user', content: question }],
        });

        ctx.reply(response.choices[0].message.content.trim());
    } catch (error) {
        ctx.reply('Произошла ошибка при запросе OpenAI');
    }
});

// Запуск бота
bot.launch();

// Экспорт для Render
module.exports = (req, res) => {
    res.status(200).send('Bot is running');
};