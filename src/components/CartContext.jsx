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
    if(!token) 
      return alert("Please login to add items to cart!");

    const res= await fetch(`${import.meta.env.VITE_API_URL}/api/cart/add/${product.id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
    const msg = await res.text();

    if (msg.includes("OUT_OF_STOCK")) {
      alert("Product is out of stock!");
    } else if (msg.includes("STOCK_LIMIT_REACHED")) {
      alert("Stock limit reached!");
    } else if (res.status === 401) {
      alert("Please login again");
    } else {
      alert("Failed to add to cart");
    }
    return false;
    }

      fetchCart();
      return true;
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
    const res= await fetch(
      `${import.meta.env.VITE_API_URL}/api/cart/update/${productId}/${nextQty}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      const msg = await res.text();
      if (msg.includes("STOCK_LIMIT_REACHED")) {
        alert("Stock limit reached");
      } else {
        alert("Failed to update quantity");
      }
      return false;
    }

    fetchCart();
    return true;
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
