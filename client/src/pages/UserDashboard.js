import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  TrendingUp,
  Package,
  User,
  Heart,
  Settings,
  Bell,
  CreditCard,
  MapPin
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import useStore from '../store/useStore';
import axios from 'axios';

const UserDashboard = () => {
  const { user } = useStore();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    pendingOrders: 0,
    completedOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [spendingData, setSpendingData] = useState([]);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch orders
      const ordersResponse = await axios.get('/api/orders');
      const orders = ordersResponse.data;
      
      // Calculate stats
      const totalOrders = orders.length;
      const totalSpent = orders.reduce((sum, order) => sum + parseFloat(order.total), 0);
      const pendingOrders = orders.filter(order => order.status === 'pending').length;
      const completedOrders = orders.filter(order => order.status === 'delivered').length;
      
      setStats({ totalOrders, totalSpent, pendingOrders, completedOrders });
      setRecentOrders(orders.slice(0, 5));
      
      // Generate spending data for chart
      const monthlySpending = generateMonthlySpending(orders);
      setSpendingData(monthlySpending);
      
      // Generate activities
      const recentActivities = generateActivities(orders);
      setActivities(recentActivities);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const generateMonthlySpending = (orders) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      month,
      spending: Math.floor(Math.random() * 500) + 100
    }));
  };

  const generateActivities = (orders) => {
    const activities = [
      { type: 'order', message: 'Order #1234 was delivered', time: '2 hours ago', icon: CheckCircle, color: 'text-emerald-600' },
      { type: 'profile', message: 'Profile updated successfully', time: '1 day ago', icon: User, color: 'text-violet-600' },
      { type: 'order', message: 'New order #1235 placed', time: '2 days ago', icon: ShoppingBag, color: 'text-amber-600' },
      { type: 'wishlist', message: 'Added item to wishlist', time: '3 days ago', icon: Heart, color: 'text-rose-600' },
    ];
    return activities;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-amber-800 bg-amber-100';
      case 'processing': return 'text-cyan-800 bg-cyan-100';
      case 'shipped': return 'text-violet-800 bg-violet-100';
      case 'delivered': return 'text-emerald-800 bg-emerald-100';
      case 'cancelled': return 'text-rose-800 bg-rose-100';
      default: return 'text-slate-800 bg-slate-100';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 rounded-3xl p-8 text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2 text-white">Welcome back, {user?.name}!</h1>
                <p className="text-orange-100 text-lg">Here's what's happening with your account today.</p>
              </div>
              <div className="hidden md:block">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <User className="h-12 w-12 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-transform">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-cyan-100 text-sm font-medium">Total Orders</p>
                    <p className="text-3xl font-bold text-white">{stats.totalOrders}</p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <ShoppingBag className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-transform">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm font-medium">Total Spent</p>
                    <p className="text-3xl font-bold text-white">${stats.totalSpent.toFixed(2)}</p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-transform">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-100 text-sm font-medium">Pending Orders</p>
                    <p className="text-3xl font-bold text-white">{stats.pendingOrders}</p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-transform">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-violet-100 text-sm font-medium">Completed</p>
                    <p className="text-3xl font-bold text-white">{stats.completedOrders}</p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Spending Chart */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-orange-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-800">Spending Overview</h3>
                <div className="p-2 bg-gradient-to-r from-amber-400 to-orange-400 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={spendingData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" className="text-slate-600" />
                    <YAxis className="text-slate-600" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #f97316', 
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                        color: '#1e293b'
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="spending" 
                      stroke="url(#colorGradient)" 
                      strokeWidth={4}
                      dot={{ fill: '#f97316', strokeWidth: 2, r: 6 }}
                    />
                    <defs>
                      <linearGradient id="colorGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#f97316" />
                      </linearGradient>
                    </defs>
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-orange-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-800">Recent Orders</h3>
                <Link to="/orders" className="bg-gradient-to-r from-amber-400 to-orange-400 text-white px-6 py-2 rounded-full text-sm font-medium hover:from-amber-500 hover:to-orange-500 transition-all transform hover:scale-105">
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-6 bg-gradient-to-r from-slate-50 to-orange-50 rounded-2xl border border-orange-100 hover:shadow-lg transition-all">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
                          <Package className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">Order #{order.id}</p>
                          <p className="text-sm text-slate-500">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                        <span className="font-bold text-slate-800 text-lg">${order.total}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-br from-slate-300 to-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Package className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-slate-500 text-lg mb-4">No orders yet</p>
                    <Link to="/shop" className="bg-gradient-to-r from-amber-400 to-orange-400 text-white px-8 py-3 rounded-full font-medium hover:from-amber-500 hover:to-orange-500 transition-all transform hover:scale-105">
                      Start Shopping
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-orange-100">
              <h3 className="text-xl font-bold text-slate-800 mb-6">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/shop"
                  className="flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-r from-cyan-50 to-blue-50 hover:from-cyan-100 hover:to-blue-100 transition-all group"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ShoppingBag className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-slate-700 font-medium">Browse Products</span>
                </Link>
                <Link
                  to="/orders"
                  className="flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 transition-all group"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-slate-700 font-medium">Track Orders</span>
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 hover:from-violet-100 hover:to-purple-100 transition-all group"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-400 to-purple-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-slate-700 font-medium">Edit Profile</span>
                </Link>
                <button className="flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-r from-rose-50 to-pink-50 hover:from-rose-100 hover:to-pink-100 transition-all w-full text-left group">
                  <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-pink-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Heart className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-slate-700 font-medium">Wishlist</span>
                </button>
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-orange-100">
              <h3 className="text-xl font-bold text-slate-800 mb-6">Account Information</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-orange-50 rounded-lg">
                  <span className="text-sm text-slate-600 font-medium">Member Since</span>
                  <span className="text-sm font-bold text-slate-800">
                    {user?.created_at ? new Date(user.created_at).getFullYear() : '2024'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-orange-50 rounded-lg">
                  <span className="text-sm text-slate-600 font-medium">Email Status</span>
                  <span className={`text-sm font-bold px-2 py-1 rounded-full ${user?.is_verified ? 'text-emerald-700 bg-emerald-100' : 'text-rose-700 bg-rose-100'}`}>
                    {user?.is_verified ? 'Verified' : 'Not Verified'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-orange-50 rounded-lg">
                  <span className="text-sm text-slate-600 font-medium">Email</span>
                  <span className="text-sm font-bold text-slate-800 truncate max-w-32">
                    {user?.email}
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-orange-100">
              <h3 className="text-xl font-bold text-slate-800 mb-6">Recent Activity</h3>
              <div className="space-y-4">
                {activities.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <div key={index} className="flex items-start space-x-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-slate-50 hover:to-orange-50 transition-all">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activity.color.replace('text-', 'bg-').replace('600', '100')}`}>
                        <Icon className={`h-5 w-5 ${activity.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800">{activity.message}</p>
                        <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;