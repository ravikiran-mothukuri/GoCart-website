import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/delivery/delivery.css';
import { useContext } from "react";
import { AuthContext } from "../pages/AuthContext";
import {useNavigate} from 'react-router-dom';


const DeliveryOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  
  const { deliveryToken } = useContext(AuthContext);

  const navigate= useNavigate();


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
  
  }, [deliveryToken]);

  useEffect(() => {

    if (!currentOrderId || !deliveryToken)
      return;

    

    const es = new EventSource(
      `${import.meta.env.VITE_API_URL}/api/order/${currentOrderId}?token=${deliveryToken}`
    );


    es.addEventListener("order-status", (e) => {
      setOrders(prev =>
        prev.map(o =>
          o.id === currentOrderId ? { ...o, status: e.data } : o
        )
      );

    });   

    return () => es.close();
  }, [currentOrderId,deliveryToken]);

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

  // eslint-disable-next-line no-unused-vars
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
      
      setTimeout(()=>{
        navigate("/delivery/complete")
      },2000);
      
    } catch (err) {
      alert("Failed to mark order as delivered");
      console.error(err);
    }
  };

  const getUiStatus = (status) => {
    if (status === 'PICKED_UP') return 'OUT_FOR_DELIVERY';
    return status;
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
            <span className={`status-badge ${getStatusBadgeClass(getUiStatus(order.status))}`}>
              {order.status.replace(/_/g, ' ')}
            </span>
          </div>
          
          <p><strong>Customer:</strong> {order.customer}</p>
          <p><strong>Address:</strong> {order.address}</p>
          <p><strong>Items:</strong> {order.items}</p>

          {order.status === 'PLACED' && (
            <button
              className="btn"
              onClick={() => handleMarkPicked(order.id)}
              disabled={currentOrderId !== null}
            >
              📦 Mark as Picked
            </button>
          )}

          {order.status === 'PICKED_UP' && (
            <button
              className="btn"
              onClick={() => navigate(`/delivery/tracking/${order.id}`)}
              style={{ background: '#2563eb' }}
            >
              🗺️ View Route
            </button>
          )}

        </div>
      ))}
    </div>
  );
};

export default DeliveryOrders;