import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthProvider, AuthContext } from "./pages/AuthContext";

import Navbar from "./components/Navbar";
import DeliveryNavbar from "./delivery/DeliveryNavbar";

import Homepage from "./components/Homepage";
import Login from "./components/Login";
import Register from "./components/Register";

import AddProduct from "./components/AddProduct";
import ProductDetails from "./components/ProductDetails";
import { CartProvider } from "./components/CartContext";
import AddCart from "./components/AddCart";
import WishlistProvider from "./components/WishlistContext";
import WishlistPage from "./components/WishlistPage";
import SearchResults from "./components/SearchResults";
import UserProfile from "./components/UserProfile";
import { UserProvider } from "./components/UserContext";


import LandingPage from "./pages/LandingPage";
import PartnerRegister from "./delivery/PartnerRegister";
import PartnerLogin from "./delivery/PartnerLogin";

import DeliveryEarnings from "./delivery/DeliveryEarnings";
import DeliveryDashboard from "./delivery/DeliveryDashboard";
import DeliveryOrders from "./delivery/DeliveryOrders";
import DeliveryProfile from "./delivery/DeliveryProfile";


function LayoutWrapper() {
  const location = useLocation();
  const { deliveryToken } = useContext(AuthContext);

  const isDeliveryRoute= location.pathname.startsWith("/delivery");
  const isDeliveryAuthPage= location.pathname==="/delivery/login" || location.pathname==="/delivery/register";

  const isLandingPage = location.pathname === "/";


  return (
    <>
      
      {!isDeliveryRoute && !isLandingPage&& <Navbar />}

      
      {isDeliveryRoute && deliveryToken && !isDeliveryAuthPage && <DeliveryNavbar />}

      <Routes>
        
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
        
        
        
        <Route path="/delivery/register" element={<PartnerRegister />} />
        <Route path="/delivery/login" element={<PartnerLogin />} />
        
        <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />
        <Route path="/delivery/orders" element={<DeliveryOrders />} />
        <Route path="/delivery/earnings" element={<DeliveryEarnings />} />
        <Route path="/delivery/profile" element={<DeliveryProfile />} />

      </Routes>
    </>
  );
}


function App() {
  return (
    <UserProvider>
      <CartProvider>
        <WishlistProvider>
          <AuthProvider>
            <BrowserRouter>
              <LayoutWrapper />
            </BrowserRouter>
          </AuthProvider>
        </WishlistProvider>
      </CartProvider>
    </UserProvider>
  );
}

export default App;
