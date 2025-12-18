import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/delivery/delivery.css';
import { useContext } from "react";
import { AuthContext } from "../pages/AuthContext";


const DeliveryOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  // const deliveryToken = localStorage.getItem("deliveryToken");
  const { deliveryToken } = useContext(AuthContext);


  // Fetch orders from backend
  const fetchOrders = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/delivery/orders`,
        {
          headers: {
            Authorization: `Bearer ${deliveryToken}`
          }
        }
      );
      
      if (res.data.success) {
        setOrders(res.data.orders);
        setCurrentOrderId(res.data.currentOrderId);
      }
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    if(!deliveryToken)
      return;
    fetchOrders();

    // Set up polling every 5 seconds for new orders
    const pollInterval = setInterval(() => {
      fetchOrders();
    }, 5000); // Poll every 5 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(pollInterval);
  
  }, [deliveryToken]);

  const handleMarkPicked = async (orderId) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/delivery/order/picked/${orderId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${deliveryToken}`
          }
        }
      );
      alert("Order marked as picked!");
      fetchOrders(); // Refresh orders immediately
    } catch (err) {
      alert("Failed to mark order as picked");
      console.error(err);
    }
  };

  const handleMarkDelivered = async (orderId) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/delivery/order/delivered/${orderId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${deliveryToken}`
          }
        }
      );
      alert("Order marked as delivered!");
      fetchOrders(); // Refresh orders immediately
    } catch (err) {
      alert("Failed to mark order as delivered");
      console.error(err);
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'PLACED': 'placed',
      'PICKED_UP': 'picked',
      'OUT_FOR_DELIVERY': 'out-for-delivery',
      'DELIVERED': 'delivered'
    };
    return statusMap[status] || 'placed';
  };

  if (loading) {
    return (
      <div className="delivery-page">
        <div className="loading">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="delivery-page">
        <h2>📦 Assigned Orders</h2>
        <div className="empty-state">
          <h3>No Orders Yet</h3>
          <p>New orders will appear here when they're assigned to you</p>
        </div>
      </div>
    );
  }

  return (
    <div className="delivery-page">
      <h2>📦 Assigned Orders ({orders.length})</h2>

      {orders.map((order) => (
        <div key={order.id} className="order-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <p style={{ margin: 0 }}><strong>Order ID:</strong> #{order.id}</p>
            <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
              {order.status.replace(/_/g, ' ')}
            </span>
          </div>
          
          <p><strong>Customer:</strong> {order.customer}</p>
          <p><strong>Address:</strong> {order.address}</p>
          <p><strong>Items:</strong> {order.items}</p>

          {currentOrderId === order.id ? (
            <button 
              className="btn" 
              onClick={() => handleMarkDelivered(order.id)}
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}
            >
              ✓ Mark as Delivered
            </button>
          ) : (
            <button 
              className="btn" 
              onClick={() => handleMarkPicked(order.id)}
              disabled={currentOrderId !== null}
              style={{ 
                background: currentOrderId !== null 
                  ? '#d1d5db' 
                  : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                boxShadow: currentOrderId !== null 
                  ? 'none' 
                  : '0 4px 12px rgba(59, 130, 246, 0.3)',
                cursor: currentOrderId !== null ? 'not-allowed' : 'pointer',
                opacity: currentOrderId !== null ? 0.6 : 1
              }}
            >
              📦 Mark as Picked
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default DeliveryOrders;