import './chat.css';
import butterup from 'butteruptoasts';

const invite = document.querySelector('#game-invite-btn');
const profile = document.querySelector('#profile-btn');
const friendList = document.querySelector('#users');
const message = document.querySelector('#message-input');
const chatSocket = new WebSocket(
   'wss://'
   + window.location.host
   + '/ws/v1/chat/'
);


document.querySelector('#toggle-chat-btn').addEventListener('click', () => {
    document.querySelector('#chat-container').classList.toggle('hidden');
});

// Close the chat when the close button is clicked
document.querySelector('#close-chat-btn').addEventListener('click', () => {
    document.querySelector('#chat-container').classList.add('hidden');
});

let selectedUsers = "";

function updateFriendList(userList) {
    friendList.innerHTML = ''; // Clear existing friends

    userList.forEach((user) => {
		const li = document.createElement('li');
		li.textContent = user.username;
		li.dataset.userId = user.id;

		
		li.addEventListener('dbclick', () => {
			butterup.toast({
				title: 'Profile',
				message: li.textContent,
				location: 'top-left',
				icon: true,
				dismissable: true,
				type: 'info',
        	});
		});
		li.addEventListener('click', () => {
			if (li.dataset.userId != "chat_transcendence-internal00000000000000000000") {
				message.value = `/mp ${user.username} `;
				message.focus();
				selectedUsers = user.username;
			}
			else{
				selectedUsers = "";
			}
		});
		friendList.appendChild(li);
    });
}

chatSocket.onopen = function(e) {
	// Start authentication
	console.log("auth moment");
	chatSocket.send(JSON.stringify({
		"type": "chat.authenticate",
		"token": "le token la ouais" //TODO: get from cookie
	}));
}

chatSocket.onmessage = function(e) {
    const data = JSON.parse(e.data);
	if (data.type === 'user_list') {
        updateFriendList(data.user_list);
    }
	if (data.type === 'invite') {
		butterup.toast({
			title: 'Invite',
			message: "you've benn ivited to a pong game",
			customHTML: '<a href="https://localhost:8043/register/">GAME</a>',
			location: 'top-left',
			icon: true,
			dismissable: true,
			type: 'info',
		});
    }
	// console.log(data);
	if (data["message"] != undefined) {
		const log = document.querySelector('#chat-log');
		log.value += (data.message + '\n');
		log.scrollTop = log.scrollHeight;
	}
};

chatSocket.onclose = function(e) {
    console.error('Chat socket closed unexpectedly');
};

message.focus();
message.onkeyup = function(e) {
    if (e.key === 'Enter') {  // enter, return
        document.querySelector('#chat-message-submit').click();
    }
};

document.querySelector('#chat-message-submit').onclick = function(e) {
    const messageInputDom = document.querySelector('#message-input');
    const message = messageInputDom.value;
    chatSocket.send(JSON.stringify({
		'type': 'chat.message',
        'message': message
    }));
    messageInputDom.value = '';
};

invite.onclick = function(e) {
	message.value = `/invite ${selectedUsers}`;
	message.focus();
};
