# chat/consumers.py
import sys
import json
import uuid

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from service_runtime.remote_service import remote_service

AuthService = remote_service("auth-service")

blocked_users = {}
ROOM_NAME = "chat_transcendence-internal00000000000000000000"
connected = {}
connected_user = [
    {"id": ROOM_NAME, "username": "General"},
]


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.authenticated = False
        await self.accept()

###         disconnection protocol          ###
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
            connected_user.remove({"id": self.channel_name, "username": self.username})
            del blocked_users[self.username]

        try:
            # Leave room group
            await self.channel_layer.group_discard(ROOM_NAME, self.channel_name)
        except Exception as e:
            print("what?", e)

###         received message          ###
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        if "type" not in text_data_json:
            await self._error("Invalid JSON message, missing 'type' datafield")
            return

        await self._send_user_list()
        message_type = text_data_json["type"]
        if message_type == "chat.message" or message_type == "chat.invite":
            await self._handle_message(text_data_json)
        elif message_type == "chat.authenticate":
            await self._authenticate(text_data_json)
        else:
            await self._error(f"Invalid message type '{message_type}'")

###         authentification protocol          ###
    async def _authenticate(self, data):
        if self.authenticated:
            await self._error("Already authenticated, what?")
            return
        if "token" not in data:
            await self._error("No token provided")
            return

        token = data["token"]
        if not AuthService.is_valid_token(token=token):
            await self._error("Invalid token provided")
            return

        try:
            user = AuthService.get_user(token=data['token'])
            self.username = user["username"]
            self.authenticated = True
        except Exception as e:
            print("Got an error while doing user lookup:", e, file=sys.stderr)
            await self._error("Internal server error")
            return

        global connected
        global connected_user

        n = 0
        if self.username in connected:
            n = connected[self.username]
        connected[self.username] = n + 1
        connected_user.append({"id": self.channel_name, "username": self.username})
        blocked_users[self.username] = []

        # print("auth user :D", data, file=sys.stderr)
        # Join room group
        await self.channel_layer.group_add(ROOM_NAME, self.channel_name)
        await self._send_user_list()

###         handling message and command          ###
    async def _handle_message(self, text_data):
        if not self.authenticated:
            await self._error("Unauthenticated action")
            return
        if "message" not in text_data:
            await self._error("Missing message info")
            return
        message = text_data["message"]
        if len(message) > 400:
            message = message[:400] + "... (cut by server)"

        if message.startswith("/"):
            # Command message
            command = message[1:]
            parts = command.split(" ", 2)
            cmd = parts[0]
            target = parts[1] if len(parts) > 1 else ""
            extra = parts[2] if len(parts) > 2 else ""
            await self._handle_command(cmd, target, extra)
        else:
            # Send message to room group
            await self._send_message(self.username + ': ' + message)

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
            help_message = "/mp <username> <msg>\n" \
            "- Send a private message to another connected user.\n" \
            "/(un)block <username>\n" \
            "- Block or unblock a user to no see theyr message.\n" \
            "/invite <username>\n" \
            "- Invite specified user to a pong game."
            await self.send(text_data=json.dumps({"message": help_message}))
        else:
            await self._error(f"Unknown command '{cmd}'", disconnect=False)

    async def _send_message(self, message):
        await self.channel_layer.group_send(
            ROOM_NAME, {"type": "chat.message", "message": message}
        )

    async def _send_message_to(self, target, message):
        global connected_user
        global blocked_users
        if not any(user["username"] == target for user in connected_user):
            await self.send(text_data=json.dumps({"message": "User don't existe or is not connected"}))
        elif self.username in blocked_users[target]:
            await self.send(text_data=json.dumps({"message": f"You're blocked by '{target}'"}))
        else:
            name = await self.get_id_by_username(target)
            if name == None:
                await self._error("User id not found", disconnect=False)
                return
            channel_layer = get_channel_layer()
            message_from = 'Msg from ' + self.username + ': ' + message
            message_to = 'Msg to ' + target + ': ' + message + '\n'
            await self.send(text_data=json.dumps({"message": message_to}))
            await channel_layer.send(name, {
                "type": "chat.message",
                "message": message_from
            })

    async def _block_user(self, blocked):
        global blocked_users
        global connected_user
        if not any(user["username"] == blocked for user in connected_user):
            await self.send(text_data=json.dumps({"message": "User don't existe or is not connected\n"}))

        if blocked not in blocked_users[self.username]:
            blocked_users[self.username].append(blocked)

    async def _unblock_user(self, blocked):
        global blocked_users
        global connected_user
        if not any(user["username"] == blocked for user in connected_user):
            await self.send(text_data=json.dumps({"message": "User don't existe or is not connected\n"}))

        if blocked in blocked_users[self.username]:
            blocked_users[self.username].remove(blocked)

    async def _invite(self, target):
        global connected_user
        global blocked_users
        if not any(user["username"] == target for user in connected_user):
            await self.send(text_data=json.dumps({"message": "User don't existe or is not connected\n"}))
        elif self.username in blocked_users[target]:
            await self.send(text_data=json.dumps({"message": f"You're blocked by '{target}'\n"}))
        else:
            name = await self.get_id_by_username(target)
            if name == None:
                await self._error("User id not found", disconnect=False)
                return
            channel_layer = get_channel_layer()
            await channel_layer.send(name, {
                "type": "invite",
                "target": name,
                "sender": self.username
            })

###         utility          ###
    async def _error(self, error_message, disconnect=True):
        await self.send(text_data=json.dumps({"message": error_message}))
        print("error, reason:", error_message, file=sys.stderr)
        if disconnect:
            print("disconnecting user", file=sys.stderr)
            await self.close()

    async def _send_user_list(self):
        global connected_user
        channel_layer = get_channel_layer()
        for user in connected_user:
            name = user["id"]
            await channel_layer.send(name, {
                "type": "user_list",
                "user_list": connected_user
            })

    async def get_id_by_username(self, username):
        global connected_user
        for user in connected_user:
            if user["username"] == username:
                return user["id"]
        return None

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
