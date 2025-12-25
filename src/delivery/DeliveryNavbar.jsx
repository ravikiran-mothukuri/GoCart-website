// DeliveryNavbar.jsx
import { useContext, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../pages/AuthContext";
import axios from "axios";

const DeliveryNavbar = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [active, setActive] = useState(false);
  const { deliveryToken } = useContext(AuthContext);

  useEffect(() => {
    if (!deliveryToken) return;

    const fetchOnline = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/delivery/profile`,
          {
            headers: {
              Authorization: `Bearer ${deliveryToken}`,
            },
          }
        );
        setActive(res.data.partner.online === "ON");
      } catch (err) {
        console.error("Failed to fetch status", err);
      }
    };

    fetchOnline();
  }, [deliveryToken]);

  const handleStatus = async () => {
    try {
      const nextStatus = active ? "OFF" : "ON";

      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/delivery/online/${nextStatus}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${deliveryToken}`,
          },
        }
      );
      setActive(res.data.online === "ON");
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/delivery/login");
  };

  const isActive = (path) =>
    location.pathname === path
      ? "text-green-400 font-semibold"
      : "text-sm font-medium text-gray-400 transition-all hover:text-white";

  return (
    <nav className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-4 bg-gray-900 px-4 py-4 text-white shadow-xl sm:px-6 lg:px-8">
      <div className="flex items-center gap-2 text-xl font-bold tracking-tight text-white">
        <span className="text-2xl">🚚</span>
        <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
          GoCart Partner
        </span>
      </div>

      <div className="order-3 flex md:order-none w-full md:w-auto flex-wrap items-center justify-center gap-4 overflow-x-auto md:gap-8 pb-2 md:pb-0">
        <Link className={isActive("/delivery/dashboard")} to="/delivery/dashboard">
          Dashboard
        </Link>
        <Link className={isActive("/delivery/orders")} to="/delivery/orders">
          Orders
        </Link>
        <Link className={isActive("/delivery/earnings")} to="/delivery/earnings">
          Earnings
        </Link>
        <Link className={isActive("/delivery/complete")} to="/delivery/complete">
          History
        </Link>
        <Link className={isActive("/delivery/profile")} to="/delivery/profile">
          Profile
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <button
          className={`rounded-full px-6 py-2 text-xs font-bold uppercase tracking-wider transition-all shadow-lg ${active
              ? "bg-green-500 text-white shadow-green-500/40 hover:bg-green-600 hover:shadow-green-500/50"
              : "bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700"
            }`}
          onClick={handleStatus}
        >
          {active ? "Active" : "Offline"}
        </button>

        <button
          className="rounded-xl bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-all hover:bg-red-500/20 hover:text-red-300"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default DeliveryNavbar;
