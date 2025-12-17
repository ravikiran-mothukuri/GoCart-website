import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/delivery/delivery.css';

const DeliveryOrders = () => {
  // eslint-disable-next-line no-unused-vars
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const deliveryToken = localStorage.getItem("deliveryToken");

  useEffect(() => {
    fetchCurrentOrder();
    // Fetch orders from API if available
    // For now using mock data
    setTimeout(() => {
      setLoading(false);
    }, 500);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCurrentOrder = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/delivery/current-order`,
        {
          headers: {
            Authorization: `Bearer ${deliveryToken}`
          }
        }
      );
      setCurrentOrderId(res.data.currentOrderId);
    } catch (err) {
      console.error("Failed to fetch current order", err);
    }
  };

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
      setCurrentOrderId(orderId);
      // Refresh orders list
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
      setCurrentOrderId(null);
      // Refresh orders list
    } catch (err) {
      alert("Failed to mark order as delivered");
      console.error(err);
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'PICKED_UP': 'picked',
      'OUT_FOR_DELIVERY': 'out-for-delivery',
      'DELIVERED': 'delivered'
    };
    return statusMap[status] || 'picked';
  };

  // Mock data - replace with actual API call
  const mockOrders = [
    {
      id: 101,
      customer: "Ravi Kumar",
      address: "Madhapur, Hyderabad - 500081",
      status: "OUT_FOR_DELIVERY",
      items: 3,
      amount: "₹1,250",
      distance: "2.5 km"
    },
    {
      id: 102,
      customer: "Anil Sharma",
      address: "Gachibowli, Hyderabad - 500032",
      status: "PICKED_UP",
      items: 5,
      amount: "₹2,100",
      distance: "4.2 km"
    },
  ];

  if (loading) {
    return (
      <div className="delivery-page">
        <div className="loading">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (mockOrders.length === 0) {
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
      <h2>📦 Assigned Orders</h2>

      {mockOrders.map((order) => (
        <div key={order.id} className="order-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <p style={{ margin: 0 }}><strong>Order ID:</strong> #{order.id}</p>
            <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
              {order.status.replace(/_/g, ' ')}
            </span>
          </div>
          
          <p><strong>Customer:</strong> {order.customer}</p>
          <p><strong>Address:</strong> {order.address}</p>
          <p><strong>Items:</strong> {order.items} | <strong>Amount:</strong> {order.amount}</p>
          <p><strong>Distance:</strong> {order.distance}</p>

          {currentOrderId === order.id ? (
            <button 
              className="btn" 
              onClick={() => handleMarkDelivered(order.id)}
            >
              ✓ Mark as Delivered
            </button>
          ) : (
            <button 
              className="btn" 
              onClick={() => handleMarkPicked(order.id)}
              style={{ 
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
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