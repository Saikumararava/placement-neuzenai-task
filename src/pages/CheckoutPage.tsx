import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard, 
  User, 
  MapPin, 
  Phone,
  Shield, 
  Check,
  ChevronRight
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card, CardBody } from '../components/ui/Card';

interface CheckoutForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  cardNumber: string;
  cardName: string;
  expiry: string;
  cvv: string;
  saveCard: boolean;
}

const CheckoutPage: React.FC = () => {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [form, setForm] = useState<CheckoutForm>({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
    saveCard: false
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  const shippingCost = subtotal > 50 ? 0 : 10;
  const totalCost = subtotal + shippingCost;

  const validateAddressForm = () => {
    const newErrors: Record<string, string> = {};
    const requiredFields = ['name', 'email', 'phone', 'address', 'city', 'state', 'zipCode', 'country'];
    
    requiredFields.forEach(field => {
      if (!form[field as keyof CheckoutForm]) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')} is required`;
      }
    });
    
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePaymentForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!form.cardNumber) {
      newErrors.cardNumber = 'Card number is required';
    } else if (!/^\d{16}$/.test(form.cardNumber.replace(/\s/g, ''))) {
      newErrors.cardNumber = 'Card number must be 16 digits';
    }
    
    if (!form.cardName) {
      newErrors.cardName = 'Name on card is required';
    }
    
    if (!form.expiry) {
      newErrors.expiry = 'Expiry date is required';
    } else if (!/^\d{2}\/\d{2}$/.test(form.expiry)) {
      newErrors.expiry = 'Expiry date must be in MM/YY format';
    }
    
    if (!form.cvv) {
      newErrors.cvv = 'CVV is required';
    } else if (!/^\d{3,4}$/.test(form.cvv)) {
      newErrors.cvv = 'CVV must be 3 or 4 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    // Format card number with spaces
    if (name === 'cardNumber') {
      const formatted = value
        .replace(/\s/g, '')
        .replace(/\D/g, '')
        .replace(/(\d{4})/g, '$1 ')
        .trim()
        .slice(0, 19);
        
      setForm(prev => ({ ...prev, [name]: formatted }));
    }
    // Format expiry date with slash
    else if (name === 'expiry') {
      const formatted = value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '$1/$2')
        .slice(0, 5);
        
      setForm(prev => ({ ...prev, [name]: formatted }));
    }
    // Format CVV - numbers only
    else if (name === 'cvv') {
      const formatted = value.replace(/\D/g, '').slice(0, 4);
      setForm(prev => ({ ...prev, [name]: formatted }));
    }
    // Handle checkbox
    else if (type === 'checkbox') {
      setForm(prev => ({ ...prev, [name]: checked }));
    }
    // Handle other fields
    else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddressFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateAddressForm()) {
      setCurrentStep(2);
      window.scrollTo(0, 0);
    }
  };

  const handlePaymentFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validatePaymentForm()) {
      setIsLoading(true);
      
      try {
        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Clear cart and redirect to success page
        clearCart();
        navigate('/checkout/success');
      } catch (error) {
        console.error('Payment failed:', error);
        setErrors({ payment: 'Payment processing failed. Please try again.' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const formatCardNumber = (cardNumber: string) => {
    const last4 = cardNumber.replace(/\s/g, '').slice(-4);
    return `•••• •••• •••• ${last4}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>
      
      {/* Checkout Steps */}
      <div className="flex mb-8">
        <div className={`flex-1 text-center ${currentStep === 1 ? 'font-semibold' : ''}`}>
          <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${currentStep === 1 ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'}`}>
            {currentStep > 1 ? <Check size={16} /> : '1'}
          </div>
          <div className="mt-2">Shipping</div>
        </div>
        <div className="flex-1 relative">
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200">
            <div className={`h-full bg-blue-600 transition-all ${currentStep > 1 ? 'w-full' : 'w-0'}`}></div>
          </div>
        </div>
        <div className={`flex-1 text-center ${currentStep === 2 ? 'font-semibold' : ''}`}>
          <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${currentStep === 2 ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'}`}>
            2
          </div>
          <div className="mt-2">Payment</div>
        </div>
      </div>
      
      <div className="lg:flex lg:gap-8">
        {/* Main Form */}
        <div className="lg:flex-grow mb-8 lg:mb-0">
          {currentStep === 1 && (
            <Card>
              <CardBody>
                <h2 className="text-xl font-semibold mb-6">Shipping Information</h2>
                
                <form onSubmit={handleAddressFormSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      error={errors.name}
                      leftIcon={<User size={18} />}
                      fullWidth
                    />
                    <Input
                      label="Email Address"
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      error={errors.email}
                      fullWidth
                    />
                  </div>
                  
                  <Input
                    label="Phone Number"
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    error={errors.phone}
                    leftIcon={<Phone size={18} />}
                    fullWidth
                  />
                  
                  <Input
                    label="Street Address"
                    type="text"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    error={errors.address}
                    leftIcon={<MapPin size={18} />}
                    fullWidth
                  />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input
                      label="City"
                      type="text"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      error={errors.city}
                      fullWidth
                    />
                    <Input
                      label="State/Province"
                      type="text"
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      error={errors.state}
                      fullWidth
                    />
                    <Input
                      label="ZIP/Postal Code"
                      type="text"
                      name="zipCode"
                      value={form.zipCode}
                      onChange={handleChange}
                      error={errors.zipCode}
                      fullWidth
                    />
                  </div>
                  
                  <Input
                    label="Country"
                    type="text"
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    error={errors.country}
                    fullWidth
                  />
                  
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      rightIcon={<ChevronRight size={18} />}
                    >
                      Continue to Payment
                    </Button>
                  </div>
                </form>
              </CardBody>
            </Card>
          )}
          
          {currentStep === 2 && (
            <Card>
              <CardBody>
                <h2 className="text-xl font-semibold mb-6">Payment Information</h2>
                
                {errors.payment && (
                  <div className="mb-6 p-3 bg-red-50 text-red-500 rounded-md text-sm">
                    {errors.payment}
                  </div>
                )}
                
                <div className="mb-6 p-4 bg-gray-50 rounded-md">
                  <h3 className="font-medium mb-2">Shipping to:</h3>
                  <p>{form.name}</p>
                  <p>{form.address}</p>
                  <p>{form.city}, {form.state} {form.zipCode}</p>
                  <p>{form.country}</p>
                  <p>{form.phone}</p>
                  <button 
                    type="button" 
                    onClick={() => setCurrentStep(1)}
                    className="text-sm text-blue-600 hover:text-blue-800 mt-2"
                  >
                    Edit
                  </button>
                </div>
                
                <form onSubmit={handlePaymentFormSubmit} className="space-y-6">
                  <Input
                    label="Card Number"
                    type="text"
                    name="cardNumber"
                    value={form.cardNumber}
                    onChange={handleChange}
                    error={errors.cardNumber}
                    leftIcon={<CreditCard size={18} />}
                    placeholder="XXXX XXXX XXXX XXXX"
                    fullWidth
                  />
                  
                  <Input
                    label="Name on Card"
                    type="text"
                    name="cardName"
                    value={form.cardName}
                    onChange={handleChange}
                    error={errors.cardName}
                    fullWidth
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Expiration Date (MM/YY)"
                      type="text"
                      name="expiry"
                      value={form.expiry}
                      onChange={handleChange}
                      error={errors.expiry}
                      placeholder="MM/YY"
                      fullWidth
                    />
                    <Input
                      label="CVV"
                      type="text"
                      name="cvv"
                      value={form.cvv}
                      onChange={handleChange}
                      error={errors.cvv}
                      placeholder="XXX"
                      fullWidth
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="saveCard"
                      name="saveCard"
                      checked={form.saveCard}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="saveCard" className="ml-2 block text-sm text-gray-700">
                      Save card for future purchases
                    </label>
                  </div>
                  
                  <div className="pt-4 flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(1)}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      isLoading={isLoading}
                    >
                      Pay ${totalCost.toFixed(2)}
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-center text-sm text-gray-500 mt-4">
                    <Shield size={16} className="mr-2" />
                    Your payment information is secure and encrypted
                  </div>
                </form>
              </CardBody>
            </Card>
          )}
        </div>
        
        {/* Order Summary */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="font-bold text-lg mb-4">Order Summary</h2>
            
            <div className="divide-y divide-gray-200">
              {items.map(item => (
                <div key={item.productId} className="py-3 flex">
                  <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0">
                    <img 
                      src={item.product.image} 
                      alt={item.product.title}
                      className="w-full h-full object-contain p-2"
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium line-clamp-2">{item.product.title}</p>
                    <div className="flex justify-between mt-1">
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      <p className="text-sm font-medium">${(item.product.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span>{shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between font-bold pt-2">
                <span>Total</span>
                <span>${totalCost.toFixed(2)}</span>
              </div>
            </div>
            
            {currentStep === 2 && (
              <div className="mt-6 border-t border-gray-200 pt-4">
                <h3 className="font-medium mb-2">Payment Details</h3>
                {form.cardNumber ? (
                  <div className="text-sm">
                    <p className="flex items-center">
                      <CreditCard size={16} className="mr-2" />
                      {formatCardNumber(form.cardNumber)}
                    </p>
                    <p className="mt-1">{form.expiry}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Please enter your payment details</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const CheckoutSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const orderNumber = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="max-w-md mx-auto">
        <div className="bg-green-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8">
          <Check size={48} className="text-green-600" />
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Order Confirmed!</h1>
        
        <p className="text-lg text-gray-700 mb-6">
          Thank you for your purchase. Your order #{orderNumber} has been successfully placed.
        </p>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="font-semibold mb-4">Order Details</h2>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Order Number:</span>
            <span className="font-medium">{orderNumber}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Date:</span>
            <span className="font-medium">{new Date().toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Email:</span>
            <span className="font-medium">user@example.com</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Estimated Delivery:</span>
            <span className="font-medium">
              {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
            </span>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mb-8">
          A confirmation email has been sent with the details of your order.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button onClick={() => navigate('/orders')}>
            View Order Status
          </Button>
          <Button variant="outline" onClick={() => navigate('/')}>
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;