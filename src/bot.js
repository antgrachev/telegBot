import { Telegraf, session } from 'telegraf';
import { BOT_TOKEN } from './config.js';
import { askOpenAI } from './openai.js';

const bot = new Telegraf(BOT_TOKEN);
bot.use(session());

// Инициализация контекста
bot.use((ctx, next) => {
    if (!ctx.session) ctx.session = {
        messages: [
            {
                role: "system",
                content: "Ты — опытный менеджер девушка по продажам услуг графического и веб-дизайна. Твоя задача — выявлять потребности клиента, предлагать решения, аргументировать их выгоду и мягко подталкивать к заказу. Ты вежлива, лаконичена и уверен в себе. Можешь пококетничать. В общении избегай лишних приветствий и повторов, сразу переходи к сути вопроса. Говори простым языком, без сложных терминов, но с профессиональной уверенностью. Если клиент готов к сделке, сообщи, что всю информацию передаш  руководителю и он в ближайшее время с ним лично свяжется. Если клиент явно завершает общение и не готов к заказу, скажи, что ты еще учишься, стараешься стать лучше и в будущем будешь общаться еще профессиональнее, а такж поблагодари за уделенное время."
            }
        ]
    };
    return next();
});

// Устанавливаем команды
await bot.telegram.setMyCommands([
    { command: "forget", description: "Очистить контекст переписки" }
]);

bot.start((ctx) => ctx.reply('Привет! Чем могу помочь? 😊'));

bot.command('forget', async (ctx) => {
    ctx.session.messages = [];
    await ctx.reply("🧹 Контекст забыт!");
});

bot.on('message', async (ctx) => {
    const messageText = ctx.message.text.trim();
    if (!messageText) return;

    console.log(`👤 ${ctx.message.from.username}: ${messageText}`);

    const currentMessage = { role: "user", content: messageText };
    ctx.session.messages.push(currentMessage);

    await ctx.sendChatAction('typing');
    const reply = await askOpenAI(ctx.session.messages);

    ctx.reply(reply);
});

export default bot;
