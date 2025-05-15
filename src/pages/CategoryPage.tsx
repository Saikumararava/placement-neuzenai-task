import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Filter, ShoppingBag } from 'lucide-react';
import { fetchProductsByCategory } from '../services/api';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import Button from '../components/ui/Button';

const CategoryPage: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOption, setSortOption] = useState('default');
  
  // Banner images for categories
  const categoryBanners: Record<string, string> = {
    'electronics': 'https://images.pexels.com/photos/1029757/pexels-photo-1029757.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'jewelery': 'https://images.pexels.com/photos/177332/pexels-photo-177332.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'men\'s clothing': 'https://images.pexels.com/photos/325876/pexels-photo-325876.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'women\'s clothing': 'https://images.pexels.com/photos/934070/pexels-photo-934070.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  };

  useEffect(() => {
    const loadProducts = async () => {
      if (!category) return;
      
      setIsLoading(true);
      try {
        const data = await fetchProductsByCategory(category);
        setProducts(data);
      } catch (error) {
        console.error(`Error loading products for category ${category}:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [category]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value);
  };

  const getSortedProducts = () => {
    if (sortOption === 'default') return products;
    
    return [...products].sort((a, b) => {
      switch (sortOption) {
        case 'price-low-high':
          return a.price - b.price;
        case 'price-high-low':
          return b.price - a.price;
        case 'rating':
          return b.rating.rate - a.rating.rate;
        default:
          return 0;
      }
    });
  };

  const sortedProducts = getSortedProducts();
  const bannerImage = category ? categoryBanners[category] : '';

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-4 text-gray-600">Loading products...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Category Banner */}
      {category && bannerImage && (
        <div className="relative h-64 md:h-80 bg-gray-900 overflow-hidden">
          <div 
            className="absolute inset-0 bg-center bg-cover opacity-70"
            style={{ backgroundImage: `url(${bannerImage})` }}
          ></div>
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          <div className="relative container mx-auto px-4 h-full flex flex-col justify-center">
            <h1 className="text-white text-3xl md:text-4xl font-bold mb-2 capitalize">
              {category.replace(/'/g, '')}
            </h1>
            <p className="text-white text-opacity-90 md:text-lg">
              Shop our collection of high-quality {category.replace(/'/g, '')}
            </p>
          </div>
        </div>
      )}
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link 
            to="/" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft size={16} />
            <span className="ml-1">Back to Home</span>
          </Link>
        </div>
        
        {products.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <ShoppingBag size={48} className="mx-auto" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No Products Found</h2>
            <p className="text-gray-600 mb-4">
              We couldn't find any products in this category.
            </p>
            <Link to="/">
              <Button>Back to Home</Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Filters and Sorting */}
            <div className="flex flex-wrap justify-between items-center mb-6">
              <p className="text-gray-600 mb-4 sm:mb-0">{products.length} products</p>
              
              <div className="ml-auto flex items-center">
                <div className="relative">
                  <select
                    value={sortOption}
                    onChange={handleSortChange}
                    className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="default">Featured</option>
                    <option value="price-low-high">Price: Low to High</option>
                    <option value="price-high-low">Price: High to Low</option>
                    <option value="rating">Best Rating</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;