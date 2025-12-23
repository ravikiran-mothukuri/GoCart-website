import { createContext, useState, useEffect } from "react";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [deliveryToken, setDeliveryToken] = useState(
    localStorage.getItem("deliveryToken")
  );

  // keep state in sync on refresh
  useEffect(() => {
    const token = localStorage.getItem("deliveryToken");
    if (token) {
      setDeliveryToken(token);
    }
  }, []);

  const login = (token) => {
    localStorage.setItem("deliveryToken", token);
    setDeliveryToken(token); // 🔥 triggers re-render
  };

  useEffect(() => {
    if (!deliveryToken) 
      return;

    const es = new EventSource(
      `${import.meta.env.VITE_API_URL}/api/order/notifications?token=${deliveryToken}`
    );

    es.addEventListener("new-order", (e) => {
      const order = JSON.parse(e.data);

      alert(`📦 New Order Assigned! Order #${order.id}`);

      
      // navigate("/delivery/orders");
    });

    return () => es.close();
  }, [deliveryToken]);



  const logout = () => {
    localStorage.removeItem("deliveryToken");
    setDeliveryToken(null); // 🔥 triggers re-render
  };

  return (
    <AuthContext.Provider value={{ deliveryToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
