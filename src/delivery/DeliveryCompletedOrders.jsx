import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from "../pages/AuthContext";
import { CheckCircle, Calendar, User, DollarSign } from 'lucide-react';

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
        { headers: { Authorization: `Bearer ${deliveryToken}` } }
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
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (completedOrders.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <div className="rounded-2xl bg-white p-12 shadow-sm ring-1 ring-gray-100">
          <div className="mb-4 flex justify-center text-green-200">
            <CheckCircle size={64} />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">No Completed Orders Yet</h2>
          <p className="text-gray-500">Your delivered orders will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 lg:px-8">
      <h2 className="mb-8 text-2xl font-bold text-gray-900">✅ Completed Orders ({completedOrders.length})</h2>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {completedOrders.map((order, key) => (
          <div key={key} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-md">
            <div className="mb-4 flex items-center justify-between border-b border-gray-50 pb-4">
              <span className="font-mono text-xs font-bold uppercase text-gray-400">Order #{order.orderId}</span>
              <span className="flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-700">
                <CheckCircle size={12} /> DELIVERED
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">{order.customerName}</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign size={16} className="text-gray-400" />
                  <span className="text-sm font-bold text-green-600">${order.totalPrice}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar size={14} />
                <span>{formatDate(order.updatedAt || order.deliveredAt)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeliveryCompletedOrders;