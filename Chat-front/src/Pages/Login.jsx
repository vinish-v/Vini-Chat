import { useState } from "react";
import API from "../api/axios";
import "./Login.css";
import bgVideo from "../assets/Vini_Chat_messenger_dark_background_202608221515.mp4";

const Login = ({ setToken, onNavigateToRegister }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await API.post(
                "/api/auth/login",
                {
                    username: username.trim(),
                    password: String(password.trim())
                }
            )
            const { token } = res.data;
            setError("");
            setSuccess("Login successful! Entering chatroom...");
            localStorage.setItem('chat-token', token);
            setTimeout(() => {
                setToken(token);
            }, 1200);

        }
        catch (error) {
            const msg = error.response?.data?.message || "Invalid Username or Password";
            setSuccess("");
            setError(msg);
            console.log(error)
        }

    }
    return (
        <>
            <div className="auth-wrappper">
                <video autoPlay loop muted playsInline className="bg-video">
                    <source src={bgVideo} type="video/mp4" />
                </video>
                <div className="auth-card">
                    <img src="/favicon.svg" alt="Vini Chat Logo" className="auth-logo" />
                    <h2 className="authTitle">Vini Chat</h2>
                    <p className="auth-subtitle">Login to start messaging</p>
                    {error && <p className="authError">{error}</p>}
                    {success && <p className="authSuccess">{success}</p>}
                    <div className="form-group">
                        <form onSubmit={handleSubmit}>
                            <input type="text" className="form-input" placeholder="Username"
                                value={username} onChange={(e) => setUsername(e.target.value)} required />
                            <input type="password" className="form-input" placeholder="••••••••"
                                value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </form>
                        <button onClick={handleSubmit} className="Login-btn">Login</button>
                    </div>
                    <div className="auth-footer">
                        New to Vini Chat?{" "}
                        <button className="auth-toggle-btn" onClick={onNavigateToRegister}>
                            Register here
                        </button>
                    </div>
                </div>

            </div >
        </>
    )
}

export default Login;