import { useState } from "react";
import "./partner.css";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../pages/AuthContext";

export default function PartnerLogin() {
  const navigate= useNavigate();
  const {login}= useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  

  

  const handleRegister= ()=>{
    navigate("/delivery/register");
  }



  const handleLogin = async (e) => {
    e.preventDefault();

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/delivery/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({username,password}),
    });

    

    if (!res.ok) {
      alert("Invalid credentials.");
      return;
    }

    const data = await res.json();

    login(data.token);

    alert("Login success!");

    navigate("/delivery/dashboard")
  };

  return (
    <form onSubmit={handleLogin}>
      <div className="partner-auth-wrapper">
        <div className="partner-auth-card">
          <h1 className="partner-title">Partner Login</h1>
          <p className="partner-subtitle">Access your delivery dashboard</p>

          <div className="partner-field">
            <label>Username</label>
            <input 
              name="username" 
              value={username} 
              onChange={(e)=> setUsername(e.target.value)} 
            />
          </div>

          <div className="partner-field">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e)=> setPassword(e.target.value)}
            />
          </div>

          <button className="partner-btn" type="submit">
            Login
          </button>

          <div className="partner-link" onClick={handleRegister}>
            Create new account
          </div>
        </div>
      </div>
    </form>
  );
}
