import React, { useState } from "react";
import { renderAvatar } from "../utils/avatar";

const SideBar = ({ 
    currentUser, 
    users, 
    onlineUsers, 
    selectedUser, 
    setSelectedUser, 
    onLogout,
    onSearchUser,
    searchResult,
    setSearchResult,
    onShowProfile
}) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchError, setSearchError] = useState("");

    const handleSearchSubmit = async (e) => {
        e.preventDefault();
        setSearchError("");
        if (!searchQuery.trim()) {
            setSearchResult(null);
            return;
        }

        try {
            await onSearchUser(searchQuery.trim());
        } catch (err) {
            setSearchResult(null);
            setSearchError(err.response?.data?.message || "User not found");
        }
    };

    const handleClearSearch = () => {
        setSearchQuery("");
        setSearchResult(null);
        setSearchError("");
    };

    const handleSearchAction = () => {
        if (!searchResult) return;
        // Select user to chat instantly
        setSelectedUser(searchResult.user);
        handleClearSearch();
    };

    return (
        <div className="sidebar">
            {/* Header profile */}
            <div className="sidebar-header">
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}>
                    <img src="/favicon.svg" alt="Vini Chat Logo" style={{ width: "30px", height: "30px" }} />
                    <h2 style={{ margin: 0 }}>Vini Chat</h2>
                </div>
                {currentUser && (
                    <div 
                        className="user-profile" 
                        onClick={onShowProfile} 
                        style={{ cursor: "pointer", transition: "opacity 0.2s ease" }}
                        title="View Profile Settings"
                    >
                        {renderAvatar(currentUser, "small")}
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontWeight: 600 }}>{currentUser.name}</span>
                            <span style={{ fontSize: "0.75rem", color: "#888" }}>@{currentUser.username} (You)</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Search container */}
            <div className="search-container">
                <form onSubmit={handleSearchSubmit}>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search username to chat..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            if (!e.target.value.trim()) {
                                setSearchResult(null);
                                setSearchError("");
                            }
                        }}
                    />
                </form>
            </div>

            {/* Search result card */}
            {searchResult && (
                <div className="search-results">
                    <div className="search-result-title">Search Result</div>
                    <div className="search-card">
                        {renderAvatar(searchResult.user)}
                        <div className="search-card-info">
                            <span className="search-card-name">{searchResult.user.name}</span>
                            <span className="search-card-username">@{searchResult.user.username}</span>
                        </div>
                        <button 
                            className="search-action-btn"
                            onClick={handleSearchAction}
                        >
                            Chat
                        </button>
                    </div>
                </div>
            )}

            {searchError && (
                <div className="no-users-found">{searchError}</div>
            )}

            {/* Chats list */}
            {!searchResult && !searchError && (
                <div className="contact-list">
                    {users.length > 0 ? (
                        users.map((user) => {
                            const isOnline = onlineUsers.includes(user.username);
                            const isActive = selectedUser && selectedUser.username === user.username;

                            return (
                                <div
                                    key={user._id}
                                    className={`contact-item ${isActive ? "active" : ""}`}
                                    onClick={() => setSelectedUser(user)}
                                >
                                    <div className="contact-item-main">
                                        {renderAvatar(user)}
                                        <div className="contact-info">
                                            <span className="contact-name">{user.name}</span>
                                            <span className="contact-username">@{user.username}</span>
                                        </div>
                                    </div>
                                    <span className={isOnline ? "online-dot" : "offline-dot"}></span>
                                </div>
                            );
                        })
                    ) : (
                        <div className="no-users-found">No active chats. Search for a username to start messaging!</div>
                    )}
                </div>
            )}

            <div className="sidebar-footer">
                <button className="logout-btn" onClick={onLogout}>
                    Logout
                </button>
            </div>
        </div>
    );
};

export default SideBar;
