import React, { useState, useEffect, useRef } from "react";
import { renderAvatar } from "../utils/avatar";
import API from "../api/axios";

const ChatWindow = ({ selectedUser, messages, onSendMessage, token, setSelectedUser }) => {
    const [text, setText] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchError, setSearchError] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const messagesEndRef = useRef(null);

    // Auto-scroll to the latest message
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (selectedUser) {
            scrollToBottom();
        }
    }, [messages, selectedUser]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        onSendMessage(text);
        setText("");
    };

    const handleWelcomeSearchSubmit = async (e) => {
        e.preventDefault();
        setSearchError("");
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            const res = await API.get(`/api/auth/search/${searchQuery.trim()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data && res.data.user) {
                setSelectedUser(res.data.user);
                setSearchQuery("");
            }
        } catch (err) {
            setSearchError(err.response?.data?.message || "User not found");
        } finally {
            setIsSearching(false);
        }
    };

    if (!selectedUser) {
        return (
            <div className="no-chat-selected">
                <img src="/favicon.svg" alt="Vini Chat Logo" className="welcome-logo" />
                <h2>Vini Chat</h2>
                <p className="welcome-subtitle">Search username and chat to start messaging.</p>
                
                <form onSubmit={handleWelcomeSearchSubmit} className="welcome-search-form">
                    <div className="welcome-search-input-wrapper">
                        <input
                            type="text"
                            placeholder="Enter username to chat..."
                            className="welcome-search-input"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                if (searchError) setSearchError("");
                            }}
                            disabled={isSearching}
                        />
                        <button type="submit" className="welcome-search-submit-btn" disabled={isSearching}>
                            {isSearching ? "..." : "Chat"}
                        </button>
                    </div>
                </form>
                {searchError && <p className="welcome-search-error">{searchError}</p>}
            </div>
        );
    }

    return (
        <div className="chat-window">
            <div className="chat-header">
                <div className="chat-header-user-info">
                    {renderAvatar(selectedUser)}
                    <div className="chat-header-info">
                        <h3>{selectedUser.name}</h3>
                        <p>@{selectedUser.username}</p>
                    </div>
                </div>
            </div>

            <div className="chat-messages">
                {messages.map((msg, index) => {
                    const isSent = msg.sender !== selectedUser.username;
                    return (
                        <div
                            key={msg._id || index}
                            className={`message-wrapper ${isSent ? "sent" : "received"}`}
                        >
                            <div className="message-bubble">{msg.text}</div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-container">
                <form onSubmit={handleSubmit} className="chat-input-form">
                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                    <button type="submit" className="chat-send-btn">
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatWindow;
