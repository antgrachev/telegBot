import os
from dotenv import load_dotenv
from telethon import TelegramClient, events

API_ID = os.getenv("API_ID")
API_HASH = os.getenv("API_HASH")
BOT_USERNAME = os.getenv("BOT_USERNAME") # Юзернейм твоего OpenAI-бота

# Создаем клиент
client = TelegramClient("anon", API_ID, API_HASH)

@client.on(events.NewMessage(incoming=True))
async def forward_to_bot(event):
    if event.is_private:
        await client.send_message(BOT_USERNAME, f"📩 Новое сообщение от {event.sender_id}:\n\n{event.text}")

client.start()
print("Userbot запущен! Пересылаю сообщения в OpenAI-бота.")
client.run_until_disconnected()
