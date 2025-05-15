import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingCart, ArrowRight, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';

const CartPage: React.FC = () => {
  const { items, removeFromCart, updateQuantity, clearCart, subtotal } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    setIsUpdating(true);
    updateQuantity(productId, newQuantity);
    
    // Simulate network delay for better UX feedback
    setTimeout(() => {
      setIsUpdating(false);
    }, 300);
  };

  const handleRemoveItem = (productId: number) => {
    removeFromCart(productId);
  };

  const handleCheckout = () => {
    if (isAuthenticated) {
      navigate('/checkout');
    } else {
      navigate('/login?redirect=checkout');
    }
  };

  const shippingCost = subtotal > 50 ? 0 : 10;
  const totalCost = subtotal + shippingCost;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="mb-6 text-gray-400">
            <ShoppingCart size={64} className="mx-auto" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">
            Looks like you haven't added any products to your cart yet.
          </p>
          <Link to="/products">
            <Button variant="primary">Start Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Your Shopping Cart</h1>
      
      <div className="lg:flex lg:gap-8">
        {/* Cart Items */}
        <div className="lg:flex-grow">
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="hidden sm:grid sm:grid-cols-12 gap-4 p-4 border-b border-gray-200 bg-gray-50 font-medium">
              <div className="sm:col-span-6">Product</div>
              <div className="sm:col-span-2 text-center">Price</div>
              <div className="sm:col-span-2 text-center">Quantity</div>
              <div className="sm:col-span-2 text-center">Total</div>
            </div>
            
            <div className={`transition-opacity duration-300 ${isUpdating ? 'opacity-50' : 'opacity-100'}`}>
              {items.map((item) => (
                <div 
                  key={item.productId} 
                  className="grid sm:grid-cols-12 gap-4 p-4 border-b border-gray-200 last:border-0 items-center"
                >
                  {/* Product Info */}
                  <div className="sm:col-span-6 flex items-center">
                    <div className="w-20 h-20 mr-4 bg-gray-100 rounded flex-shrink-0">
                      <img 
                        src={item.product.image} 
                        alt={item.product.title}
                        className="w-full h-full object-contain p-2"
                      />
                    </div>
                    <div>
                      <Link 
                        to={`/products/${item.productId}`}
                        className="font-medium hover:text-blue-600 line-clamp-2"
                      >
                        {item.product.title}
                      </Link>
                      <button
                        onClick={() => handleRemoveItem(item.productId)}
                        className="flex items-center text-sm text-red-500 hover:text-red-700 mt-1"
                      >
                        <Trash2 size={14} className="mr-1" />
                        Remove
                      </button>
                    </div>
                  </div>
                  
                  {/* Price */}
                  <div className="sm:col-span-2 text-center">
                    <div className="sm:hidden text-sm text-gray-500 mb-1">Price:</div>
                    ${item.product.price.toFixed(2)}
                  </div>
                  
                  {/* Quantity */}
                  <div className="sm:col-span-2 flex justify-center">
                    <div className="sm:hidden text-sm text-gray-500 mb-1 mr-2">Quantity:</div>
                    <div className="flex items-center">
                      <button 
                        onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-l-md hover:bg-gray-100"
                        disabled={isUpdating}
                      >
                        <Minus size={14} />
                      </button>
                      <div className="w-10 h-8 flex items-center justify-center border-t border-b border-gray-300">
                        {item.quantity}
                      </div>
                      <button 
                        onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-r-md hover:bg-gray-100"
                        disabled={isUpdating}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Total */}
                  <div className="sm:col-span-2 text-center font-medium">
                    <div className="sm:hidden text-sm text-gray-500 mb-1">Total:</div>
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between mb-8">
            <Button 
              variant="outline"
              onClick={() => navigate('/products')}
            >
              Continue Shopping
            </Button>
            <Button 
              variant="ghost"
              onClick={clearCart}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              Clear Cart
            </Button>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-lg font-bold mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">
                  {shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between">
                <span className="font-bold">Total</span>
                <span className="font-bold">${totalCost.toFixed(2)}</span>
              </div>
            </div>
            
            <Button
              variant="primary"
              fullWidth
              size="lg"
              rightIcon={<ArrowRight size={18} />}
              onClick={handleCheckout}
            >
              Proceed to Checkout
            </Button>
            
            <div className="mt-4 text-xs text-gray-500">
              <p>Shipping is free for orders over $50.</p>
              <p>Estimated delivery: 3-5 business days</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;