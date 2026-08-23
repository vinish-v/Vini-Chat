import { useState } from "react";
import Login from "./Pages/Login"
import Register from "./Pages/Register"
import ChatRoom from "./Pages/ChatRoom"

function App() {
  const [token, setToken] = useState(localStorage.getItem("chat-token") || "");
  const [view, setView] = useState("login");

  if (token) {
    return <ChatRoom token={token} setToken={setToken} />;
  }

  return (
    <div>
      {view === "login" ? (
        <Login setToken={setToken} onNavigateToRegister={() => setView("register")} />
      ) : (
        <Register setToken={setToken} onNavigateToLogin={() => setView("login")} />
      )}
    </div>
  )
}

export default App;