import { Telegraf } from 'telegraf';
import { BOT_TOKEN } from './config.js';
import { openai } from './openai.js';
import { setupSession } from './middleware.js';

export const bot = new Telegraf(BOT_TOKEN);
setupSession(bot);

bot.start((ctx) => ctx.reply('Я вавас приветствую и внимамательно слушаю. \nЗазадавайте ваш вопрос...'));

bot.command('forget', async (ctx) => {
    ctx.session.messages = ctx.session.messages.slice(0, 1);
    await ctx.reply("🧹 Контекст забыт!");
});

bot.on('message', async (ctx) => {
    const messageText = ctx.message.text.trim();
    if (messageText.includes('/forget')) return;
    console.log(`Получено сообщение от пользователя "${ctx.message.from.username}": ${messageText}`);

    ctx.session.messages.push({ role: "user", content: messageText });
    ctx.session.messages = ctx.session.messages.slice(-10); // Храним последние 10 сообщений
    const request = {
        model: "gpt-4o-mini",
        messages: ctx.session.messages
    };

    let retries = 3;
    while (retries > 0) {
        try {
            await ctx.sendChatAction('typing');
            const response = await openai.chat.completions.create(request);
            ctx.reply(response.choices[0].message.content);
            break; // Выходим из цикла после успешного ответа
        } catch (error) {
            if (error.code === 'rate_limit_exceeded') {
                console.warn(`⚠️ Лимит запросов достигнут, ждем 30 секунд...`);
                await new Promise(resolve => setTimeout(resolve, 30000));
                retries--;
            } else {
                console.error(`❌ Ошибка OpenAI:`, error);
                return ctx.reply('Извините, произошла ошибка при обработке запроса 😢');
            }
        }
    }

    if (retries === 0) {
        ctx.reply('Извините, сервис временно перегружен. Попробуйте позже.');
    }
});
