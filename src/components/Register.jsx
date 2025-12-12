import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/register.css";
import img from '../assets/trolley.png';

const Register = () => {
  const [user, setUser] = useState({ username: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/register`, user);
      alert("Registration successful! Please login.");
      
      navigate("/login");
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert("Error registering user. Try again.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <img
          className="amazon-logo"
          src= {img}
          alt="Amazon"
        />

        <h2 className="auth-title">Create account</h2>

        <form onSubmit={handleRegister}>
          <label>Your name</label>
          <input
            type="text"
            placeholder="Enter username"
            value={user.username}
            onChange={(e) => setUser({ ...user, username: e.target.value })}
            required
          />

          <label>Email</label>
          <input
            type="email"
            placeholder="Enter email"
            value={user.email}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="At least 6 characters"
            value={user.password}
            onChange={(e) => setUser({ ...user, password: e.target.value })}
            required
          />

          <button onClick={handleRegister} className="auth-button">
            Continue
          </button>
        </form>

        <p className="auth-text">
          Already have an account?{" "}
          <Link to="/" className="auth-link">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
