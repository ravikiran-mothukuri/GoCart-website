import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from "../pages/AuthContext";
import '../styles/delivery/delivery.css';

const DeliveryCompletedOrders = () => {
  const [completedOrders, setCompletedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { deliveryToken } = useContext(AuthContext);

  useEffect(() => {
    if (!deliveryToken) return;
    fetchCompletedOrders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliveryToken]);

  const fetchCompletedOrders = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/delivery/order/completed`,
        {
          headers: {
            Authorization: `Bearer ${deliveryToken}`,
          },
        }
      );

      if (res.data.success) {
        
        
        const delivered = res.data.orders.filter(
          order => order.status === 'DELIVERED'
        );

        
        setCompletedOrders(delivered);
        
      }
    } catch (err) {
      console.error("Failed to fetch completed orders", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  if (completedOrders.length === 0) {
    return (
      <div className="delivery-page">
        <h2>✅ Completed Orders</h2>
        <div className="empty-state">
          <h3>No Completed Orders Yet</h3>
          <p>Your delivered orders will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="delivery-page">
      <h2>✅ Completed Orders ({completedOrders.length})</h2>

      <div className="completed-orders-grid">
        {completedOrders.map((order,key) => (
          <div key={key} className="completed-order-card">
            <div className="order-header">
              <span className="order-id">Order #{order.orderId}</span>
              <span className="status-badge delivered">
                ✓ DELIVERED
              </span>
            </div>

            <div className="order-details">
              <div className="detail-row">
                <span className="detail-label">Customer Name:</span>
                <span className="detail-value">{order.customerName}</span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Total Amount:</span>
                <span className="detail-value">${order.totalPrice}</span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Delivered On:</span>
                <span className="detail-value">
                  {formatDate(order.updatedAt || order.deliveredAt)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeliveryCompletedOrders;