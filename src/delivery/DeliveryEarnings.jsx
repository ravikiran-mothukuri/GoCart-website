import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from "../pages/AuthContext";
import { Calendar, BarChart2, Gem, TrendingUp, IndianRupee } from 'lucide-react';

const DeliveryEarnings = () => {
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const { deliveryToken } = useContext(AuthContext);

  const fetchEarnings = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/delivery/earnings`,
        { headers: { Authorization: `Bearer ${deliveryToken}` } }
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

    const interval = setInterval(() => {
      fetchEarnings();
    }, 30000);

    return () => clearInterval(interval);
  }, [deliveryToken]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!earnings) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-50 p-4">
        <h2 className="text-xl font-bold text-gray-900">💰 Earnings</h2>
        <p className="text-gray-500">Unable to load earnings data</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 lg:px-8">
      <h2 className="mb-8 text-2xl font-bold text-gray-900">💰 Earnings Dashboard</h2>

      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Calendar size={24} />
          </div>
          <h3 className="text-sm font-medium text-gray-500">Today</h3>
          <p className="mt-2 text-2xl font-bold text-gray-900">₹{earnings.todayEarnings.toFixed(2)}</p>
          <p className="text-xs text-gray-500">{earnings.todayDeliveries} deliveries</p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
            <BarChart2 size={24} />
          </div>
          <h3 className="text-sm font-medium text-gray-500">This Week</h3>
          <p className="mt-2 text-2xl font-bold text-gray-900">₹{earnings.weekEarnings.toFixed(2)}</p>
          <p className="text-xs text-gray-500">{earnings.weekDeliveries} deliveries</p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600">
            <Gem size={24} />
          </div>
          <h3 className="text-sm font-medium text-gray-500">Total Earnings</h3>
          <p className="mt-2 text-2xl font-bold text-gray-900">₹{earnings.totalEarnings.toFixed(2)}</p>
          <p className="text-xs text-gray-500">{earnings.totalDeliveries} deliveries</p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
            <TrendingUp size={24} />
          </div>
          <h3 className="text-sm font-medium text-gray-500">Average Order</h3>
          <p className="mt-2 text-2xl font-bold text-gray-900">₹{earnings.averageOrderValue.toFixed(2)}</p>
          <p className="text-xs text-gray-500">per delivery</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
        <h3 className="mb-6 text-lg font-bold text-gray-900">Performance Metrics</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4">
            <span className="text-sm font-medium text-gray-600">Daily Average</span>
            <strong className="text-lg font-bold text-gray-900">
              ₹{(earnings.totalEarnings / Math.max(1, earnings.totalDeliveries / 7)).toFixed(2)}
            </strong>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4">
            <span className="text-sm font-medium text-gray-600">Weekly Target Progress</span>
            <strong className="text-lg font-bold text-green-600">
              {((earnings.weekEarnings / 5000) * 100).toFixed(1)}%
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryEarnings;