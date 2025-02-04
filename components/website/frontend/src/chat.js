import butterup from 'butteruptoasts';
import { getCookie } from './lang.js';

const chat = document.querySelector('#chat-container');
const button_on = document.querySelector('#toggle-chat-btn');
const button_off = document.querySelector('#close-chat-btn');
const invite = document.querySelector('#game-invite-btn');
const profile = document.querySelector('#profile-btn');
const friendList = document.querySelector('#users');
const message = document.querySelector('#message-input');
const message_submit = document.querySelector('#chat-message-submit');

let error_messages = {
	"chat_blocked": "{{@ chat.blocked @}}",
	"chat_unknown_user": "{{@ chat.user_unknown @}}",
	"chat_unknown_id": "{{@ chat.unknown_id @}}",
	"chat_unknown_command": "{{@ chat.unknown_command @}}",
	"chat_help": "{{@ chat.help @}}",
	"chat_unauthenticated": "{{@ chat.unauthenticated @}}",
	"chat_missing_info": "{{@ chat.missing_info @}}",
	"chat_invalid_json": "{{@ chat.invalid_json @}}",
	"chat_invalid_type": "{{@ chat.invalid_type @}}",
	"chat_missing_token": "{{@ chat.missing_token @}}",
	"chat_invalid_token": "{{@ chat.invalid_token @}}",
	"chat_authenticated": "{{@ chat.authenticated @}}",
	"chat_server_error": "{{@ chat.server_error @}}"
}

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

button_on?.addEventListener('click', () => {
	chat.classList.toggle('hidden');
});

// Close the chat when the close button is clicked
button_off?.addEventListener('click', () => {
	chat.classList.add('hidden');
});

setTimeout(chatThing, 2000); //tkt

function chatThing()
{
	let token = getCookie("x-ft-tkn");
	if (!(token === null || token === undefined || token === "")) {
		const chatSocket = new WebSocket(
		'wss://'
		+ window.location.host
		+ '/ws/v1/chat/'
		);
		let selectedUsers = "";

		function updateFriendList(userList) {
			if (friendList) {
				friendList.innerHTML = ''; // Clear existing friends

				userList.forEach((user) => {
					const li = document.createElement('li');
					li.classList.add('btn', 'border-1', 'border-solid', 'border-overlay2', 'bg-overlay1/50', 'hover:bg-overlay1/75');
					li.textContent = user.username;

					li.addEventListener('click', () => {
						if (li.dataset.textContent != "chat_transcendence-general00000000000000000000") {
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
				"token": token
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
					message: data.sender + " {@ chat.pong_invite @}",
					customHTML: '<button class="btn" id="join-game-btn">{@ chat.pong_accept @}</button>',
					location: 'top-left',
					icon: true,
					dismissable: true,
					type: 'info',
				});
			}
			if (data['sys'] != undefined)
			{
				addChatMessage(error_messages[data.sys]);
			}
			// console.log(data);
			if (data["message"] != undefined) {
				addChatMessage(data.message);
			}
		}

		chatSocket.onclose = function(e) {
			console.warn('Chat socket closed unexpectedly:', e.code, e.reason);
		}

		if (message) {
			message.focus();
			message.onkeyup = function(e) {
				if (e.key === 'Enter') {  // enter, return
					document.querySelector('#chat-message-submit').click();
				}
			}
		}

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
		}

		if (invite) {
			invite.onclick = function(e) {
				message.value = `/invite ${selectedUsers}`;
				message.focus();
			}
		}
	}
}
