import socketio
import threading
import re

sio = socketio.Server()

MESSAGE_HISTORY_LIMIT = 100
users = {}
message_history = {}
blocklists = {}

lock = threading.Lock()
def generate_message_key(sender_id, recipient_id):
    return "-".join(sorted([sender_id, recipient_id]))

def sanitize_message(text):
    return re.sub(r"[^\w\s.,!?'\"]", "", text)

@sio.event
def register(sid, username):
    with lock:
        users[sid] = {"id": sid, "username": username}
        blocklists[sid] = []
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
        if sid in blocklists.get(recipient_id, []):
            print(f"Message blocked: {users[sid]['username']} -> {users[recipient_id]['username']}")
            sio.emit("error", {"message": "Message could not be delivered. The recipient has blocked you."}, room=sid)
            return

    sanitized_message = sanitize_message(message)

    with lock:
        # Save message in history
        save_message(sid, recipient_id, sender["username"], sanitized_message)

        # Send message to the recipient
        sio.emit(
            "private_message",
            {"sender": sender["username"], "message": sanitized_message},
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
def block_user(sid, data):
    user_to_block = data.get("userId")
    with lock:
        if not users.get(user_to_block):
            sio.emit("error", {"message": "Invalid user to block."}, room=sid)
            return
        if user_to_block not in blocklists[sid]:
            blocklists[sid].append(user_to_block)
            print(f"{users[sid]['username']} blocked {users[user_to_block]['username']}.")
            sio.emit("success", {"message": f"You blocked {users[user_to_block]['username']}."}, room=sid)

@sio.event
def unblock_user(sid, data):
    user_to_unblock = data.get("userId")
    with lock:
        if user_to_unblock in blocklists[sid]:
            blocklists[sid].remove(user_to_unblock)
            print(f"{users[sid]['username']} unblocked {users[user_to_unblock]['username']}.")
            sio.emit("success", {"message": f"You unblocked {users[user_to_unblock]['username']}."}, room=sid)

@sio.event
def disconnect(sid):
    with lock:
        user = users.pop(sid, None)
        blocklists.pop(sid, None)
        if user:
            print(f"{user['username']} disconnected.")
            broadcast_user_list()


def save_message(sender_id, recipient_id, sender_name, text):
    key = generate_message_key(sender_id, recipient_id)
    if key not in message_history:
        message_history[key] = []
    message_history[key].append({"sender": sender_name, "text": text})
    if len(message_history[key]) > MESSAGE_HISTORY_LIMIT:
        message_history[key].pop(0)


def broadcast_user_list():
    user_list = [
        {"id": user["id"], "username": user["username"]} for user in users.values()
    ]
    for sid in users:
        sio.emit("user_list", user_list, room=sid)


if __name__ == "__main__":
    import eventlet
    import eventlet.wsgi

    bind = ('0.0.0.0', 6969)

    print(f"Starting chat-service on {bind}")
    app = eventlet.wsgi.server(eventlet.listen(bind), socketio.WSGIApp(sio))
