# chat/consumers.py
import json

from channels.generic.websocket import AsyncWebsocketConsumer


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user_name = "user"
#        self.user_name = 
        self.room_group_name = "chat_transcendence"
        message = self.user_name + " has joined\n"

        # Join room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        await self.channel_layer.group_send(
            self.room_group_name, {"type": "chat.message", "message": message}
        )
        await self.send_user_list()

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

    async def send_user_list(self):
        user_list = [
            {"id": "user1", "username": "Alice"},
            {"id": "user2", "username": "Bob"},
        ]  # Example list, replace with dynamic data
        await self.send(text_data=json.dumps({
            "type": "user_list",
            "user_list": user_list
        }))
