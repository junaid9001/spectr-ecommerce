import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./components/navbar";
import "./components/register.css";

export default function Register() {
  const [username, setusername] = useState("");
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [error, seterror] = useState("");

  const navigate = useNavigate();

  async function handleregister(e) {
    e.preventDefault();
    seterror("");

    if (password.length < 4) {
      seterror("[ Error: password must be at least 4 characters ]");
      return;
    }

    try {
      // Check existing email via compatibility query
      const existinguser = await axios.get(
        `http://localhost:4006/users?email=${email.trim()}`
      );
      if (existinguser.data.length > 0) {
        seterror("[ Error: user already exists ]");
        return;
      }

      await axios.post("http://localhost:4006/users", {
        username: username.trim(),
        email: email.trim(),
        password: password,
        cart: [],
        orders: []
      });
      
      navigate("/login");
    } catch (err) {
      seterror("[ Error: registration failed ]");
      console.log(err);
    }
  }

  return (
    <div className="auth-page">
      <Navbar />

      <div className="auth-container">
        <div className="auth-card">
          <h2 className="auth-title">Register</h2>
          <div className="auth-subtitle">
            <span>Create Profile</span>
            <span className="subtitle-dot"></span>
            <span>FW26</span>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleregister} className="auth-form">
            <div className="auth-field-group">
              <label className="auth-label">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setusername(e.target.value)}
                placeholder="Select username"
                className="auth-input"
                required
              />
            </div>

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
                placeholder="At least 4 characters"
                className="auth-input"
                required
              />
            </div>

            <button type="submit" className="auth-btn">
              Create Account
            </button>
          </form>

          <p className="auth-footer">
            Already registered?{" "}
            <Link to="/login" className="auth-link">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
