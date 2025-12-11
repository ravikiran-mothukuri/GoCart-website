import { createContext, useEffect, useState, useMemo } from "react";

// eslint-disable-next-line react-refresh/only-export-components
export const WishlistContext = createContext();

const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const token = localStorage.getItem("token");

  const API = "http://localhost:8080";

  const fetchWishlist = async () => {
    if (!token) return;
    const res = await fetch(`${API}/api/wishlist`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setWishlist(await res.json());
  };

  useEffect(() => {
    fetchWishlist();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const addToWishlist = async (product) => {
  if (!token) {
    return { status: "no-login" };
  }

  const res = await fetch(`${API}/api/wishlist/add/${product.id}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();

  // update UI
  setWishlist(data.wishlist);

  return { status: data.status };  // ⭐ return only status
};



  const removeFromWishlist = async (productId) => {
    await fetch(`${API}/api/wishlist/remove/${productId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchWishlist();
  };

  const value = useMemo(
    () => ({
      wishlist,
      addToWishlist,
      removeFromWishlist,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [wishlist]
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export default WishlistProvider;
