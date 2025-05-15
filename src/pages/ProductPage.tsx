import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, ChevronLeft, Star, Truck, Shield, RotateCcw } from 'lucide-react';
import { fetchProduct, fetchProducts } from '../services/api';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import Button from '../components/ui/Button';
import ProductCard from '../components/ProductCard';

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const productId = parseInt(id || '0');
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      setIsLoading(true);
      
      try {
        const productData = await fetchProduct(productId);
        
        if (productData) {
          setProduct(productData);
          
          // Load related products of the same category
          const allProducts = await fetchProducts();
          const related = allProducts
            .filter(p => p.category === productData.category && p.id !== productData.id)
            .slice(0, 4);
            
          setRelatedProducts(related);
        }
      } catch (error) {
        console.error('Error loading product:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const incrementQuantity = () => {
    setQuantity(quantity + 1);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-4 text-gray-600">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <p className="text-gray-600 mb-8">Sorry, we couldn't find the product you're looking for.</p>
        <Link to="/products">
          <Button variant="primary">Browse Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link 
          to="/products" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ChevronLeft size={16} />
          <span className="ml-1">Back to Products</span>
        </Link>
      </div>

      {/* Product Details */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-12">
        <div className="md:flex">
          {/* Product Image */}
          <div className="md:w-1/2 p-8 bg-gray-50 flex items-center justify-center">
            <img 
              src={product.image} 
              alt={product.title}
              className="max-h-96 object-contain"
            />
          </div>

          {/* Product Info */}
          <div className="md:w-1/2 p-8">
            <div className="uppercase text-sm font-semibold text-blue-600 mb-2">
              {product.category}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {product.title}
            </h1>
            
            {/* Rating */}
            <div className="flex items-center mb-4">
              <div className="flex items-center text-yellow-500 mr-2">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={18} 
                    fill={i < Math.round(product.rating.rate) ? "currentColor" : "none"} 
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {product.rating.rate} ({product.rating.count} reviews)
              </span>
            </div>
            
            {/* Price */}
            <div className="text-3xl font-bold text-gray-900 mb-6">
              ${product.price.toFixed(2)}
            </div>
            
            {/* Description */}
            <p className="text-gray-700 mb-6">
              {product.description}
            </p>
            
            {/* Quantity */}
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-2">Quantity</p>
              <div className="flex items-center">
                <button 
                  onClick={decrementQuantity}
                  className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-l-md hover:bg-gray-100"
                >
                  -
                </button>
                <div className="w-14 h-10 flex items-center justify-center border-t border-b border-gray-300">
                  {quantity}
                </div>
                <button 
                  onClick={incrementQuantity}
                  className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-r-md hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>
            
            {/* Add to Cart */}
            <Button
              onClick={handleAddToCart}
              variant="primary"
              size="lg"
              fullWidth
              rightIcon={<ShoppingCart size={20} />}
            >
              Add to Cart
            </Button>
            
            {/* Shop Benefits */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col items-center text-center">
                <div className="p-2 bg-blue-50 rounded-full mb-2">
                  <Truck size={20} className="text-blue-600" />
                </div>
                <p className="text-sm text-gray-700">Free Shipping</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="p-2 bg-blue-50 rounded-full mb-2">
                  <Shield size={20} className="text-blue-600" />
                </div>
                <p className="text-sm text-gray-700">Secure Payment</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="p-2 bg-blue-50 rounded-full mb-2">
                  <RotateCcw size={20} className="text-blue-600" />
                </div>
                <p className="text-sm text-gray-700">30 Days Return</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;