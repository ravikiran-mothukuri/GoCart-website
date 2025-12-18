import { useState, useEffect } from 'react';
import '../styles/delivery/delivery.css';
import { useContext } from "react";
import { AuthContext } from "../pages/AuthContext";

const DeliveryDashboard = () => {
  const [stats, setStats] = useState({
    activeOrders: 0,
    completedToday: 0,
    todayEarnings: 0,
    onlineStatus: 'OFF'
  });
  const [username, setUsername] = useState('Partner');
  const [loading, setLoading] = useState(true);

  // eslint-disable-next-line no-unused-vars
  const { deliveryToken } = useContext(AuthContext);

  useEffect(() => {
    if(!deliveryToken)
      return;
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch current partner data
      const token = localStorage.getItem('deliveryToken');
      if (token) {
        // Extract username from token or fetch from API
        
        setUsername('Delivery Partner');
      }

      // Mock stats - replace with actual API calls
      setStats({
        activeOrders: 2,
        completedToday: 5,
        todayEarnings: 650,
        onlineStatus: 'ON'
      });

      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
      setLoading(false);
    }
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

  return (
    <div className="delivery-page">
      <h2>👋 Welcome, {username}</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Active Orders</h3>
          <p>{stats.activeOrders}</p>
        </div>

        <div className="stat-card">
          <h3>Completed Today</h3>
          <p>{stats.completedToday}</p>
        </div>

        <div className="stat-card">
          <h3>Today's Earnings</h3>
          <p>₹{stats.todayEarnings}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginTop: '40px' }}>
        <h3 style={{ 
          fontSize: '20px', 
          fontWeight: '700', 
          color: '#065f46', 
          marginBottom: '20px' 
        }}>
          📍 Quick Actions
        </h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '16px' 
        }}>
          <button 
            className="btn"
            style={{
              padding: '16px',
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
              transition: 'all 0.3s ease'
            }}
            onClick={() => window.location.href = '/delivery/orders'}
          >
            View Orders
          </button>

          <button 
            className="btn"
            style={{
              padding: '16px',
              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
              transition: 'all 0.3s ease'
            }}
            onClick={() => window.location.href = '/delivery/earnings'}
          >
            View Earnings
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ marginTop: '40px' }}>
        <h3 style={{ 
          fontSize: '20px', 
          fontWeight: '700', 
          color: '#065f46', 
          marginBottom: '20px' 
        }}>
          📊 Recent Activity
        </h3>
        
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)',
          border: '2px solid #d1fae5'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            padding: '12px 0',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <span style={{ color: '#6b7280' }}>Order #101 delivered</span>
            <span style={{ color: '#10b981', fontWeight: '600' }}>+₹130</span>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            padding: '12px 0',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <span style={{ color: '#6b7280' }}>Order #100 delivered</span>
            <span style={{ color: '#10b981', fontWeight: '600' }}>+₹150</span>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            padding: '12px 0'
          }}>
            <span style={{ color: '#6b7280' }}>Order #99 delivered</span>
            <span style={{ color: '#10b981', fontWeight: '600' }}>+₹120</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDashboard;