import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart, 
  Settings,
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Search,
  Bell,
  DollarSign,
  TrendingUp,
  UserPlus
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import axios from 'axios';
import { toast } from 'react-toastify';
import useStore from '../store/useStore';

const AdminSidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/products', label: 'Products', icon: Package },
    { path: '/admin/payroll', label: 'Payroll', icon: DollarSign },
    { path: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { path: '/admin/users', label: 'Users', icon: Users },
    { path: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-black shadow-lg h-full border-r border-yellow-400">
      <div className="p-6 border-b border-yellow-400">
        <h2 className="text-xl font-bold text-yellow-400">Admin Panel-Alleuia</h2>
        <p className="text-sm text-gray-300">Manage your store</p>
      </div>
      <nav className="mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-yellow-400 text-black border-r-2 border-yellow-500'
                  : 'text-gray-300 hover:text-yellow-400 hover:bg-gray-800'
              }`}
            >
              <Icon className="h-5 w-5 mr-3" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

const AdminTopBar = () => {
  const { user } = useStore();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="bg-black shadow-sm border-b border-yellow-400 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-yellow-400 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-gray-800 text-white"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="relative p-2 text-gray-400 hover:text-yellow-400">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-2 w-2 bg-yellow-400 rounded-full"></span>
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-black text-sm font-medium">
                {user?.name?.charAt(0) || 'A'}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-white">{user?.name}</p>
              <p className="text-xs text-gray-400">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminStats = () => {
  const [stats, setStats] = useState({
    totalSalesToday: 0,
    ordersToday: 0,
    newCustomers: 0,
    totalRevenue: 0
  });
  const [revenueData, setRevenueData] = useState([]);
  const [ordersData, setOrdersData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      const response = await axios.get('/api/admin/stats');
      setStats({
        totalSalesToday: Math.floor(Math.random() * 5000) + 1000,
        ordersToday: Math.floor(Math.random() * 50) + 10,
        newCustomers: Math.floor(Math.random() * 20) + 5,
        totalRevenue: response.data.totalRevenue || 0
      });

      // Generate mock data for charts
      const revenue = Array.from({ length: 7 }, (_, i) => ({
        day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
        revenue: Math.floor(Math.random() * 1000) + 500
      }));
      setRevenueData(revenue);

      const orders = Array.from({ length: 7 }, (_, i) => ({
        day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
        orders: Math.floor(Math.random() * 20) + 5
      }));
      setOrdersData(orders);

      const products = [
        { name: 'Wireless Headphones', sales: 45, color: '#FBBF24' },
        { name: 'Smart Watch', sales: 32, color: '#000000' },
        { name: 'T-Shirt', sales: 28, color: '#F59E0B' },
        { name: 'Leather Wallet', sales: 15, color: '#374151' }
      ];
      setTopProducts(products);

      // Fetch recent orders
      const ordersResponse = await axios.get('/api/admin/orders');
      setRecentOrders(ordersResponse.data.slice(0, 5));

    } catch (error) {
      console.error('Error fetching admin stats:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-800 bg-yellow-200';
      case 'processing': return 'text-black bg-yellow-400';
      case 'shipped': return 'text-gray-800 bg-gray-200';
      case 'delivered': return 'text-black bg-yellow-300';
      case 'cancelled': return 'text-white bg-black';
      default: return 'text-gray-800 bg-gray-200';
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-100 min-h-full">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-black rounded-xl p-6 shadow-sm border border-yellow-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Sales Today</p>
              <p className="text-2xl font-bold text-white">${stats.totalSalesToday}</p>
              <p className="text-xs text-yellow-400">+12% from yesterday</p>
            </div>
            <div className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-black" />
            </div>
          </div>
        </div>

        <div className="bg-yellow-400 rounded-xl p-6 shadow-sm border border-black">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-black">Orders Today</p>
              <p className="text-2xl font-bold text-black">{stats.ordersToday}</p>
              <p className="text-xs text-gray-800">+8% from yesterday</p>
            </div>
            <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-black rounded-xl p-6 shadow-sm border border-yellow-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">New Customers</p>
              <p className="text-2xl font-bold text-white">{stats.newCustomers}</p>
              <p className="text-xs text-yellow-400">+15% from yesterday</p>
            </div>
            <div className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center">
              <UserPlus className="h-6 w-6 text-black" />
            </div>
          </div>
        </div>

        <div className="bg-yellow-400 rounded-xl p-6 shadow-sm border border-black">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-black">Total Revenue</p>
              <p className="text-2xl font-bold text-black">${stats.totalRevenue}</p>
              <p className="text-xs text-gray-800">+5% from last month</p>
            </div>
            <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-black rounded-xl p-6 shadow-sm border border-yellow-400">
          <h3 className="text-lg font-semibold text-white mb-4">Revenue Over Time</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="day" className="text-gray-400" />
                <YAxis className="text-gray-400" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#000000', 
                    border: '1px solid #FBBF24', 
                    borderRadius: '8px',
                    color: 'white'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#FBBF24" 
                  strokeWidth={3}
                  dot={{ fill: '#FBBF24', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders Chart */}
        <div className="bg-black rounded-xl p-6 shadow-sm border border-yellow-400">
          <h3 className="text-lg font-semibold text-white mb-4">Orders Per Day</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ordersData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="day" className="text-gray-400" />
                <YAxis className="text-gray-400" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#000000', 
                    border: '1px solid #FBBF24', 
                    borderRadius: '8px',
                    color: 'white'
                  }} 
                />
                <Bar dataKey="orders" fill="#FBBF24" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Selling Products */}
        <div className="bg-black rounded-xl p-6 shadow-sm border border-yellow-400">
          <h3 className="text-lg font-semibold text-white mb-4">Top Selling Products</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={topProducts}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="sales"
                >
                  {topProducts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: product.color }}
                  ></div>
                  <span className="text-sm text-gray-400">{product.name}</span>
                </div>
                <span className="text-sm font-medium text-white">{product.sales}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-black rounded-xl p-6 shadow-sm border border-yellow-400">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Latest Orders</h3>
            <Link to="/admin/orders" className="text-yellow-400 hover:text-yellow-300 text-sm font-medium">
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-400">Order ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-400">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-400">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-400">Total</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-400">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-700">
                    <td className="py-3 px-4 text-sm font-medium text-white">
                      #{order.id}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-400">
                      {order.customer_name || 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-white">
                      ${order.total}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-400">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    image_url: ''
  });
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaType, setMediaType] = useState('image');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('stock', formData.stock);
    data.append('category', formData.category);
    if (mediaFile) {
      data.append('media', mediaFile);
      data.append('mediaType', mediaType);
    } else if (formData.image_url) {
      // allow retaining existing URL on edit
      data.append('image_url', formData.image_url);
    }

    try {
      if (editingProduct) {
        await axios.put(`/api/admin/products/${editingProduct.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Product updated successfully');
      } else {
        await axios.post('/api/admin/products', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Product created successfully');
      }
      
      fetchProducts();
      closeModal();
    } catch (error) {
      toast.error('Error saving product: ' + (error.response?.data?.message || 'Something went wrong'));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`/api/admin/products/${id}`);
        toast.success('Product deleted successfully');
        fetchProducts();
      } catch (error) {
        toast.error('Error deleting product');
      }
    }
  };

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
    } else {
      setEditingProduct(null);
      setFormData({
        title: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        image_url: ''
      });
    }
    setMediaFile(null);
    setMediaType('image');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-black">Products</h2>
        <button
          onClick={() => openModal()}
          className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors font-medium"
        >
          <Plus className="h-4 w-4" />
          <span>Add Product</span>
        </button>
      </div>

      <div className="bg-black rounded-xl shadow-sm border border-yellow-400 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-black divide-y divide-gray-700">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        className="h-12 w-12 rounded-lg object-cover border border-yellow-400"
                        src={product.image_url || 'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg'}
                        alt={product.title}
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">
                          {product.title}
                        </div>
                        <div className="text-sm text-gray-400 truncate max-w-xs">
                          {product.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    ${product.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {product.stock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white capitalize">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openModal(product)}
                        className="text-yellow-400 hover:text-yellow-300"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-black p-6 border border-yellow-400 w-full max-w-md mx-4 shadow-lg rounded-xl">
            <h3 className="text-lg font-bold text-white mb-4">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-yellow-400 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-gray-800 text-white"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  required
                  className="w-full px-3 py-2 border border-yellow-400 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-gray-800 text-white"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="w-full px-3 py-2 border border-yellow-400 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-gray-800 text-white"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Stock
                  </label>
                  <input
                    type="number"
                    required
                    className="w-full px-3 py-2 border border-yellow-400 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-gray-800 text-white"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Category
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-yellow-400 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-gray-800 text-white"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="">Select a Category</option>
                  <option>Men's Clothing</option>
                  <option>Women's Clothing</option>
                  <option>Accessories</option>
                  <option>Shoes</option>
                  <option>Jewelry</option>
                  <option>Bags & Backpacks</option>
                  <option>Watches</option>
                  <option>Electronics</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Media (Photo or Video)
                </label>
                <div className="flex items-center space-x-3 mb-2">
                  <label className="flex items-center space-x-2 text-gray-300">
                    <input type="radio" name="mediatype" checked={mediaType==='image'} onChange={() => setMediaType('image')} />
                    <span>Image</span>
                  </label>
                  <label className="flex items-center space-x-2 text-gray-300">
                    <input type="radio" name="mediatype" checked={mediaType==='video'} onChange={() => setMediaType('video')} />
                    <span>Video</span>
                  </label>
                </div>
                <input
                  type="file"
                  accept={mediaType==='image' ? 'image/*' : 'video/*'}
                  onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-yellow-400 rounded-lg bg-gray-800 text-white"
                />
                {editingProduct && !mediaFile && formData.image_url && (
                  <p className="text-xs text-gray-400 mt-2">Keeping existing media. Upload a new file to replace.</p>
                )}
              </div>
              
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black rounded-lg transition-colors font-medium"
                >
                  {editingProduct ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/admin/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.patch(`/api/admin/orders/${orderId}/status`, { status: newStatus });
      toast.success('Order status updated successfully');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-800 bg-yellow-200';
      case 'processing': return 'text-black bg-yellow-400';
      case 'shipped': return 'text-gray-800 bg-gray-200';
      case 'delivered': return 'text-black bg-yellow-300';
      case 'cancelled': return 'text-white bg-black';
      default: return 'text-gray-800 bg-gray-200';
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-full">
      <h2 className="text-2xl font-bold text-black mb-6">Orders</h2>

      <div className="bg-black rounded-xl shadow-sm border border-yellow-400 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-black divide-y divide-gray-700">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    #{order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-white">
                        {order.customer_name || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-400">
                        {order.customer_email || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    ${order.total}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border-0 ${getStatusColor(order.status)}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-yellow-400 hover:text-yellow-300">
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-full">
      <h2 className="text-2xl font-bold text-black mb-6">Users</h2>

      <div className="bg-black rounded-xl shadow-sm border border-yellow-400 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Provider
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="bg-black divide-y divide-gray-700">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                        <span className="text-black text-sm font-medium">
                          {user.name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-400">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin' 
                        ? 'text-black bg-yellow-400' 
                        : 'text-white bg-gray-600'
                    }`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.is_verified 
                        ? 'text-black bg-yellow-300' 
                        : 'text-white bg-red-600'
                    }`}>
                      {user.is_verified ? 'Verified' : 'Not Verified'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white capitalize">
                    {user.provider}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const PayrollPage = () => {
  const [rows, setRows] = useState([{ phone: '', amount: '' }]);
  const [submitting, setSubmitting] = useState(false);

  const addRow = () => setRows([...rows, { phone: '', amount: '' }]);
  const removeRow = (idx) => setRows(rows.filter((_, i) => i !== idx));

  const updateRow = (idx, key, value) => {
    const next = [...rows];
    next[idx][key] = value;
    setRows(next);
  };

  const submit = async () => {
    const payouts = rows
      .filter(r => r.phone && r.amount)
      .map(r => ({ phone: r.phone, amount: r.amount, note: 'Payroll' }));
    if (payouts.length === 0) {
      toast.error('Please add at least one valid row.');
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await axios.post('/api/admin/payroll/payouts', { payouts });
      toast.success(`Initiated ${data.results.length} payout(s).`);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to initiate payouts');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-full">
      <h2 className="text-2xl font-bold text-black mb-6">Payroll (MTN MoMo Sandbox)</h2>
      <div className="bg-black rounded-xl p-6 border border-yellow-400">
        <div className="space-y-4">
          {rows.map((r, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-3">
              <input
                className="col-span-5 px-3 py-2 border border-yellow-400 rounded-lg bg-gray-800 text-white"
                placeholder="Phone (e.g. 2507XXXXXXXX)"
                value={r.phone}
                onChange={(e) => updateRow(idx, 'phone', e.target.value)}
              />
              <input
                className="col-span-5 px-3 py-2 border border-yellow-400 rounded-lg bg-gray-800 text-white"
                placeholder="Amount"
                type="number"
                step="0.01"
                value={r.amount}
                onChange={(e) => updateRow(idx, 'amount', e.target.value)}
              />
              <div className="col-span-2 flex gap-2">
                <button onClick={addRow} className="flex-1 bg-yellow-400 text-black px-3 rounded-lg hover:bg-yellow-500">Add</button>
                {rows.length > 1 && (
                  <button onClick={() => removeRow(idx)} className="flex-1 bg-gray-700 text-white px-3 rounded-lg hover:bg-gray-600">Remove</button>
                )}
              </div>
            </div>
          ))}
          <div className="pt-2">
            <button onClick={submit} disabled={submitting} className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black rounded-lg font-medium">
              {submitting ? 'Submitting...' : 'Submit Payouts'}
            </button>
            <p className="text-xs text-gray-400 mt-3">This uses MTN MoMo sandbox disbursement; real money is not moved. Ensure server .env has MOMO_SUBSCRIPTION_KEY, MOMO_API_USER, MOMO_API_KEY.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col">
        <AdminTopBar />
        
        <div className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<AdminStats />} />
            <Route path="/products" element={<ProductManagement />} />
            <Route path="/payroll" element={<PayrollPage />} />
            <Route path="/orders" element={<OrderManagement />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/settings" element={
              <div className="p-6 bg-gray-100 min-h-full">
                <h2 className="text-2xl font-bold text-black">Settings</h2>
                <div className="mt-6 bg-black p-6 rounded-xl border border-yellow-400">
                  <p className="text-gray-400">Settings management coming soon...</p>
                </div>
              </div>
            } />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;