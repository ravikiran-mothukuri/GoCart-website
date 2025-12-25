import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from "../pages/AuthContext";
import { useNavigate } from 'react-router-dom';
import { Package, User, MapPin, ShoppingBag, Map, RefreshCw } from 'lucide-react';

const DeliveryOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const { deliveryToken } = useContext(AuthContext);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/delivery/orders`,
        {
          headers: { Authorization: `Bearer ${deliveryToken}` }
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
    if (!deliveryToken) return;
    fetchOrders();
  }, [deliveryToken]);

  useEffect(() => {
    if (!currentOrderId || !deliveryToken) return;

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
  }, [currentOrderId, deliveryToken]);

  const handleMarkPicked = async (orderId) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/delivery/order/picked/${orderId}`,
        {},
        { headers: { Authorization: `Bearer ${deliveryToken}` } }
      );
      alert("Order marked as picked!");
      fetchOrders();
    } catch (err) {
      alert("Failed to mark order as picked");
      console.error(err);
    }
  };

  const getUiStatus = (status) => {
    if (status === 'PICKED_UP') return 'OUT_FOR_DELIVERY';
    return status;
  };

  const getStatusColor = (status) => {
    const statusMap = {
      'PLACED': 'bg-yellow-100 text-yellow-800',
      'PICKED_UP': 'bg-blue-100 text-blue-800',
      'OUT_FOR_DELIVERY': 'bg-purple-100 text-purple-800',
      'DELIVERED': 'bg-green-100 text-green-800'
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <div className="rounded-2xl bg-white p-12 shadow-sm ring-1 ring-gray-100">
          <div className="mb-4 flex justify-center text-gray-300">
            <Package size={64} />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">No Orders Yet</h2>
          <p className="mb-6 text-gray-500">New orders will appear here when assigned to you</p>
          <button
            onClick={fetchOrders}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2 font-semibold text-blue-600 hover:bg-blue-100"
          >
            <RefreshCw size={18} /> Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">📦 Assigned Orders ({orders.length})</h2>
        <button
          onClick={fetchOrders}
          className="rounded-full bg-white p-2 text-gray-500 shadow-sm hover:bg-gray-50 hover:text-blue-600"
          title="Refresh Orders"
        >
          <RefreshCw size={20} />
        </button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {orders.map((order) => (
          <div key={order.id} className="flex flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-md">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-mono text-xs font-bold uppercase text-gray-400">#{order.id}</span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${getStatusColor(getUiStatus(order.status))}`}>
                {order.status.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="mb-6 space-y-3">
              <div className="flex items-start gap-3">
                <User size={18} className="mt-0.5 shrink-0 text-gray-400" />
                <div>
                  <p className="text-xs font-medium text-gray-500">Customer</p>
                  <p className="font-semibold text-gray-900">{order.customer}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin size={18} className="mt-0.5 shrink-0 text-gray-400" />
                <div>
                  <p className="text-xs font-medium text-gray-500">Address</p>
                  <p className="text-sm font-medium text-gray-900">{order.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ShoppingBag size={18} className="mt-0.5 shrink-0 text-gray-400" />
                <div>
                  <p className="text-xs font-medium text-gray-500">Items</p>
                  <p className="text-sm font-medium text-gray-900 line-clamp-2">{order.items}</p>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-4">
              {order.status === 'PLACED' && (
                <button
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700 disabled:opacity-50"
                  onClick={() => handleMarkPicked(order.id)}
                  disabled={currentOrderId !== null && currentOrderId !== order.id}
                >
                  <Package size={18} /> Mark as Picked
                </button>
              )}

              {order.status === 'PICKED_UP' && (
                <button
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700"
                  onClick={() => navigate(`/delivery/tracking/${order.id}`)}
                >
                  <Map size={18} /> View Route
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeliveryOrders;