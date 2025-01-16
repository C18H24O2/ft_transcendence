# chat/consumers.py
import sys
import json
import uuid

from channels.generic.websocket import AsyncWebsocketConsumer

blocked_users = {} 
ROOM_NAME = "chat_transcendence-internal00000000000000000000" # gros fix la ouais
connected = {}

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.authenticated = False

        await self.accept()
        #await self.send_user_list()
        #add self to database(username+ channel_name)

    async def disconnect(self, close_code):
        if self.authenticated:
            global connected

            num_conns = connected[self.username]
            if num_conns == 1:
                message = self.username + " has left\n"
                await self._send_message(message)
                connected.pop(self.username)
            else:
                connected[self.username] = num_conns - 1
            
        try:
            # Leave room group
            await self.channel_layer.group_discard(ROOM_NAME, self.channel_name)
        except Exception as e:
            print("what?", e)

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        if "type" not in text_data_json:
            #            await self._error(str(text_data_json), disconnect=False)
            await self._error("Invalid JSON message, missing 'type' datafield")
            return
    
        message_type = text_data_json["type"]
        if message_type == "chat.message" || message_type == "chat.invite":
            await self._handle_message(text_data_json)
        elif message_type == "chat.authenticate":
            await self._authenticate(text_data_json)
        else:
            await self._error(f"Invalid message type '{message_type}'")

    async def _authenticate(self, data):
        if self.authenticated:
            await self._error("Already authenticated, what?")
            return
        global connected

        #TODO: do auth
        #AuthService.is_valid(data.token)
        #user = UserService.get_user(data.token)


        self.authenticated = True
        self.username = str(uuid.uuid4()) #"USER OUAISSSS" #TODO: get actual username from userservice

        n = 0
        if self.username in connected:
            n = connected[self.username]
        connected[self.username] = n + 1

        print("auth user :D", data)
        print("auth user :D", data, file=sys.stderr)
        # Join room group
        await self.channel_layer.group_add(ROOM_NAME, self.channel_name)
        await self.channel_layer.group_add(self.username, self.channel_name)
        await self._send_user_list()

    async def _handle_message(self, text_data):
        if not self.authenticated:
            await self._error("Unauthenticated action")
            return
        if "message" not in text_data:
            await self._error("Missing message info")
            return
        message = text_data["message"]

        if message.startswith("/"):
            # Send private message
            command = message[1:]
            try:
                cmd, target, extra = command.split(" ", 2)
                #await self._send_message(f"{cmd} to {target} with '{extra}'")
                await self._handle_command(cmd, target, extra)
            except Exception as e:
                await self._error("Not enought arguments", disconnect=False)
        else:
            # Send message to room group
            await self._send_message(self.username + ': ' + message + "\n")

    async def _handle_command(self, cmd, target, extras):
        if cmd == 'mp' or cmd == 'msg':
            await self._send_message_to(target, extras)
        elif cmd == 'block' or cmd == 'ignore':
            pass
        else:
            await self._error(f"Unknown command '{cmd}'", disconnect=False)

    async def _send_message(self, message):
        await self.channel_layer.group_send(
            ROOM_NAME, {"type": "chat.message", "message": message}
        )

    async def _send_message_to(self, target, message):
        await self.channel_layer.group_add(target, self.channel_name)
        message = 'Msg from ' + self.username + ': ' + message
        await self.channel_layer.group_send(
            target, {"type": "chat.message", "message": message}
        )
        await self.channel_layer.group_discard(target, self.channel_name)

    async def _error(self, error_message, disconnect=True):
        await self.send(text_data=json.dumps({"message": error_message}))
        print("error, reason:", error_message, file=sys.stderr)
        if disconnect:
            print("disconnecting user", file=sys.stderr)
            await self.close()

    async def chat_message(self, event):
        message = event["message"]

        # Send message to WebSocket
        await self.send(text_data=json.dumps({"message": message}))

    async def _send_user_list(self):
        user_list = [
            {"id": "user1", "username": "Alice"},
            {"id": "user2", "username": "Bob"},
        ]  #TODO change to actual connected user
        await self.send(text_data=json.dumps({
            "type": "user_list",
            "user_list": user_list
        }))
