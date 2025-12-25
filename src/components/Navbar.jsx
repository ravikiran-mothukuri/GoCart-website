// Navbar.jsx
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { UserContext } from "./UserContext";

const Navbar = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  // 🔥 React state to trigger re-render when login changes
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const sync = () => {
      setToken(localStorage.getItem("token"));
      setRole(localStorage.getItem("role"));
    };

    sync(); // run once on load

    window.addEventListener("authChanged", sync);
    return () => window.removeEventListener("authChanged", sync);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    setToken(null);
    setRole(null);

    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-[1000] flex flex-wrap items-center justify-between gap-4 bg-gradient-to-br from-white to-green-50 px-4 py-4 shadow-sm md:gap-6 md:px-6 lg:px-8">
      <Link
        to="/homepage"
        className="whitespace-nowrap text-2xl font-bold text-green-600 transition-colors hover:text-green-700 md:text-[28px]"
      >
        GoCart
      </Link>

      {role === "USER" && (
        <Link
          to="/userProfile"
          className="whitespace-nowrap text-[15px] font-bold transition-colors"
        >
          {user ? (
            <>
              <span className="mr-1 text-gray-500">Deliver to:</span>
              <span className="text-gray-900">
                {user.houseNo || user.buildingName
                  ? `${user.houseNo || ""} ${user.buildingName || ""}`.trim()
                  : user.address
                    ? user.address.split(",")[0] // first part of full address
                    : "Set Delivery Address"}
              </span>
            </>
          ) : (
            <span>Set Delivery Address</span>
          )}
        </Link>
      )}

      <div className="order-3 flex w-full min-w-[200px] flex-1 items-center gap-2 md:order-none md:w-auto md:max-w-[600px]">
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search products..."
          className="flex-1 rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-[15px] transition-all focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/10 placeholder:text-gray-400"
        />

        <button
          onClick={() => {
            if (!searchText.trim()) return;
            navigate(`/search?query=${encodeURIComponent(searchText)}`);
          }}
          className="whitespace-nowrap rounded-xl bg-gradient-to-br from-green-500 to-green-600 px-6 py-3 text-[15px] font-semibold text-white shadow-lg shadow-green-500/30 transition-all hover:-translate-y-[1px] hover:from-green-600 hover:to-green-700 hover:shadow-green-500/40"
        >
          Search
        </button>
      </div>

      <nav className="flex w-full flex-wrap items-center justify-center gap-2 md:w-auto md:gap-4">
        {role === "USER" && (
          <Link
            to="/wishlist"
            className="rounded-xl bg-transparent px-3 py-2 text-[13px] font-medium text-gray-700 transition-all hover:bg-green-50 hover:text-green-600 md:px-5 md:py-2.5 md:text-[15px]"
          >
            My Wishlist ❤️
          </Link>
        )}

        {role === "ADMIN" && (
          <Link
            to="/addproduct"
            className="rounded-xl bg-transparent px-3 py-2 text-[13px] font-medium text-gray-700 transition-all hover:bg-green-50 hover:text-green-600 md:px-5 md:py-2.5 md:text-[15px]"
          >
            Add Product
          </Link>
        )}

        {role === "USER" && (
          <Link
            to="/userprofile"
            className="rounded-xl bg-transparent px-3 py-2 text-[13px] font-medium text-gray-700 transition-all hover:bg-green-50 hover:text-green-600 md:px-5 md:py-2.5 md:text-[15px]"
          >
            {user ? <span>{user.firstname}</span> : <span>Profile</span>}
          </Link>
        )}

        {role === "USER" && (
          <Link
            to="/orders"
            className="rounded-xl bg-transparent px-3 py-2 text-[13px] font-medium text-gray-700 transition-all hover:bg-green-50 hover:text-green-600 md:px-5 md:py-2.5 md:text-[15px]"
          >
            📦 My Orders
          </Link>
        )}

        {role === "USER" && (
          <Link
            to="/cart"
            className="rounded-xl bg-transparent px-3 py-2 text-[13px] font-medium text-gray-700 transition-all hover:bg-green-50 hover:text-green-600 md:px-5 md:py-2.5 md:text-[15px]"
          >
            Cart
          </Link>
        )}

        {token ? (
          <button
            onClick={handleSignOut}
            className="rounded-xl bg-red-100 px-3 py-2 text-[13px] font-semibold text-red-600 transition-all hover:bg-red-200 hover:text-red-700 md:px-5 md:py-2.5 md:text-[15px]"
          >
            Sign Out
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/register"
              className="rounded-xl bg-transparent px-3 py-2 text-[13px] font-medium text-gray-700 transition-all hover:bg-green-50 hover:text-green-600 md:px-5 md:py-2.5 md:text-[15px]"
            >
              Register
            </Link>

            <Link
              to="/login"
              className="rounded-xl bg-transparent px-3 py-2 text-[13px] font-medium text-gray-700 transition-all hover:bg-green-50 hover:text-green-600 md:px-5 md:py-2.5 md:text-[15px]"
            >
              Login
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
