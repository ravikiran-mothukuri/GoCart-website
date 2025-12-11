import { createContext, useEffect, useMemo, useState } from "react";

// eslint-disable-next-line react-refresh/only-export-components
export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  // ---------------------------------------------------------
  // 🔥 Sync token when login/logout happens (Navbar dispatches authChanged)
  // ---------------------------------------------------------
  useEffect(() => {
    const sync = () => {
      const newToken = localStorage.getItem("token") || "";
      setToken(newToken);
    };

    window.addEventListener("authChanged", sync);
    return () => window.removeEventListener("authChanged", sync);
  }, []);

  // ---------------------------------------------------------
  // 🔥 Fetch Cart Items
  // ---------------------------------------------------------
  const fetchCart = async () => {
    if (!token) {
      setCartItems([]); // clear cart when user logs out
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch cart");

      const data = await res.json();
      setCartItems(data);
    } catch (err) {
      console.error("Cart fetch failed:", err);
      setCartItems([]);
    }
  };

  // ---------------------------------------------------------
  // 🔥 Fetch cart whenever token changes
  // ---------------------------------------------------------
  useEffect(() => {
    fetchCart();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ---------------------------------------------------------
  // 🔥 Add to Cart
  // ---------------------------------------------------------
  const addToCart = async (product) => {
    if (!token) return alert("Please login to add items to cart!");

    await fetch(`${import.meta.env.VITE_API_URL}/api/cart/add/${product.id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    fetchCart();
  };

  // ---------------------------------------------------------
  // 🔥 Remove from Cart
  // ---------------------------------------------------------
  const removeFromCart = async (productId) => {
    await fetch(`${import.meta.env.VITE_API_URL}/api/cart/remove/${productId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    fetchCart();
  };

  // ---------------------------------------------------------
  // 🔥 Update Quantity
  // ---------------------------------------------------------
  const updateQuantity = async (productId, nextQty) => {
    await fetch(
      `${import.meta.env.VITE_API_URL}/api/cart/update/${productId}/${nextQty}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    fetchCart();
  };

  // ---------------------------------------------------------
  // 🔥 Provide values to components
  // ---------------------------------------------------------
  const value = useMemo(
    () => ({
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      fetchCart,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cartItems]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;
