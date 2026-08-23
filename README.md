# Vini Chat

Vini Chat is a modern, premium, real-time messaging application featuring a dark glassmorphic design system. The app features real-time messaging, clean initials-based placeholder avatars, custom profile photo uploads, and a WhatsApp-style default welcome view with search functionality.

## Features
- **Real-Time Communication:** Instant messaging powered by WebSockets (`socket.io`).
- **Modern Circular Initials Avatars:** Generates customized initial-based avatars with pleasant gradients when no profile photo is set.
- **Custom Profile Photo Uploads:** Allows users to upload custom profile images (converted to Base64) or remove them instantly.
- **WhatsApp-Style Welcome View:** Centered search dashboard on login that prompts the user to start a conversation.
- **Grouped Layout Headers:** Clean conversational header alignment where names stay next to avatars.
- **Enhanced Security Safeguards:** Protected against NoSQL Injection payloads and Regex Denial of Service (ReDoS) attacks.

---

## Tech Stack
- **Frontend:** React, Vite, Axios, Socket.io-client, Vanilla CSS
- **Backend:** Node.js, Express, MongoDB/Mongoose, Socket.io

---

## Project Structure
```
VINI-CHAT/
├── Backend/          # Node.js + Express WebSocket server
└── Chat-front/       # React + Vite client application
```

---

## Getting Started

### 1. Prerequisites
- Node.js (v16+)
- MongoDB connection URI

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd Backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `Backend` directory and define:
   ```env
   MONGO_URI=your_mongodb_connection_uri
   JWT_TOKEN=your_jwt_signing_secret
   CLIENT_URL=http://localhost:5173
   PORT=5000
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd Chat-front
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `Chat-front` directory (optional for local, defaults to localhost:5000):
   ```env
   VITE_API_URL=http://localhost:5000
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

---

## Deployment Configuration

The application is fully prepared for cloud deployment:
- **Frontend:** Configured for Vercel deployment with dynamic endpoints using `VITE_API_URL`.
- **Backend:** Configured for Render/Railway/Fly.io container hosting using dynamic port bindings (`process.env.PORT`) and CORS origin resolution (`process.env.CLIENT_URL`).
