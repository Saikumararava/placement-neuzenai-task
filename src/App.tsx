import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Layout Components
import Header from './components/Header';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import CheckoutPage, { CheckoutSuccessPage } from './pages/CheckoutPage';
import SearchPage from './pages/SearchPage';
import CategoryPage from './pages/CategoryPage';

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  return element;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/products/:id" element={<ProductPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route 
                  path="/checkout" 
                  element={<ProtectedRoute element={<CheckoutPage />} />} 
                />
                <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/category/:category" element={<CategoryPage />} />
                {/* Add more routes as needed */}
              </Routes>
            </main>
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;