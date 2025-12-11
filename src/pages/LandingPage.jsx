import { Link } from "react-router-dom";
import "../styles/landing.css";

export default function LandingPage() {
  return (
    <div className="landing-container">
      <h1>Welcome to GoCart</h1>
      <p>Select how you want to continue:</p>

      <div className="landing-buttons">
        <Link to="/login" className="landing-btn user-btn">
          I am a Customer
        </Link>

        <Link to="/delivery/auth" className="landing-btn delivery-btn">
          I am a Delivery Partner
        </Link>
      </div>
    </div>
  );
}
