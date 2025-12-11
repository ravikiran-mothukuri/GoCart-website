import { useState } from "react";
import "./partner.css";

import { useNavigate } from "react-router-dom";

export default function PartnerRegister() {
  const navigate= useNavigate();

  const [form, setForm] = useState({
    username: "",
    mobile: "",
    password: "",
  });

  const handleLogin=()=>{
    navigate("/delivery/auth");
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const registerPartner = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/delivery/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      alert("Registration failed!");
      return;
    }

    alert("Registered Successfully! Now login.");
    navigate("/delivery/auth");
  };

  return (
    <div className="partner-auth-wrapper">
      <div className="partner-auth-card">
        <h1 className="partner-title">Delivery Partner Signup</h1>
        <p className="partner-subtitle">Create your delivery partner account</p>

        <div className="partner-field">
          <label>Username</label>
          <input name="username" value={form.username} onChange={handleChange} />
        </div>

        <div className="partner-field">
          <label>Mobile</label>
          <input name="mobile" value={form.mobile} onChange={handleChange} />
        </div>

        <div className="partner-field">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
          />
        </div>

        <button className="partner-btn" onClick={registerPartner}>
          Register
        </button>

        <div className="partner-link" onClick={handleLogin}>
          Already have an account? Login
        </div>
      </div>
    </div>
  );
}
