# chat/consumers.py
import sys
import json
import uuid

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from service_runtime.remote_service import remote_service

AuthService = remote_service("auth-service")

blocked_users = {}
connected_user = {}


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.authenticated = False
        await self.accept()

###         disconnection protocol          ###
    async def disconnect(self, close_code):
        if self.authenticated:
            global connected
            if self.username in connected_user:
                connected_user[self.username].remove(self.channel_name)
                if not connected_user[self.username]:
                    del connected_user[self.username]
                    del blocked_users[self.username]


###         received message          ###
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        if "type" not in text_data_json:
            await self._error("chat_invalid_json")
            return

        await self._send_user_list()
        message_type = text_data_json["type"]
        if message_type == "chat.message" or message_type == "chat.invite":
            await self._handle_message(text_data_json)
        elif message_type == "chat.authenticate":
            await self._authenticate(text_data_json)
        else:
            await self._error("chat_invalid_type")

###         authentification protocol          ###
    async def _authenticate(self, data):
        if self.authenticated:
            await self._error("chat_authenticated")
            return
        if "token" not in data:
            await self._error("chat_missing_token")
            return

        token = data["token"]
        if not AuthService.is_valid_token(token=token):
            await self._error("chat_invalid_token")
            return

        try:
            user = AuthService.get_user(token=data['token'])
            self.username = user["username"]
            self.authenticated = True
        except Exception as e:
            print("Got an error while doing user lookup:", e, file=sys.stderr)
            await self._error("chat_server_error")
            return

        global connected_user

        if self.username not in connected_user:
            connected_user[self.username] = []
            blocked_users[self.username] = []
        connected_user[self.username].append(self.channel_name)
        await self._send_user_list()

###         handling message and command          ###
    async def _handle_message(self, text_data):
        if not self.authenticated:
            await self._error("chat_unauthenticated")
            return
        if "message" not in text_data:
            await self._error("chat_missing_info")
            return
        message = text_data["message"]
        if len(message) > 400:
            message = message[:400] + "... (serverLimit)"

        if message.startswith("/"):
            # Command message
            command = message[1:]
            parts = command.split(" ", 2)
            cmd = parts[0]
            target = parts[1] if len(parts) > 1 else ""
            extra = parts[2] if len(parts) > 2 else ""
            await self._handle_command(cmd, target, extra)
        else:
            await self._error("chat_help", disconnect=False)

    async def _handle_command(self, cmd, target, extras):
        if cmd == 'mp' or cmd == 'msg':
            await self._send_message_to(target, extras)
        elif cmd == 'tournament':
            await self.send(text_data=json.dumps({"message": extras}))
        elif cmd == 'block' or cmd == 'ignore':
            await self._block_user(target)
        elif cmd == 'unblock':
            await self._unblock_user(target)
        elif cmd == 'invite':
            await self._invite(target)
        elif cmd == 'help':
            await self._error("chat_help", disconnect=False)
        else:
            await self._error("chat_unknown_command", disconnect=False)
            await self._error("chat_help", disconnect=False)

    async def _send_message_to(self, target, message):
        global connected_user
        global blocked_users
        if not any(user == target for user in connected_user):
            await self._error("chat_unknown_user", disconnect=False)
        elif self.username in blocked_users[target]:
            await self._error("chat_blocked", disconnect=False)
        else:
            names = await self.get_ids_by_username(target)
            if not names:
                await self._error("chat_unknown_id", disconnect=False)
                return
            channel_layer = get_channel_layer()
            message_from = '✉️ <= ' + self.username + ': ' + message
            message_to = '✉️ => ' + target + ': ' + message + '\n'
            await self.send(text_data=json.dumps({"message": message_to}))
            for name in names:
                await channel_layer.send(name, {
                    "type": "chat.message",
                    "message": message_from
                })

    async def _block_user(self, blocked):
        global blocked_users
        global connected_user
        if blocked not in connected_user:
            await self._error("chat_unknown_user", disconnect=False)
            return
        if blocked not in blocked_users[self.username]:
            blocked_users[self.username].append(blocked)

    async def _unblock_user(self, blocked):
        global blocked_users
        global connected_user
        if blocked not in connected_user:
            await self._error("chat_unknown_user", disconnect=False)
            return
        if blocked in blocked_users[self.username]:
            blocked_users[self.username].remove(blocked)

    async def _invite(self, target):
        global connected_user
        global blocked_users
        if not any(user == target for user in connected_user):
            await self._error("chat_unknown_user", disconnect=False)
        elif self.username in blocked_users[target]:
            await self._error("chat_blocked", disconnect=False)
        else:
            names = await self.get_ids_by_username(target)
            if not names:
                await self._error("chat_unknown_id", disconnect=False)
                return
            channel_layer = get_channel_layer()
            for name in names:
                await channel_layer.send(name, {
                    "type": "invite",
                    "target": name,
                    "sender": self.username
                })

###         utility          ###
    async def _error(self, error_message, disconnect=True):
        await self.send(text_data=json.dumps({"sys": error_message}))
        print("error, reason:", error_message, file=sys.stderr)
        if disconnect:
            print("disconnecting user", file=sys.stderr)
            await self.close()

    async def _send_user_list(self):
        global connected_user
        channel_layer = get_channel_layer()
        user_list = [{"username": username} for username in connected_user.keys()]
        for username, channel_name in connected_user.items():
            for name in channel_name:
                await channel_layer.send(name, {
                    "type": "user_list",
                    "user_list": user_list
                })

    async def get_ids_by_username(self, username):
        global connected_user
        return connected_user.get(username, [])

###         type            ###
    async def chat_message(self, event):
        message = event["message"]

        # Send message to WebSocket
        await self.send(text_data=json.dumps({"message": message + "\n"}))

    async def invite(self, event):
        target = event["target"]
        sender = event["sender"]
        await self.send(text_data=json.dumps({
            "type": "invite",
            "target": target,
            "sender": sender,
        }))

    async def user_list(self, event):
        user_list = event["user_list"]
        # Send the user list to the WebSocket
        await self.send(text_data=json.dumps({
            "type": "user_list",
            "user_list": user_list,
        }))
