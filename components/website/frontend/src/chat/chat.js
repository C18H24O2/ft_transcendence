import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import "./Chat.css";

const socket = io("http://localhost:5000");

function Chat() {
  const [username, setUsername] = useState("");
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (username) {
      // Register the username with the server
      socket.emit("register", username);

      // Mock: Fetch friend list from the backend
      const mockFriendList = {
        user1: ["user2", "user3"],
        user2: ["user1"],
        user3: ["user1"],
      };
      setFriends(mockFriendList[username] || []);
    }

    // Listen for private messages from the server
    socket.on("private message", ({ sender, message }) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender, text: message, private: true },
      ]);
    });

    // Listen for errors
    socket.on("error", (errorMessage) => {
      alert(errorMessage);
    });

    return () => {
      socket.off("private message");
      socket.off("error");
    };
  }, [username]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && selectedFriend) {
      socket.emit("private message", {
        sender: username,
        recipient: selectedFriend,
        message,
      });
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "You", text: message, private: true },
      ]);
      setMessage("");
    }
  };

  return (
    <div>
      <h2>Friends-Only Chat</h2>

      {/* Username Setup */}
      <input
        type="text"
        placeholder="Enter your username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      {/* Friend Selection */}
      <select
        value={selectedFriend}
        onChange={(e) => setSelectedFriend(e.target.value)}
      >
        <option value="">Select a friend</option>
        {friends.map((friend) => (
          <option key={friend} value={friend}>
            {friend}
          </option>
        ))}
      </select>

      {/* Chat Box */}
      <div className="chat-box">
        {messages.map((msg, index) => (
          <div key={index} className={msg.private ? "private-message" : ""}>
            {msg.private
              ? `(Private) ${msg.sender}: ${msg.text}`
              : `${msg.sender}: ${msg.text}`}
          </div>
        ))}
      </div>

      {/* Message Input */}
      <form onSubmit={sendMessage}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message here"
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default Chat;
