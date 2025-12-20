import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from "../pages/AuthContext";
import "../styles/delivery/delivery.css";

const DeliveryEarnings = () => {
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const { deliveryToken } = useContext(AuthContext);

  const fetchEarnings = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/delivery/earnings`,
        {
          headers: {
            Authorization: `Bearer ${deliveryToken}`
          }
        }
      );
      
      if (res.data.success) {
        setEarnings(res.data.earnings);
      }
    } catch (err) {
      console.error("Failed to fetch earnings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!deliveryToken) return;
    fetchEarnings();

    // Refresh earnings every 30 seconds
    const interval = setInterval(() => {
      fetchEarnings();
    }, 30000);

    return () => clearInterval(interval);
  }, [deliveryToken]);

  if (loading) {
    return (
      <div className="delivery-page">
        <div className="loading">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (!earnings) {
    return (
      <div className="delivery-page">
        <h2>💰 Earnings</h2>
        <p>Unable to load earnings data</p>
      </div>
    );
  }

  return (
    <div className="delivery-page">
      <h2>💰 Earnings Dashboard</h2>

      <div className="earnings-grid">
        <div className="earnings-card today">
          <div className="earnings-icon">📅</div>
          <h3>Today</h3>
          <p className="earnings-amount">₹{earnings.todayEarnings.toFixed(2)}</p>
          <p className="earnings-detail">{earnings.todayDeliveries} deliveries</p>
        </div>

        <div className="earnings-card week">
          <div className="earnings-icon">📊</div>
          <h3>This Week</h3>
          <p className="earnings-amount">₹{earnings.weekEarnings.toFixed(2)}</p>
          <p className="earnings-detail">{earnings.weekDeliveries} deliveries</p>
        </div>

        <div className="earnings-card total">
          <div className="earnings-icon">💎</div>
          <h3>Total Earnings</h3>
          <p className="earnings-amount">₹{earnings.totalEarnings.toFixed(2)}</p>
          <p className="earnings-detail">{earnings.totalDeliveries} deliveries</p>
        </div>

        <div className="earnings-card average">
          <div className="earnings-icon">📈</div>
          <h3>Average Order</h3>
          <p className="earnings-amount">₹{earnings.averageOrderValue.toFixed(2)}</p>
          <p className="earnings-detail">per delivery</p>
        </div>
      </div>

      <div className="earnings-stats">
        <h3>Performance Metrics</h3>
        <div className="stat-row">
          <span>Daily Average:</span>
          <strong>₹{(earnings.totalEarnings / Math.max(1, earnings.totalDeliveries / 7)).toFixed(2)}</strong>
        </div>
        <div className="stat-row">
          <span>Weekly Target Progress:</span>
          <strong>{((earnings.weekEarnings / 5000) * 100).toFixed(1)}%</strong>
        </div>
      </div>
    </div>
  );
};

export default DeliveryEarnings;