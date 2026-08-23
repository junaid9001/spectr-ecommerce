import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./components/navbar";
import "./components/login.css";

export default function Login() {
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [error, seterror] = useState("");

  const navigate = useNavigate();

  async function handlelogin(e) {
    e.preventDefault();
    seterror("");
    try {
      const res = await axios.post(
        "http://localhost:4006/users/login",
        {
          email: email.trim(),
          password: password
        }
      );
      localStorage.setItem("user", JSON.stringify(res.data));
      navigate("/");
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        seterror(err.response.data.message);
      } else {
        seterror("[ Error: invalid credentials ]");
      }
      console.log(err);
    }
  }

  return (
    <div className="auth-page">
      <Navbar />

      <div className="auth-container">
        <div className="auth-card">
          <h2 className="auth-title">Sign In</h2>
          <div className="auth-subtitle">
            <span>Portal Access</span>
            <span className="subtitle-dot"></span>
            <span>FW26</span>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handlelogin} className="auth-form">
            <div className="auth-field-group">
              <label className="auth-label">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setemail(e.target.value)}
                placeholder="name@domain.com"
                className="auth-input"
                required
              />
            </div>

            <div className="auth-field-group">
              <label className="auth-label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setpassword(e.target.value)}
                placeholder="••••••••"
                className="auth-input"
                required
              />
            </div>

            <button type="submit" className="auth-btn">
              Authenticate
            </button>
          </form>

          <p className="auth-footer">
            New Client?{" "}
            <Link to="/register" className="auth-link">
              Register Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
