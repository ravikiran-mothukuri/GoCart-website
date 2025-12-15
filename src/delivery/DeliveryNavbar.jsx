import { useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../pages/AuthContext";
import "../styles/delivery/deliveryNavbar.css";

const DeliveryNavbar = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/delivery/login");
  };

  const isActive = (path) =>
    location.pathname === path ? "delivery-link active" : "delivery-link";

  return (
    <nav className="delivery-navbar">
      <div className="delivery-logo">
        🚚 <span>GoCart Partner</span>
      </div>

      <div className="delivery-links">
        <Link className={isActive("/delivery/dashboard")} to="/delivery/dashboard">
          Dashboard
        </Link>
        <Link className={isActive("/delivery/orders")} to="/delivery/orders">
          Orders
        </Link>
        <Link className={isActive("/delivery/earnings")} to="/delivery/earnings">
          Earnings
        </Link>
        <Link className={isActive("/delivery/profile")} to="/delivery/profile">
          Profile
        </Link>
      </div>

      <button className="delivery-logout" onClick={handleLogout}>
        Logout
      </button>
    </nav>
  );
};

export default DeliveryNavbar;
