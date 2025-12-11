import { useState } from "react";
import "./partner.css";
import { useNavigate } from "react-router-dom";

export default function PartnerLogin() {
  const navigate= useNavigate();
  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const handleRegister= ()=>{
    navigate("/delivery/register");
  }

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const loginPartner = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/delivery/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      alert("Invalid credentials.");
      return;
    }

    localStorage.setItem("deliveryToken", data.token);
    localStorage.setItem("deliveryUsername", data.username);

    alert("Login success!");

    navigate("/delivery/dashboard")
  };

  return (
    <div className="partner-auth-wrapper">
      <div className="partner-auth-card">
        <h1 className="partner-title">Partner Login</h1>
        <p className="partner-subtitle">Access your delivery dashboard</p>

        <div className="partner-field">
          <label>Username</label>
          <input name="username" value={form.username} onChange={handleChange} />
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

        <button className="partner-btn" onClick={loginPartner}>
          Login
        </button>

        <div className="partner-link" onClick={handleRegister}>
          Create new account
        </div>
      </div>
    </div>
  );
}
