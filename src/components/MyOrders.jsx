import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();
  const sseRefs = useRef([]);

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (orders.length === 0) return;

    const token = localStorage.getItem("token");
    sseRefs.current = [];

    orders.forEach(order => {
      if (order.status !== 'DELIVERED') {
        const es = new EventSource(
          `${import.meta.env.VITE_API_URL}/api/order/tracking/stream/${order.id}?token=${token}`
        );

        es.addEventListener("order-status", (e) => {
          setOrders(prev =>
            prev.map(o =>
              o.id === order.id ? { ...o, status: e.data } : o
            )
          );
        });

        es.onerror = (err) => {
          console.error(`SSE error for order ${order.id}:`, err);
          es.close();
        };

        sseRefs.current.push(es);
      }
    });

    return () => {
      sseRefs.current.forEach(es => es.close());
      sseRefs.current = [];
    };
  }, [orders]);


  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      // FIXED: Correct endpoint
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
      DELIVERED: '#10b981',
    };
    return statusMap[status] || '#6b7280';
  };

  const getProgressWidth = (status) => {
    switch (status) {
      case 'PLACED':
        return '33%';
      case 'PICKED_UP':
        return '66%';
      case 'DELIVERED':
        return '100%';
      default:
        return '0%';
    }
  };

  const getStatusText = (status) => {
    return status ? status.replace(/_/g, ' ') : '';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const canTrackOrder = (status) => {
    const s = status?.trim().toUpperCase();
    return ['PICKED_UP'].includes(s);
  };

  const handleTrackOrder = (orderId) => {
    navigate(`/track-order/${orderId}`);
  };

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return order.status !== 'DELIVERED';
    if (activeTab === 'delivered') return order.status === 'DELIVERED';
    return true;
  });

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <div className="rounded-2xl bg-white p-12 shadow-xl">
          <div className="mb-6 text-6xl">📦</div>
          <h2 className="mb-4 text-3xl font-extrabold text-gray-900">
            No Orders Yet
          </h2>
          <p className="mb-8 text-gray-500">
            Looks like you haven't placed any orders yet.
          </p>
          <a
            href="/homepage"
            className="inline-block rounded-xl bg-gradient-to-br from-green-500 to-green-600 px-8 py-3 font-bold text-white shadow-lg transition-transform hover:scale-105"
          >
            Start Shopping
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-gray-900">My Orders</h1>
        <p className="text-gray-500">Track and manage your orders</p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-8 flex justify-center gap-4">
        {[
          { id: 'all', label: 'All Orders' },
          { id: 'active', label: 'Active' },
          { id: 'delivered', label: 'Delivered' }
        ].map((tab) => (
          <button
            key={tab.id}
            className={`rounded-full px-6 py-2 text-sm font-semibold transition-all ${activeTab === tab.id
              ? 'bg-green-600 text-white shadow-lg shadow-green-500/30'
              : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label} {tab.id === 'all' ? `(${orders.length})` :
              tab.id === 'active' ? `(${orders.filter(o => o.status !== 'DELIVERED').length})` :
                `(${orders.filter(o => o.status === 'DELIVERED').length})`}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="mx-auto max-w-4xl space-y-6">
        {filteredOrders.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-gray-500">No orders found in this category</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 bg-gray-50/50 p-4">
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-xs font-bold uppercase text-gray-400">
                    Order ID
                  </span>
                  <span className="font-mono text-sm font-medium text-gray-900">
                    #{order.id}
                  </span>
                </div>
                <div
                  className="rounded-full px-3 py-1 text-xs font-bold text-white shadow-sm"
                  style={{ background: getStatusColor(order.status) }}
                >
                  {getStatusText(order.status)}
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <span className="block text-xs font-medium text-gray-500">Ordered On</span>
                    <span className="font-semibold text-gray-900">{formatDate(order.createdAt)}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-gray-500">Total Amount</span>
                    <span className="font-bold text-green-600 outline outline-1 outline-green-200 bg-green-50 px-2 py-0.5 rounded text-sm inline-block mt-1">${order.price}</span>
                  </div>
                  {order.deliveryPartnerId && (
                    <div>
                      <span className="block text-xs font-medium text-gray-500">Delivery Partner</span>
                      <span className="font-semibold text-gray-900">Partner #{order.deliveryPartnerId}</span>
                    </div>
                  )}
                </div>

                {/* Order Items */}
                {/* Use optional chaining and default empty array in case structure differs */}
                {(order.orderItems || []).length > 0 && (
                  <div className="divide-y divide-gray-100 rounded-xl bg-gray-50 p-4 mb-6">
                    {(order.orderItems || []).map((item, index) => (
                      <div key={item.id || index} className="flex gap-4 py-3 first:pt-0 last:pb-0">
                        <div className="h-16 w-16 shrink-0 rounded-lg bg-white p-2 shadow-sm">
                          {item.product?.imageUrl && (
                            <img
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              className="h-full w-full object-contain"
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{item.product?.name || 'Product'}</h4>
                          <div className="mt-1 flex justify-between items-center">
                            <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                            <span className="text-sm font-bold text-gray-900">${item.price}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}


                {/* Progress Bar */}
                {order.status !== 'DELIVERED' && (
                  <div className="mb-6">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full transition-all duration-500 ease-out"
                        style={{
                          width: getProgressWidth(order.status),
                          background: getStatusColor(order.status)
                        }}
                      />
                    </div>
                    <div className="mt-2 flex justify-between text-xs font-medium text-gray-500">
                      <span className={order.status === 'PLACED' || order.status === 'PICKED_UP' || order.status === 'DELIVERED' ? 'text-green-600 font-bold' : ''}>Placed</span>
                      <span className={order.status === 'PICKED_UP' || order.status === 'DELIVERED' ? 'text-blue-600 font-bold' : ''}>Picked Up</span>
                      <span className={order.status === 'DELIVERED' ? 'text-green-600 font-bold' : ''}>Delivered</span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {canTrackOrder(order.status) && (
                  <button
                    onClick={() => handleTrackOrder(order.id)}
                    className="w-full rounded-xl bg-blue-600 px-4 py-3 font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700 hover:shadow-blue-500/30"
                  >
                    🗺️ Track Live Order
                  </button>
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