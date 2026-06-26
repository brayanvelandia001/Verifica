import { useState } from "react";
import Login from "./Login";
import Analizar from "./Analizar";

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  if (!token) {
    return <Login setToken={setToken} />;
  }

  return <Analizar token={token} logout={handleLogout} />;
}

export default App;