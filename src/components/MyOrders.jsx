import { useState, useEffect } from 'react';
import '../styles/user/myorders.css';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, active, delivered

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/order/user/orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        const data = await res.json();
        
        setOrders(data);
      }
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusMap = {
      PLACED: '#fbbf24',
      PICKED_UP: '#3b82f6',
      OUT_FOR_DELIVERY: '#8b5cf6',
      DELIVERED: '#10b981',
    };
    return statusMap[status] || '#6b7280';
  };

  const getStatusText = (status) => {
    return status.replace(/_/g, ' ');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return order.status !== 'DELIVERED';
    if (activeTab === 'delivered') return order.status === 'DELIVERED';
    return true;
  });

  if (loading) {
    return (
      <div className="orders-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="orders-page">
        <div className="empty-orders">
          <div className="empty-icon">📦</div>
          <h2>No Orders Yet</h2>
          <p>Looks like you haven't placed any orders yet.</p>
          <a href="/homepage" className="shop-now-btn">
            Start Shopping
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-header">
        <h1>My Orders</h1>
        <p className="orders-subtitle">Track and manage your orders</p>
      </div>

      {/* Filter Tabs */}
      <div className="order-tabs">
        <button
          className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Orders ({orders.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          Active ({orders.filter((o) => o.status !== 'DELIVERED').length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'delivered' ? 'active' : ''}`}
          onClick={() => setActiveTab('delivered')}
        >
          Delivered ({orders.filter((o) => o.status === 'DELIVERED').length})
        </button>
      </div>

      {/* Orders List */}
      <div className="orders-container">
        {filteredOrders.length === 0 ? (
          <div className="no-orders-found">
            <p>No orders found in this category</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-card-header">
                <div className="order-id-section">
                  <span className="order-label">Order ID:</span>
                  <span className="order-id">#{order.id}</span>
                </div>
                <div
                  className="order-status-badge"
                  style={{ background: getStatusColor(order.status) }}
                >
                  {getStatusText(order.status)}
                </div>
              </div>

              <div className="order-card-body">
                <div className="order-info-grid">
                  <div className="info-item">
                    <span className="info-label">📅 Ordered On:</span>
                    <span className="info-value">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">💰 Total Amount:</span>
                    <span className="info-value amount">
                      ${order.totalAmount}
                    </span>
                  </div>

                  {order.deliveryPartnerId && (
                    <div className="info-item">
                      <span className="info-label">🚚 Delivery Partner:</span>
                      <span className="info-value">
                        Partner #{order.deliveryPartnerId}
                      </span>
                    </div>
                  )}

                  {order.status === 'DELIVERED' && order.updatedAt && (
                    <div className="info-item">
                      <span className="info-label">✅ Delivered On:</span>
                      <span className="info-value">
                        {formatDate(order.updatedAt)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Order Progress Tracker */}
                {order.status !== 'DELIVERED' && (
                  <div className="order-progress">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width:
                            order.status === 'PLACED'
                              ? '25%'
                              : order.status === 'PICKED_UP'
                              ? '50%'
                              : order.status === 'OUT_FOR_DELIVERY'
                              ? '75%'
                              : '100%',
                        }}
                      ></div>
                    </div>
                    <div className="progress-steps">
                      <div
                        className={`step ${
                          order.status === 'PLACED' ||
                          order.status === 'PICKED_UP' ||
                          order.status === 'OUT_FOR_DELIVERY'
                            ? 'completed'
                            : ''
                        }`}
                      >
                        <div className="step-icon">📦</div>
                        <span>Placed</span>
                      </div>
                      <div
                        className={`step ${
                          order.status === 'PICKED_UP' ||
                          order.status === 'OUT_FOR_DELIVERY'
                            ? 'completed'
                            : ''
                        }`}
                      >
                        <div className="step-icon">🏪</div>
                        <span>Picked Up</span>
                      </div>
                      <div
                        className={`step ${
                          order.status === 'OUT_FOR_DELIVERY' ? 'completed' : ''
                        }`}
                      >
                        <div className="step-icon">🚚</div>
                        <span>Out for Delivery</span>
                      </div>
                      <div className="step">
                        <div className="step-icon">✅</div>
                        <span>Delivered</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyOrders;