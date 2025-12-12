import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Homepage from "./components/Homepage";
import AddProduct from "./components/AddProduct";
import ProductDetails from "./components/ProductDetails";
import { CartProvider } from "./components/CartContext";
import AddCart from "./components/AddCart";
import WishlistProvider from "./components/WishlistContext";
import WishlistPage from "./components/WishlistPage";
import Register from "./components/Register";
import Login from "./components/Login";
import SearchResults from "./components/SearchResults";
import UserProfile from "./components/UserProfile";
import { UserProvider } from "./components/UserContext";

import LandingPage from "./pages/LandingPage";
import DeliveryAuth from "./delivery/PartnerLogin";
import PartnerRegister from "./delivery/PartnerRegister";
import DeliveryNavbar from "./delivery/DeliveryNavbar";
// import DeliveryDashboard from "./delivery/DeliveryDashboard";

function LayoutWrapper() {
  const location = useLocation();
  const deliveryToken = localStorage.getItem("deliveryToken");

  // Pages where NO USER navbar should show
  const noUserNavbarPages = [
    "/delivery/auth",
    "/delivery/register",
    "/delivery/dashboard",
    "/"
  ];

  const hideUserNavbar = noUserNavbarPages.includes(location.pathname);

  // Pages where delivery navbar should show (ONLY if logged in)
  const showDeliveryNavbar =
    deliveryToken && location.pathname.startsWith("/delivery") &&
    !["/delivery/auth", "/delivery/register"].includes(location.pathname);

  return (
    <>
      {/* Show USER navbar only when needed */}
      {!hideUserNavbar && <Navbar />}

      {/* Delivery Navbar ONLY after login */}
      {showDeliveryNavbar && <DeliveryNavbar />}

      <Routes>
        {/* Landing */}
        <Route path="/" element={<LandingPage />} />
        
        {/* USER ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/homepage" element={<Homepage />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<AddCart />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/userprofile" element={<UserProfile />} />
        <Route path="/addproduct" element={<AddProduct />} />
        {/* DELIVERY ROUTES */}
        <Route path="/delivery/auth" element={<DeliveryAuth />} />
        <Route path="/delivery/register" element={<PartnerRegister />} />
        {/* <Route path="/delivery/dashboard" element={<DeliveryDashboard />} /> */}
      </Routes>
    </>
  );
}


function App() {
  return (
    <UserProvider>
      <CartProvider>
        <WishlistProvider>
          <BrowserRouter>
            <LayoutWrapper />
          </BrowserRouter>
        </WishlistProvider>
      </CartProvider>
    </UserProvider>
  );
}

export default App;
