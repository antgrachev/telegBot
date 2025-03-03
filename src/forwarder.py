import os
import asyncio
import requests
from dotenv import load_dotenv
from telethon import TelegramClient, events

# Загрузка конфигурации
load_dotenv()
API_ID = os.getenv("API_ID")
API_HASH = os.getenv("API_HASH")
PHONE_NUMBER = os.getenv("PHONE_NUMBER")
SERVER_URL = os.getenv("SERVER_URL")  # URL твоего Node.js-сервера

# Подключение клиента
client = TelegramClient("session", API_ID, API_HASH)

@client.on(events.NewMessage(incoming=True))
async def handler(event):
    sender = await event.get_sender()
    message = event.message.message

    print(f"📩 Получено сообщение от {sender.id}: {message}")

    # Отправка сообщения на сервер
    response = requests.post(
        f"{SERVER_URL}/forward",
        json={"user_id": sender.id, "message": message}
    )

    # Проверка ответа сервера
    if response.status_code == 200:
        print("✅ Сообщение успешно отправлено!")
    else:
        print(f"❌ Ошибка отправки: {response.text}")

async def main():
    await client.start(phone=PHONE_NUMBER)
    print("🤖 Бот для пересылки сообщений запущен!")
    await client.run_until_disconnected()

asyncio.run(main())
