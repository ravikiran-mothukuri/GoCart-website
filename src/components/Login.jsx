import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import img from '../assets/trolley.png';
import "../styles/login.css";
import axios from "axios";

const Login = () => {
  const [user, setUser] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8080/api/login", user);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      // 🔥 Notify Navbar immediately (no reload needed)
      window.dispatchEvent(new Event("authChanged"));

      alert("Login successful!");
      navigate("/homepage");
    } catch (err) {
      alert("Invalid username or password" + err);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <img className="amazon-logo" src={img} alt="Amazon" />

        <h2 className="auth-title">Sign-In</h2>

        <form onSubmit={handleLogin}>
          <label>Username</label>
          <input
            type="text"
            placeholder="Enter username"
            value={user.username}
            onChange={(e) => setUser({ ...user, username: e.target.value })}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter password"
            value={user.password}
            onChange={(e) => setUser({ ...user, password: e.target.value })}
            required
          />

          <button onClick={handleLogin} className="auth-button">
            Sign In
          </button>
        </form>

        <p className="auth-text">
          New to GoCart?{" "}
          <Link to="/register" className="auth-link">
            Create your GoCart account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
