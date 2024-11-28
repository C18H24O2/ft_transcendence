import { io, Manager } from 'socket.io-client';

// const manager = new Manager("wss://localhost:8043/ws/v1/", {
//     reconnectionDelayMax: 10000,
// });
// const socket = manager.socket("/", {
// });
const socket = io();
socket.on("connect_error", (err) => {
  // the reason of the error, for example "xhr poll error"
  console.log("SOCKET CONNET ERROR");
  console.log(err.message);

  // some additional description, for example the status code of the initial HTTP response
  console.log(err.description);

  // some additional context, for example the XMLHttpRequest object
  console.log(err.context);
}); 
const toggleChatBtn = document.getElementById('toggle-chat-btn');
const closeChatBtn = document.getElementById('close-chat-btn');
const chatContainer = document.getElementById('chat-container');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const friendList = document.getElementById('users');
const messagesElement = document.getElementById('messages');

let selectedFriend = null; // Current friend being chatted with
let unreadMessages = {}; // Track unread messages for each friend

// Toggle the chat visibility when the main toggle button is clicked
toggleChatBtn.addEventListener('click', () => {
    chatContainer.classList.toggle('hidden');
});

// Close the chat when the close button is clicked
closeChatBtn.addEventListener('click', () => {
    chatContainer.classList.add('hidden');
});

function registerUser() {
    const username = prompt("Enter your username:");
    if (username && username.trim()) {
        socket.emit('register', username.trim());
    } else {
        alert("Username is required!");
        registerUser();
    }
}

registerUser();

// Update the friend list
socket.on('user list', (userList) => {
    const currentUser = socket.id;
    friendList.innerHTML = ''; // Clear existing friends

    userList.forEach((user) => {
        if (user.id !== currentUser) {
            const li = document.createElement('li');
            li.textContent = user.username;
            li.dataset.userId = user.id;

            // Create unread message dot
            const unreadDot = document.createElement('span');
            unreadDot.classList.add('unread-dot');
            li.appendChild(unreadDot);

            // Highlight the selected friend
            li.addEventListener('click', () => {
                selectedFriend = user.id;

                // Clear unread messages for this friend
                unreadMessages[selectedFriend] = 0;
                updateUnreadDots();

                // Clear the chat and fetch message history
                messagesElement.innerHTML = '';
                socket.emit('get messages', { recipientId: selectedFriend });
            });

            friendList.appendChild(li);
        }
    });

    updateUnreadDots(); // Update dots after list refresh
});

// Handle sending private messages
sendBtn.addEventListener('click', () => {
    const message = messageInput.value.trim();

    if (!selectedFriend) {
        alert("Please select a friend to send a message.");
        return;
    }

    if (message) {
        socket.emit('private message', { recipientId: selectedFriend, message });

        // Display sent message
        const li = document.createElement('li');
        li.textContent = `You to ${document.querySelector(`li[data-user-id="${selectedFriend}"]`).textContent}: ${message}`;
        messagesElement.appendChild(li);

        messageInput.value = ''; // Clear input
    }
});

// Handle receiving private messages
socket.on('private message', (data) => {
    if (data.senderId === selectedFriend || data.recipientId === selectedFriend) {
        // Append message if this chat is active
        const li = document.createElement('li');
        li.textContent = `${data.sender}: ${data.message}`;
        messagesElement.appendChild(li);
    } else {
        // Increment unread messages for the sender
        unreadMessages[data.senderId] = (unreadMessages[data.senderId] || 0) + 1;
        updateUnreadDots();
    }
});

// Populate chat with the selected friend's messages
socket.on('chat history', (history) => {
    history.forEach((message) => {
        const li = document.createElement('li');
        li.textContent = `${message.sender}: ${message.text}`;
        messagesElement.appendChild(li);
    });
});

// Update unread dots
function updateUnreadDots() {
    const friendItems = friendList.querySelectorAll('li');

    friendItems.forEach((item) => {
        const userId = item.dataset.userId;
        const unreadDot = item.querySelector('.unread-dot');

        if (unreadMessages[userId] && unreadMessages[userId] > 0) {
            unreadDot.style.display = 'inline-block';
        } else {
            unreadDot.style.display = 'none';
        }
    });
}

function blockUser(userId) {
    socket.emit("block_user", { userId });
}

function unblockUser(userId) {
    socket.emit("unblock_user", { userId });
}

socket.on("success", (data) => {
    alert(data.message);
});

socket.on("error", (data) => {
    alert(data.message);
});

function renderFriendList() {
    friendList.innerHTML = '';
    friends.forEach((friend) => {
        const li = document.createElement('li');
        li.textContent = friend.username;
        li.dataset.userId = friend.id;

        // Add a block button
        const blockBtn = document.createElement('button');
        blockBtn.textContent = 'Block';
        blockBtn.addEventListener('click', () => blockUser(friend.id));

        li.appendChild(blockBtn);
        friendList.appendChild(li);
    });
}
