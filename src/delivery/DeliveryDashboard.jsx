import { useState, useEffect, useContext } from 'react';
import { AuthContext } from "../pages/AuthContext";
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  CheckCircle,
  IndianRupee,
  Clock,
  MapPin,
  ChevronRight,
  Power
} from 'lucide-react';

const DeliveryDashboard = () => {
  const [stats, setStats] = useState({
    activeOrders: 0,
    completedToday: 0,
    todayEarnings: 0,
    onlineStatus: 'OFF'
  });
  const [username, setUsername] = useState('Partner');
  const [loading, setLoading] = useState(true);
  const { deliveryToken } = useContext(AuthContext);

  useEffect(() => {
    if (!deliveryToken) return;
    fetchDashboardData();
  }, [deliveryToken]);

  const fetchDashboardData = async () => {
    try {
      // Mock stats - replace with actual API calls
      setStats({
        activeOrders: 2,
        completedToday: 5,
        todayEarnings: 650,
        onlineStatus: 'ON'
      });
      setUsername('Delivery Partner'); // You can decode token here if needed
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
      setLoading(false);
    }
  };

  const toggleStatus = () => {
    setStats(prev => ({
      ...prev,
      onlineStatus: prev.onlineStatus === 'ON' ? 'OFF' : 'ON'
    }));
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 lg:px-8">
      {/* Header & Status Toggle */}
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Welcome back, {username}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-6 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <ShoppingBag size={24} />
          </div>
          <p className="text-sm font-medium text-gray-500">Active Orders</p>
          <p className="text-3xl font-bold text-gray-900">{stats.activeOrders}</p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600">
            <CheckCircle size={24} />
          </div>
          <p className="text-sm font-medium text-gray-500">Completed Today</p>
          <p className="text-3xl font-bold text-gray-900">{stats.completedToday}</p>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-6 text-white shadow-lg shadow-blue-500/30">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-sm">
            <IndianRupee size={24} />
          </div>
          <p className="text-blue-100">Today's Earnings</p>
          <p className="text-3xl font-bold text-white">₹{stats.todayEarnings}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
          <MapPin size={20} className="text-blue-600" /> Quick Actions
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            to="/delivery/orders"
            className="flex items-center justify-between rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-md hover:ring-blue-100"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <ShoppingBag size={24} />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-900">View Orders</p>
                <p className="text-sm text-gray-500">Check new & active orders</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </Link>

          <Link
            to="/delivery/earnings"
            className="flex items-center justify-between rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-md hover:ring-purple-100"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 text-purple-600">
                <IndianRupee size={24} />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-900">View Earnings</p>
                <p className="text-sm text-gray-500">Track your daily income</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </Link>
        </div>
      </div>

      {/* Recent Activity
      <div>
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
          <Clock size={20} className="text-blue-600" /> Recent Activity
        </h3>
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
          {[
            { id: 101, status: 'delivered', amount: 130 },
            { id: 100, status: 'delivered', amount: 150 },
            { id: 99, status: 'delivered', amount: 120 }
          ].map((activity, index) => (
            <div key={activity.id} className="flex items-center justify-between border-b border-gray-50 p-4 last:border-0 hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-gray-600">Order #{activity.id} delivered</span>
              </div>
              <span className="font-bold text-green-600">+₹{activity.amount}</span>
            </div>
          ))}
        </div>
      </div> */}
    </div>
  );
};

export default DeliveryDashboard;