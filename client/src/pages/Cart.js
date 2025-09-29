import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import useStore from '../store/useStore';
import axios from 'axios';

const Cart = () => {
  const { cart, updateCartQuantity, removeFromCart, clearCart, isAuthenticated } = useStore();
  const navigate = useNavigate();

  const total = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      const orderData = {
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        })),
        total: total
      };

      const response = await axios.post('/api/orders', orderData);
      
      if (response.data.success) {
        clearCart();
        alert('Order placed successfully!');
        navigate('/orders');
      }
    } catch (error) {
      alert('Error placing order: ' + (error.response?.data?.message || 'Something went wrong'));
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Start shopping to add items to your cart</p>
          <Link to="/shop" className="btn btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center py-4 border-b last:border-b-0">
                <img
                  src={item.image_url || 'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg'}
                  alt={item.title}
                  className="w-16 h-16 object-cover rounded-md"
                />
                
                <div className="flex-1 ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {item.title}
                  </h3>
                  <p className="text-gray-600">${item.price}</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                    className="p-1 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-3 py-1 border border-gray-300 rounded-md min-w-12 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                    className="p-1 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="ml-4">
                  <span className="text-lg font-semibold text-gray-900">
                    ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                  </span>
                </div>
                
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-md"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          
          <div className="bg-gray-50 px-6 py-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-2xl font-bold text-primary-600">
                ${total.toFixed(2)}
              </span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/shop" className="btn btn-secondary flex-1">
                Continue Shopping
              </Link>
              <button
                onClick={handleCheckout}
                className="btn btn-primary flex-1"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;