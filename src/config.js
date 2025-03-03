import dotenv from 'dotenv';
dotenv.config();

export const BOT_TOKEN = process.env.BOT_TOKEN;
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
export const WEBHOOK_URL = `https://telegbot-qgzu.onrender.com/webhook/${BOT_TOKEN}`;

export const API_ID = Number(process.env.API_ID);  // Преобразуем в число
export const API_HASH = process.env.API_HASH;
export const SESSION_STRING = process.env.SESSION_STRING;

if (!BOT_TOKEN || !OPENAI_API_KEY || !API_ID || !API_HASH || !SESSION_STRING) {
    console.error('❌ ERROR: Убедись, что все переменные окружения указаны в .env');
    process.exit(1);
}


if (!BOT_TOKEN || !OPENAI_API_KEY) {
    console.error('❌ ERROR: Убедись, что BOT_TOKEN и OPENAI_API_KEY указаны в .env');
    process.exit(1);
}

console.log('BOT_TOKEN || OPENAI_API_KEY указаны')
