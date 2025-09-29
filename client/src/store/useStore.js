import { create } from 'zustand';
import axios from 'axios';
import { toast } from 'react-toastify';

const useStore = create((set, get) => ({
  // Auth state
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  
  // Cart state
  cart: [],
  
  // Products state
  products: [],
  
  // Auth actions
  login: async (credentials) => {
    try {
      const response = await axios.post('/api/auth/login', credentials);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      set({
        user,
        token,
        isAuthenticated: true
      });
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  },
  
  register: async (userData) => {
    try {
      const response = await axios.post('/api/auth/register', userData);
      // Store email for potential resend verification
      localStorage.setItem('pendingVerificationEmail', userData.email);
      toast.success(response.data.message);
      return { success: true, message: response.data.message };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('pendingVerificationEmail');
    delete axios.defaults.headers.common['Authorization'];
    
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      cart: []
    });
  },
  
  verifyToken: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await axios.get('/api/auth/profile');
      
      set({
        user: response.data,
        token,
        isAuthenticated: true
      });
    } catch (error) {
      get().logout();
    }
  },
  
  // Cart actions
  addToCart: (product) => {
    const { cart } = get();
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      set({
        cart: cart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      });
    } else {
      set({
        cart: [...cart, { ...product, quantity: 1 }]
      });
    }
  },
  
  removeFromCart: (productId) => {
    const { cart } = get();
    set({
      cart: cart.filter(item => item.id !== productId)
    });
  },
  
  updateCartQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(productId);
      return;
    }
    
    const { cart } = get();
    set({
      cart: cart.map(item =>
        item.id === productId
          ? { ...item, quantity }
          : item
      )
    });
  },
  
  clearCart: () => {
    set({ cart: [] });
  },
  
  // Products actions
  fetchProducts: async () => {
    try {
      const response = await axios.get('/api/products');
      set({ products: response.data });
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  }
}));

export default useStore;