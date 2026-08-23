import express from "express";
import Message from "../models/Message.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.get("/:receiver", authMiddleware, async (req, res) => {
    try {
        const receiver = String(req.params.receiver);
        const sender = req.user.username;
        const messages = await Message.find({
            $or: [
                { sender, receiver },
                { sender: receiver, receiver: sender }
            ]
        }).sort({ createdAt: 1 });
        return res.status(200).json(messages)
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal Server Error" })
    }
})


router.post("/", authMiddleware, async(req, res) => {
    try {
        const { text, receiver } = req.body;
        if (typeof text !== "string" || typeof receiver !== "string") {
            return res.status(400).json({ message: "Invalid input types" });
        }
        
        const message = await Message.create({
            sender: req.user.username,
            receiver: receiver.trim(),
            text: text.trim()
        })
        return res.status(201).json(message);
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal Server Error" })
    }
})

router.get("/", authMiddleware, async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [
                { sender: req.user.username },
                { receiver: req.user.username }
            ]
        }).sort({ createdAt: 1 });
        return res.status(200).json(messages)
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal Server Error" })
    }
})

export default router