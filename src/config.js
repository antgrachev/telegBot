


if (!BOT_TOKEN || !OPENAI_API_KEY) {
    console.error('❌ ERROR: Убедись, что BOT_TOKEN и OPENAI_API_KEY указаны в .env');
    process.exit(1);
}


import dotenv from "dotenv";
dotenv.config();

export const API_ID = process.env.API_ID;
export const API_HASH = process.env.API_HASH;
export const BOT_TOKEN = process.env.BOT_TOKEN;
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
export const PORT = process.env.PORT || 3000;
export const TELEGRAM_USER_ID = process.env.TELEGRAM_USER_ID;
export const PHONE_NUMBER = process.env.PHONE_NUMBER;
export const TELEGRAM_PASSWORD = process.env.TELEGRAM_PASSWORD;
export const STRING_SESSION = process.env.STRING_SESSION;
// export const WEBHOOK_URL = process.env.WEBHOOK_URL;
export const WEBHOOK_URL = `https://telegbot-qgzu.onrender.com/webhook/${BOT_TOKEN}`;

