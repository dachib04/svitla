import React, { useState } from "react";
import api from "../api/api";
import bgImage from "../assets/bg.jpg";

export default function Login({
  onLogin,
  switchToRegister,
}: {
  onLogin: () => void;
  switchToRegister: () => void;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await api.post("/login", { username, password });
      localStorage.setItem("token", res.data.token);
      onLogin();
    } catch {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="auth-container">
      {/* Left background image */}
      <div className="auth-left" style={{ backgroundImage: `url(${bgImage})` }}>
        <div className="overlay-text">
          <h1>Dataroom</h1>
          <p>Drop your files securely</p>
        </div>
      </div>

      {/* Right login form */}
      <div className="auth-right">
        <div className="auth-box">
          <h2 className="auth-title">Login Here!</h2>

          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="auth-input"
          />
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="auth-input"
          />

          <button onClick={handleLogin} className="auth-btn">
            LOGIN →
          </button>

          <p className="auth-footer">
            Don’t have an account?{" "}
            <span onClick={switchToRegister} className="auth-link">
              Register
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
