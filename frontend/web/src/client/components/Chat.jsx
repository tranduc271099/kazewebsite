import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import '../styles/Chat.css';

const socket = io('http://localhost:5000');

function Chat() {
    const [isOpen, setIsOpen] = useState(false);
    const [room, setRoom] = useState(() => localStorage.getItem('chat_room') || '');
    const [message, setMessage] = useState('');
    const [messageList, setMessageList] = useState(() => {
        const saved = localStorage.getItem('chat_messageList');
        return saved ? JSON.parse(saved) : [];
    });
    const [username, setUsername] = useState(() => localStorage.getItem('chat_username') || '');
    const [isChatting, setIsChatting] = useState(() => localStorage.getItem('chat_isChatting') === 'true');
    const [chatEnded, setChatEnded] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const chatBodyRef = useRef(null);
    const usernameInputRef = useRef(null); // Ref cho input tên người dùng

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    // Bắt đầu cuộc trò chuyện
    const startChat = () => {
        if (username.trim() !== '') {
            const newRoomId = `user_${Date.now()}`;
            setRoom(newRoomId);
            localStorage.setItem('chat_room', newRoomId);
            localStorage.setItem('chat_username', username);
            localStorage.setItem('chat_isChatting', 'true');
            // Gửi cả roomId và username, isAdmin = false
            socket.emit('join_room', { room: newRoomId, username: username, isAdmin: false });
            setIsChatting(true);
            setChatEnded(false);
        } else {
            alert('Vui lòng nhập tên của bạn để bắt đầu.');
        }
    };

    // Kết thúc cuộc trò chuyện từ phía client
    const endChat = () => {
        if (window.confirm('Bạn có chắc muốn kết thúc cuộc trò chuyện này?')) {
            socket.emit('end_chat', {
                roomId: room,
                endedBy: 'client',
                username: username
            });
            // Xóa localStorage khi kết thúc chat
            localStorage.removeItem('chat_room');
            localStorage.removeItem('chat_username');
            localStorage.removeItem('chat_isChatting');
            localStorage.removeItem('chat_messageList');
            // Reset ngay lập tức để có thể bắt đầu chat mới
            resetChatState();
        }
    };

    // Hàm reset trạng thái chat về ban đầu
    const resetChatState = () => {
        setIsResetting(true);
        // Hiển thị thông báo reset trong 1.5 giây
        setTimeout(() => {
            setIsChatting(false);
            setChatEnded(false);
            setMessageList([]);
            setMessage('');
            setRoom('');
            setUsername('');
            setIsResetting(false);
            // Focus vào input tên sau khi reset
            setTimeout(() => {
                if (usernameInputRef.current) {
                    usernameInputRef.current.focus();
                }
            }, 100);
        }, 1500);
    };
    const sendMessage = async () => {
        if (message.trim() !== "") {
            const messageData = {
                room: room,
                author: username,
                message: message,
                time: new Date(Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            await socket.emit('send_message', messageData);
            setMessage('');
        }
    };

    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
        // Lưu messageList vào localStorage mỗi khi thay đổi
        localStorage.setItem('chat_messageList', JSON.stringify(messageList));
    }, [messageList]);

    useEffect(() => {
        const handleReceiveMessage = (data) => {
            setMessageList((list) => {
                const newList = [...list, data];
                localStorage.setItem('chat_messageList', JSON.stringify(newList));
                return newList;
            });
        };

        const handleChatEnded = (data) => {
            if (typeof data === 'string') {
                alert(data);
            } else {
                const endedBy = data.endedBy === 'admin' ? 'admin' : 'bạn';
                alert(`Cuộc trò chuyện đã được ${endedBy} kết thúc.\nThời gian: ${new Date(data.timestamp).toLocaleString('vi-VN')}`);
            }
            // Xóa localStorage khi chat kết thúc
            localStorage.removeItem('chat_room');
            localStorage.removeItem('chat_username');
            localStorage.removeItem('chat_isChatting');
            localStorage.removeItem('chat_messageList');
            setTimeout(() => {
                resetChatState();
            }, 1000);
        };

        const handleAdminJoined = (data) => {
            setMessageList((list) => {
                const newList = [...list, {
                    author: 'System',
                    message: data.message,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isSystemMessage: true
                }];
                localStorage.setItem('chat_messageList', JSON.stringify(newList));
                return newList;
            });
        };

        const handleChatHistory = (history) => {
            setMessageList(history);
            localStorage.setItem('chat_messageList', JSON.stringify(history));
        };

        socket.on('receive_message', handleReceiveMessage);
        socket.on('chat_ended', handleChatEnded);
        socket.on('admin_joined', handleAdminJoined);
        socket.on('chat_history', handleChatHistory);

        return () => {
            socket.off('receive_message', handleReceiveMessage);
            socket.off('chat_ended', handleChatEnded);
            socket.off('admin_joined', handleAdminJoined);
            socket.off('chat_history', handleChatHistory);
        };
    }, []);

    // Nếu cửa sổ chat đang đóng, chỉ hiển thị icon bong bóng chat
    if (!isOpen) {
        return (
            <button onClick={toggleChat} className="chat-bubble">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M16 8c0 3.866-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.584.296-1.925.864-4.181 1.234-.2.032-.352-.176-.273-.362.354-.836.674-1.95.77-2.966C.744 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7zM5 8a1 1 0 1 0-2 0 1 1 0 0 0 2 0zm4 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0zm3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
                </svg>
            </button>
        );
    }

    return (
        <div className='chat-window'>
            <div className="chat-header">
                <p>{isChatting ? `Hỗ trợ trực tuyến` : 'Bắt đầu trò chuyện'}</p>
                <div>
                    {isChatting && (
                        <button onClick={endChat} className="end-chat-btn" title="Kết thúc cuộc trò chuyện">
                            ⏹
                        </button>
                    )}
                    <button onClick={toggleChat} className="close-chat-btn">&times;</button>
                </div>
            </div>

            {isChatting ? (
                <>
                    <div className="chat-body" ref={chatBodyRef}>
                        {messageList.map((messageContent, index) => {
                            // Kiểm tra nếu là system message
                            if (messageContent.isSystemMessage || messageContent.author === 'System') {
                                return (
                                    <div key={index} className="system-message">
                                        <p>{messageContent.message}</p>
                                    </div>
                                );
                            }

                            // Tin nhắn thường
                            return (
                                <div
                                    key={index}
                                    className="message"
                                    id={username === messageContent.author ? "you" : "other"}
                                >
                                    <div>
                                        <div className="message-content">
                                            <p>{messageContent.message}</p>
                                        </div>
                                        <div className="message-meta">
                                            <p id="author">{messageContent.author}</p>
                                            <p id="time">{messageContent.time}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="chat-footer">
                        <input
                            type="text"
                            value={message}
                            placeholder="Nhập tin nhắn..."
                            onChange={(event) => setMessage(event.target.value)}
                            onKeyPress={(event) => {
                                event.key === "Enter" && sendMessage();
                            }}
                        />
                        <button onClick={sendMessage}>&#9658;</button>
                    </div>
                </>
            ) : isResetting ? (
                <div className="resetting-container">
                    <div className="loading-spinner"></div>
                    <h4>Đang reset cuộc trò chuyện...</h4>
                    <p style={{ textAlign: 'center', fontSize: '14px', color: '#666' }}>
                        Vui lòng đợi trong giây lát
                    </p>
                </div>
            ) : (
                <div className="joinChatContainer">
                    <h4>Chào mừng bạn!</h4>
                    <p style={{ textAlign: 'center', fontSize: '14px', color: '#666', marginBottom: '20px' }}>Vui lòng nhập tên của bạn để chúng tôi có thể hỗ trợ tốt hơn.</p>
                    <input
                        ref={usernameInputRef}
                        type="text"
                        placeholder="Tên của bạn..."
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        onKeyPress={(event) => {
                            event.key === "Enter" && startChat();
                        }}
                    />
                    <button onClick={startChat}>Bắt đầu trò chuyện</button>
                </div>
            )}
        </div>
    );
}

export default Chat;