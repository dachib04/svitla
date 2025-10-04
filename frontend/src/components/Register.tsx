import React, { useState } from "react";
import api from "../api/api";
import bgImage from "../assets/bg.jpg";

export default function Register({
  switchToLogin,
}: {
  switchToLogin: () => void;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      await api.post("/register", { username, password });
      alert("Registration successful! Please login.");
      switchToLogin();
    } catch (err: any) {
      alert(err.response?.data?.error || "Error registering user");
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

      {/* Right register form */}
      <div className="auth-right">
        <div className="auth-box">
          <h2 className="auth-title">Sign Up</h2>

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

          <button onClick={handleRegister} className="auth-btn">
            REGISTER →
          </button>

          <p className="auth-footer">
            Already have an account?{" "}
            <span onClick={switchToLogin} className="auth-link">
              Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
