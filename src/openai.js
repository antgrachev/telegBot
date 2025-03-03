import { OpenAI } from "openai";
import { OPENAI_API_KEY } from "./config.js";

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

export async function askOpenAI(messages) {
    const request = {
        model: "gpt-4o-mini",
        messages: messages.slice(-10) // Храним последние 10 сообщений
    };

    let retries = 3;
    while (retries > 0) {
        try {
            const response = await openai.chat.completions.create(request);
            return response.choices[0].message.content;
        } catch (error) {
            if (error.code === 'rate_limit_exceeded') {
                console.warn(`⚠️ Лимит запросов достигнут, ждем 30 секунд...`);
                await new Promise(resolve => setTimeout(resolve, 30000));
                retries--;
            } else {
                console.error(`❌ Ошибка OpenAI:`, error);
                return 'Извините, произошла ошибка при обработке запроса 😢';
            }
        }
    }
    return 'Извините, сервис временно перегружен. Попробуйте позже.';
}
