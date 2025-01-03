# chat/consumers.py
import json

from channels.generic.websocket import AsyncWebsocketConsumer


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user_name = f"user"
        self.room_group_name = f"chat_transcendence"
        message = self.user_name + " has joined\n"

        # Join room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        await self.channel_layer.group_send(
            self.room_group_name, {"type": "chat.message", "message": message}
        )
#       for each user in friendlist
#           channel_layer = db_user:channel
#           await channel_layer.send("channel_name", {
#               "type": "chat.message", "message": message})

    async def disconnect(self, close_code):
        message = self.user_name + " has leaved\n"
        await self.channel_layer.group_send(
            self.room_group_name, {"type": "chat.message", "message": message}
        )
        # Leave room group
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json["message"]
        message = (self.user_name + ': ' + message + "\n")

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name, {"type": "chat.message", "message": message}
        )

    async def chat_message(self, event):
        message = event["message"]

        # Send message to WebSocket
        await self.send(text_data=json.dumps({"message": message}))
