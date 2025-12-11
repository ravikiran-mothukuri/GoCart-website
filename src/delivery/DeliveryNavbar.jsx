import { Link, useNavigate } from "react-router-dom";
import "../styles/deliveryNavbar.css";

export default function DeliveryNavbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("deliveryToken");
    navigate("/delivery/auth");
  };

  return (
    <header className="delivery-navbar">
      <div className="delivery-nav-inner">

        <div className="delivery-logo">Swix Partner</div>

        <nav className="delivery-links">
          <Link to="/delivery/dashboard">Orders</Link>
          <Link to="/delivery/earnings">Earnings</Link>
          <Link to="/delivery/profile">Profile</Link>

          <button className="delivery-logout" onClick={handleLogout}>
            Logout
          </button>
        </nav>

      </div>
    </header>
  );
}
