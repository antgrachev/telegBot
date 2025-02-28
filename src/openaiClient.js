import { OpenAI } from 'openai';
import { OPENAI_API_KEY } from "./config.js";
import { logger } from "./logger.js";
import { BOT_BEHAVIOR } from "./botConfig.js";

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY
});

export async function generateOpenAIResponse(prompt) {
    try {
        const messages = [...BOT_BEHAVIOR, { role: "user", content: prompt }];
        const response = await openai.createChatCompletion({
            model: "gpt-4",
            messages,
            max_tokens: 200,
            temperature: 0.7
        });
        return response.data.choices[0].message.content.trim();
    } catch (error) {
        logger.error(`Ошибка при запросе к OpenAI: ${error.message}`);
        return "Произошла ошибка при обработке запроса. Попробуйте позже.";
    }
}