
import React, { useState, useEffect, useRef } from 'react';

function AdminChatWindow({ roomId, chatData, adminUsername, onClose, socket }) {
    const [message, setMessage] = useState('');
    const chatBodyRef = useRef(null);

    useEffect(() => {
        // Cuộn xuống dưới cùng khi có tin nhắn mới
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [chatData.messages]);

    const sendMessage = async () => {
        if (message.trim() !== "") {
            const messageData = {
                room: roomId,
                author: adminUsername,
                message: message,
                time: new Date(Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            await socket.emit("send_message", messageData);
            // Tin nhắn sẽ được thêm vào state ở component cha (AdminChatManager)
            setMessage("");
        }
    };

    return (
        <div className="admin-chat-window">
            <div className="chat-header">
                <p>Chat với {chatData.username}</p>
                <button onClick={onClose} className="close-chat-btn">&times;</button>
            </div>
            <div className="chat-body" ref={chatBodyRef}>
                {chatData.messages.map((msg, index) => (
                    <div
                        key={index}
                        className="message"
                        id={msg.author === adminUsername ? "you" : "other"}
                    >
                        <div>
                            <div className="message-content"><p>{msg.message}</p></div>
                            <div className="message-meta">
                                <p id="author">{msg.author}</p>
                                <p id="time">{msg.time}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="chat-footer">
                <input
                    type="text"
                    value={message}
                    placeholder="Nhập tin nhắn..."
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                />
                <button onClick={sendMessage}>&#9658;</button>
            </div>
        </div>
    );
}

export default AdminChatWindow;