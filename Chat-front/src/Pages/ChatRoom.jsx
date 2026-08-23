import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import API from "../api/axios";
import SideBar from "../components/SideBar";
import ChatWindow from "../components/ChatWindow";
import ProfilePage from "./ProfilePage";
import "./ChatRoom.css";

const ChatRoom = ({ token, setToken }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [searchResult, setSearchResult] = useState(null);
    const [rightView, setRightView] = useState("chat"); // Default to chat view (no-chat-selected state) on load
    const socketRef = useRef(null);

    // Automatically switch right pane to chat when contact is selected
    useEffect(() => {
        if (selectedUser) {
            setRightView("chat");
        }
    }, [selectedUser]);

    // Fetch user's own profile details on mount
    useEffect(() => {
        const fetchMyProfile = async () => {
            try {
                const res = await API.get("/api/auth/profile/me", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCurrentUser(res.data);
            } catch (err) {
                console.error("Token decoding/profile fetch failed:", err);
                handleLogout();
            }
        };

        if (token) {
            fetchMyProfile();
        }
    }, [token]);

    // Handle Socket Connections and listeners
    useEffect(() => {
        if (!currentUser) return;

        const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000");
        socketRef.current = socket;

        // Register online status
        socket.emit("UserOnline", currentUser.username);

        // Listen for online users update
        socket.on("UsersOnline", (activeUsernames) => {
            setOnlineUsers(activeUsernames);
        });

        // Listen for real-time messages
        socket.on("MessageReceived", (message) => {
            // Trigger contact list reload if the sender is new to our conversation sidebar list
            setUsers((prev) => {
                if (!prev.some(u => u.username === message.sender)) {
                    fetchContacts();
                }
                return prev;
            });

            if (selectedUser && 
                ((message.sender === selectedUser.username && message.receiver === currentUser.username) || 
                 (message.sender === currentUser.username && message.receiver === selectedUser.username))) {
                setMessages((prev) => [...prev, message]);
            }
        });

        // Listen for message echoes (echoes sent from this user to other devices/sessions)
        socket.on("recieveMessage", (message) => {
            // Trigger contact list reload if the receiver is new to our active list
            setUsers((prev) => {
                if (!prev.some(u => u.username === message.receiver)) {
                    fetchContacts();
                }
                return prev;
            });

            if (selectedUser && message.receiver === selectedUser.username) {
                setMessages((prev) => [...prev, message]);
            }
        });

        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, [currentUser, selectedUser]);

    // Fetch active conversation partners
    const fetchContacts = async () => {
        try {
            const res = await API.get("/api/auth/users", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(res.data);
        } catch (err) {
            console.error("Error fetching users:", err);
        }
    };

    // Load active contacts on profile load
    useEffect(() => {
        if (currentUser) {
            fetchContacts();
        }
    }, [currentUser, token]);

    // Fetch conversation thread when active partner changes
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const res = await API.get(`/api/messages/${selectedUser.username}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessages(res.data);
            } catch (err) {
                console.error("Error fetching messages:", err);
            }
        };

        if (selectedUser) {
            fetchMessages();
        } else {
            setMessages([]);
        }
    }, [selectedUser, token]);

    const handleLogout = () => {
        localStorage.removeItem("chat-token");
        setToken("");
    };

    const handleSendMessage = async (text) => {
        if (!selectedUser || !text.trim()) return;

        try {
            const res = await API.post("/api/messages", 
                { text, receiver: selectedUser.username },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Add the user to our active contacts immediately if they aren't already there
            setUsers((prev) => {
                if (!prev.some(u => u.username === selectedUser.username)) {
                    return [...prev, selectedUser];
                }
                return prev;
            });

            if (socketRef.current) {
                socketRef.current.emit("SendMessage", res.data);
            }
        } catch (err) {
            console.error("Error sending message:", err);
        }
    };

    // Search user details by username
    const handleSearchUser = async (searchUsername) => {
        const res = await API.get(`/api/auth/search/${searchUsername}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setSearchResult(res.data);
    };

    const handleUpdateProfile = async ({ name, profilePic }) => {
        const res = await API.put("/api/auth/profile", 
            { name, profilePic },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        setCurrentUser(res.data.user);
    };

    const isRightPaneActive = selectedUser !== null || rightView === "profile";

    return (
        <div className={`chatroom-container ${isRightPaneActive ? 'mobile-right-active' : 'mobile-left-active'}`}>
            <SideBar 
                currentUser={currentUser}
                users={users}
                onlineUsers={onlineUsers}
                selectedUser={selectedUser}
                setSelectedUser={setSelectedUser}
                onLogout={handleLogout}
                onSearchUser={handleSearchUser}
                searchResult={searchResult}
                setSearchResult={setSearchResult}
                onShowProfile={() => {
                    setSelectedUser(null);
                    setRightView("profile");
                }}
            />
            {rightView === "profile" ? (
                <ProfilePage 
                    currentUser={currentUser}
                    onUpdateProfile={handleUpdateProfile}
                    onBack={() => setRightView("chat")}
                />
            ) : (
                <ChatWindow 
                    selectedUser={selectedUser}
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    token={token}
                    setSelectedUser={setSelectedUser}
                />
            )}
        </div>
    );
};

export default ChatRoom;
