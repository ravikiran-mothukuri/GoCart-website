import { useContext ,useState,useEffect} from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../pages/AuthContext";
import "../styles/delivery/deliveryNavbar.css";
import axios from 'axios';

const DeliveryNavbar = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [active, setActive] = useState(false);
  const deliveryToken= localStorage.getItem("deliveryToken");

  useEffect(() => {
  const fetchOnline = async () => {
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/delivery/profile`,
      {
        headers: {
          Authorization: `Bearer ${deliveryToken}`,
        },
      }
    );

    setActive(res.data.partner.online === "ON");
  };

  fetchOnline();
}, []);


  const handleStatus= async()=>{
    try{
      const nextStatus = active ? "OFF" : "ON";

      const res= await axios.put(`${import.meta.env.VITE_API_URL}/api/delivery/online/${nextStatus}`,
        {},
        {
        headers:{
          Authorization: `Bearer ${deliveryToken}`
        },
      } 
      );
      setActive(res.data.online==="ON");
    
      // eslint-disable-next-line no-unused-vars
    }catch (err) {
    alert("Failed to update status");
  }
  }
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

      <button
        className={`active-status ${active ? "on" : "off"}`}
        onClick={handleStatus}
      >
        {active ? "Active" : "OFF"}
      </button>

      <button className="delivery-logout" onClick={handleLogout}>
        Logout
      </button>
    </nav>
  );
};

export default DeliveryNavbar;
