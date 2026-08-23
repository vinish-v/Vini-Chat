import { useState } from "react";
import API from "../api/axios";
import "./Register.css";
import bgVideo from "../assets/Vini_Chat_messenger_dark_background_202608221515.mp4";

const Register = ({ setToken, onNavigateToLogin }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [name,setName] =useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await API.post(
                "/api/auth/register",
                {
                    username: username.trim(),
                    password: String(password.trim()),
                    name: name.trim()
                }
            );
            setError("");
            setSuccess("Registration successful! Redirecting to login...");
            
            // Redirect to login page after showing the success message
            setTimeout(() => {
                onNavigateToLogin();
            }, 1500);
        } catch (error) {
            const msg = error.response?.data?.message || "Registration failed";
            setSuccess("");
            setError(msg);
            console.log(error);
        }
    };

    return (
        <div className="auth-wrappper">
            <video autoPlay loop muted playsInline className="bg-video">
                <source src={bgVideo} type="video/mp4" />
            </video>
            <div className="auth-card">
                <img src="/favicon.svg" alt="Vini Chat Logo" className="auth-logo" />
                <h2 className="authTitle">Vini Chat</h2>
                <p className="auth-subtitle">Create an account to start messaging</p>
                {error && <p className="authError">{error}</p>}
                {success && <p className="authSuccess">{success}</p>}
                <div className="form-group">
                    <form onSubmit={handleSubmit}>
                        <input 
                            type="text" 
                            className="form-input" 
                            placeholder="Name"
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            required 
                        />  
                        <input 
                            type="text" 
                            className="form-input" 
                            placeholder="Username"
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            required 
                        />
                        <input 
                            type="password" 
                            className="form-input" 
                            placeholder="••••••••"
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />

                        <button type="submit" className="Login-btn">Register</button>
                    </form>
                </div>
                <div className="auth-footer">
                    Already have an account?{" "}
                    <button className="auth-toggle-btn" onClick={onNavigateToLogin}>
                        Login here
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Register;
