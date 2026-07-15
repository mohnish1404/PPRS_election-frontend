import { useState } from "react";
import "./Login.css";

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Please enter username & password");
      return;
    }

    try {
      const res = await fetch("http://localhost:5103/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data);
        return;
      }

      onLogin(data.user);

    } catch {
      setError("Invalid username & password");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">Admin Login</h2>

        {error && <div className="login-error">{error}</div>}

        <input
          type="text"
          placeholder="Enter Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="login-input"
        />

        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="login-input"
        />

        <button onClick={handleLogin} className="login-btn">
          Login
        </button>

        <div className="login-footer">
          Election Duty Management System
        </div>
      </div>
    </div>
  );
};

export default Login;