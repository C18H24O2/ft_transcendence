import butterup from 'butteruptoasts';

const chat = document.querySelector('#chat-container');
const button_on = document.querySelector('#toggle-chat-btn');
const button_off = document.querySelector('#close-chat-btn');
const invite = document.querySelector('#game-invite-btn');
const profile = document.querySelector('#profile-btn');
const friendList = document.querySelector('#users');
const message = document.querySelector('#message-input');
const message_submit = document.querySelector('#chat-message-submit');

export const chatSocket = new WebSocket(
   'wss://'
   + window.location.host
   + '/ws/v1/chat/'
);

if (button_on){
	button_on.addEventListener('click', () => {
		chat.classList.toggle('hidden');
	})
};

// Close the chat when the close button is clicked
if (button_on){
	button_off.addEventListener('click', () => {
		chat.classList.add('hidden');
	})
};

let selectedUsers = "";

function updateFriendList(userList) {
	if (friendList) {
		friendList.innerHTML = ''; // Clear existing friends

		userList.forEach((user) => {
			const li = document.createElement('li');
			li.classList.add('btn', 'border-1', 'border-solid', 'border-overlay2', 'bg-overlay1/50', 'hover:bg-overlay1/75');
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
		})
	}
}

chatSocket.onopen = function(e) {
	// Start authentication
	// console.log("auth moment");
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
			message: data.sender + " invited you to a pong game",
			customHTML: '<button class="btn" id="join-game-btn" hx-get="/games/pong/" hx-target="#content" hx-swap="innerHTML" hx-push-url="/games/pong/" preload="mouseover" hx-trigger="click once">Join Game</button>',
			location: 'top-left',
			icon: true,
			dismissable: true,
			type: 'info',
		});
	setTimeout(() => {
		htmx.process(document.getElementById("join-game-btn"));
	}, 10);
    }
	// console.log(data);
	if (data["message"] != undefined) {
		addChatMessage(data.message);
	}
};


export function addChatMessage(message) {
	try {
		const log = document.querySelector('#chat-log');
		if (log !== undefined && log !== null) {
			log.value += (message + '\n');
			log.scrollTop = log.scrollHeight;
		}
	} catch (e) {
	}
}

chatSocket.onclose = function(e) {
    console.error('Chat socket closed unexpectedly:', e.code, e.reason);
};

if (message) {
	message.focus();
	message.onkeyup = function(e) {
		if (e.key === 'Enter') {  // enter, return
			document.querySelector('#chat-message-submit').click();
		}
	}
};

if (message_submit) {
	message_submit.onclick = function(e) {
		const messageInputDom = document.querySelector('#message-input');
		if (messageInputDom) {
			const message = messageInputDom.value;
			chatSocket.send(JSON.stringify({
				'type': 'chat.message',
				'message': message
			}));
		messageInputDom.value = '';
		}
	}
};

if (invite) {
	invite.onclick = function(e) {
		message.value = `/invite ${selectedUsers}`;
		message.focus();
	}
};
