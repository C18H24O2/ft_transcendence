import socketio
import threading

sio = socketio.Server()

users = {}  # {socket_id: {id, username}}
message_history = {}  # {key: [messages]}

lock = threading.Lock()
def generate_message_key(sender_id, recipient_id):
    return "-".join(sorted([sender_id, recipient_id]))

@sio.event
def register(sid, username):
    with lock:
        users[sid] = {"id": sid, "username": username}
        print(f"{username} registered with ID {sid}")
        broadcast_user_list()

@sio.event
def private_message(sid, data):
    recipient_id = data.get("recipientId")
    message = data.get("message")
    sender = users.get(sid)

    if not sender or not recipient_id or recipient_id not in users:
        sio.emit("error", {"message": "Invalid recipient or sender."}, room=sid)
        return

    with lock:
        # Save message in history
        save_message(sid, recipient_id, sender["username"], message)

        # Send message to the recipient
        sio.emit(
            "private_message",
            {"sender": sender["username"], "message": message},
            room=recipient_id,
        )

@sio.event
def get_messages(sid, data):
    recipient_id = data.get("recipientId")
    sender_id = sid

    if not sender_id or not recipient_id:
        sio.emit("error", {"message": "Invalid message request."}, room=sid)
        return

    with lock:
        # Fetch message history
        key = generate_message_key(sender_id, recipient_id)
        history = message_history.get(key, [])
        sio.emit("chat_history", history, room=sid)


@sio.event
def disconnect(sid):
    with lock:
        user = users.pop(sid, None)
        if user:
            print(f"{user['username']} disconnected.")
            broadcast_user_list()


def save_message(sender_id, recipient_id, sender_name, text):
    key = generate_message_key(sender_id, recipient_id)
    if key not in message_history:
        message_history[key] = []
    message_history[key].append({"sender": sender_name, "text": text})


def broadcast_user_list():
    user_list = [
        {"id": user["id"], "username": user["username"]} for user in users.values()
    ]
    for sid in users:
        sio.emit("user_list", user_list, room=sid)


if __name__ == "__main__":
    import eventlet
    import eventlet.wsgi

    app = eventlet.wsgi.server(eventlet.listen(('0.0.0.0', 8043)), sio)
