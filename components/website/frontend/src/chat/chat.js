const invite = document.querySelector('#game-invite-btn');
const profile = document.querySelector('#profile-btn');
const chatSocket = new WebSocket(
    'ws://'
    + window.location.host
    + '/ws/chat/'
);

document.querySelector('#toggle-chat-btn').addEventListener('click', () => {
    document.querySelector('#chat-container').classList.toggle('hidden');
});

// Close the chat when the close button is clicked
document.querySelector('#close-chat-btn').addEventListener('click', () => {
    document.querySelector('#chat-container').classList.add('hidden');
});

chatSocket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    const log = document.querySelector('#chat-log');
    log.value += (data.message + '\n');
    log.scrollTop = log.scrollHeight;
};

chatSocket.onclose = function(e) {
    console.error('Chat socket closed unexpectedly');
};

document.querySelector('#message-input').focus();
document.querySelector('#message-input').onkeyup = function(e) {
    if (e.key === 'Enter') {  // enter, return
        document.querySelector('#chat-message-submit').click();
    }
};

document.querySelector('#chat-message-submit').onclick = function(e) {
    const messageInputDom = document.querySelector('#message-input');
    const message = messageInputDom.value;
    chatSocket.send(JSON.stringify({
        'message': message
    }));
    messageInputDom.value = '';
};

invite.onclick = function(e) {
    chatSocket.send(JSON.stringify({
        'message': "you've been invited to game"
    }));
    messageInputDom.value = '';
};
profile.onclick = function(e) {
    /*placeholder for redirection to user profile*/
};
