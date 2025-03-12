import { Telegraf } from 'telegraf';
import { BOT_TOKEN } from './config.js';
import { openai } from './openai.js';
import { setupSession } from './middleware.js';

export const bot = new Telegraf(BOT_TOKEN);
setupSession(bot);
console.log(' Бот запущен и готов к работе, а значитcz поехали');

bot.start((ctx) => ctx.reply('Я вас приветствую и внимательно слушаю. \nЗадавайте ваш вопрос...'));

bot.command('forget', async (ctx) => {
    ctx.session.messages = ctx.session.messages.slice(0, 1);
    await ctx.reply("🧹 Контекст забыт!");
});

bot.on('message', async (ctx) => {
    const messageText = ctx.message.text.trim();
    if (messageText.includes('/forget')) return;
    console.log(`Получено сообщение от пользователя "${ctx.message.from.username}": ${messageText}`);

    if (!ctx.session.messages) ctx.session.messages = [];
    ctx.session.messages.push({ role: "user", content: messageText });
    ctx.session.messages = ctx.session.messages.slice(-10);

    const request = {
        model: "gpt-4o-mini",
        messages: ctx.session.messages
    };

    let retries = 3;
    while (retries > 0) {
        try {
            await ctx.sendChatAction('typing');
            const response = await openai.chat.completions.create(request);
            var answer = response.choices[0].message.content;

            ctx.reply(answer, { parse_mode: "Markdown" });
            console.log(`Дан ответ БОТОМ "${bot.botInfo.username}": ${answer}`);
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
        await ctx.reply('Извините, сервис временно перегружен. Попробуйте позже.');
    }
});
