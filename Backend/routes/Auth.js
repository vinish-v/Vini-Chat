import express from "express";
import User from "../models/User.js";
import Message from "../models/Message.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// GET active chat conversations (users with whom the current user has messages)
router.get("/users", authMiddleware, async (req, res) => {
    try {
        const currentUsername = req.user.username;

        // Find all messages involving the current user
        const messages = await Message.find({
            $or: [
                { sender: currentUsername },
                { receiver: currentUsername }
            ]
        });

        // Extract unique usernames of the conversation partners
        const chatPartnerUsernames = [
            ...new Set(
                messages.map(m => m.sender === currentUsername ? m.receiver : m.sender)
            )
        ];

        // Fetch user profiles of these partners
        const users = await User.find({ username: { $in: chatPartnerUsernames } })
            .select("-password");

        return res.status(200).json(users);
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal Server error" });
    }
});

// Search user by exact username
router.get("/search/:searchUsername", authMiddleware, async (req, res) => {
    try {
        const searchUsername = String(req.params.searchUsername);
        const currentUsername = req.user.username;

        if (searchUsername.toLowerCase() === currentUsername.toLowerCase()) {
            return res.status(400).json({ message: "You cannot search for yourself" });
        }

        const escapeRegex = (string) => {
            return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        };
        const escapedUsername = escapeRegex(searchUsername);
        const user = await User.findOne({ username: { $regex: new RegExp(`^${escapedUsername}$`, 'i') } })
            .select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            user: {
                id: user._id,
                username: user.username,
                name: user.name,
                profilePic: user.profilePic
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal Server error" });
    }
});

// GET current logged-in profile details
router.get("/profile/me", authMiddleware, async (req, res) => {
    try {
        const user = await User.findOne({ username: req.user.username }).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });
        return res.status(200).json(user);
    } catch (err) {
        return res.status(500).json({ message: "Internal Server error" });
    }
});

// Edit current profile details
router.put("/profile", authMiddleware, async (req, res) => {
    try {
        const { name, profilePic } = req.body;
        if ((name !== undefined && typeof name !== "string") || (profilePic !== undefined && typeof profilePic !== "string")) {
            return res.status(400).json({ message: "Invalid input types" });
        }

        const currentUsername = req.user.username;

        const user = await User.findOne({ username: currentUsername });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (name) user.name = name.trim().slice(0, 50);
        if (profilePic !== undefined) {
            if (profilePic === "" || profilePic.startsWith("data:image/")) {
                user.profilePic = profilePic;
            } else {
                return res.status(400).json({ message: "Invalid profile picture format" });
            }
        }

        await user.save();

        return res.status(200).json({
            message: "Profile updated successfully",
            user: {
                id: user._id,
                username: user.username,
                name: user.name,
                profilePic: user.profilePic
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal Server error" });
    }
});

// Register user with a default avatar
router.post("/register", async (req, res) => {
    try {
        const { username, password, name } = req.body;
        if (typeof username !== "string" || typeof password !== "string" || typeof name !== "string") {
            return res.status(400).json({ message: "Invalid input types" });
        }
        if (!username || !password || !name) {
            return res.status(400).json({ message: "Please provide all user fields" });
        }
        
        const saltrounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltrounds);
        
        // No default profile photo
        const defaultProfilePic = "";
        
        const user = await User.create({
            username: username.trim(),
            password: hashedPassword,
            name: name.trim(),
            profilePic: defaultProfilePic
        });
        
        return res.status(201).json({ message: "User created successfully" });
    }
    catch (err) {
        console.error("Registration error:", err);
        if (err.code === 11000) {
            return res.status(400).json({ error: "Username is already taken" });
        }
        res.status(400).json({ error: err.message || "An error occurred during registration" });
    }
});

// Login
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        if (typeof username !== "string" || typeof password !== "string") {
            return res.status(400).json({ message: "Invalid input types" });
        }
        if (!username || !password) {
            return res.status(400).json({ message: "Please provide all the required fields" });
        }
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).json({ message: "Invalid password" });
        }
        const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_TOKEN, { expiresIn: "1d" });
        return res.status(200).json({ token });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal Server error" });
    }
});

export default router;