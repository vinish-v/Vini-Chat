import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import User from "./models/User.js";
import Message from "./models/Message.js";
import authRoutes from "./routes/Auth.js";
import messageRoutes from "./routes/messages.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        methods: ["GET", "POST"]
    }
})
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173"
}));
app.use(express.json());
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ message: "Invalid JSON format in request body. Please check for missing brackets or quotes" });
    }
    next();
});

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Connected")
        const PORT = process.env.PORT || 5000;
        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        })
    })
    .catch((err) => {
        console.log(err);
    })
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

//socket io logic 

const userSocketMap={};

io.on("connection",(socket)=>{
    console.log("User connected",socket.id);
    socket.on("UserOnline",(username)=>{
        userSocketMap[username]=socket.id;
        io.emit("UsersOnline",Object.keys(userSocketMap));
    });

    //sending message to particular reciever
    socket.on("SendMessage",(data)=>{
        const receiverSocketId = userSocketMap[data.receiver];
        if(receiverSocketId){
            io.to(receiverSocketId).emit("MessageReceived",data);
        }
        socket.emit("recieveMessage",data);
    });

    // Chat requests socket events
    socket.on("SendRequest", (data) => {
        const receiverSocketId = userSocketMap[data.receiver];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("NewRequest", data);
        }
    });

    socket.on("AcceptRequest", (data) => {
        const receiverSocketId = userSocketMap[data.sender];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("RequestAccepted", data);
        }
    });

    socket.on("disconnect",()=>{
        console.log("User disconnected",socket.id);
        for(const [username,socketid] of Object.entries(userSocketMap)){
            if(socketid === socket.id){
                delete userSocketMap[username];
                break;
            }
        }
        io.emit("UsersOnline",Object.keys(userSocketMap));
    });
});


