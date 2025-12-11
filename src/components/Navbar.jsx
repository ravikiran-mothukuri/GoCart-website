// Navbar.jsx
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect,useContext } from "react";
import "../styles/navbar.css";
import { UserContext } from "./UserContext";


const Navbar = () => {
  
  const {user}= useContext(UserContext);
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
    alert("Successfully Logged out.");
  };

  return (
    <header className="navbar-container">
      <Link to="/homepage" className="navbar-logo">
        GoCart
      </Link>

      {role==="USER" && (
        <Link to="/userProfile" className="navbar-logo-1">
          {
            user ?(
              <>
                <span className="addr-title">Deliver to:</span>
                <span className="addr-value">
                  {user.houseNo || user.buildingName
                    ? `${user.houseNo || ""} ${user.buildingName || ""}`.trim()
                    : user.address
                    ? user.address.split(",")[0]   // first part of full address
                    : "Set Delivery Address"}
                </span>
              </>
            ) : (
              <span>Set Delivery Address</span>
            )}
        </Link>
      )

      }


      <div className="search-wrapper">
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search products..."
        />

        <button onClick={() => navigate(`/search?query=${searchText}`)}>
          Search
        </button>
      </div>

      <nav className="navbar-cart">
        {role === "USER" && (
          <Link to="/wishlist" className="navbar-link">
            My Wishlist ❤️
          </Link>
        )}

        {role === "ADMIN" && (
          <Link to="/addproduct" className="navbar-link">
            Add Product
          </Link>
        )}

        {role==="USER" && (
          <Link to='/userprofile' className="navbar-link">
          {user ? (<span>{user.firstname}</span>) 
            :
            (<span>Profile</span>)
          }
          </Link>
        )}

        {role === "USER" && (
          <Link to="/cart" className="navbar-link">
            Cart
          </Link>
        )}

        {token ? (
          <button onClick={handleSignOut} className="navbar-link signout-btn">
            Sign Out
          </button>
        ) : (
          <Link to="/login" className="navbar-link">
            Login
          </Link>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
