import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Filter, Search as SearchIcon, X } from 'lucide-react';
import { searchProducts } from '../services/api';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const SearchPage: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialQuery = queryParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Track original products for filtering
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!initialQuery) return;
      
      setIsLoading(true);
      try {
        const results = await searchProducts(initialQuery);
        setProducts(results);
        setAllProducts(results);
        
        // Extract unique categories
        const categories = [...new Set(results.map(product => product.category))];
        setAvailableCategories(categories);
        
        // Find min and max price for range filter
        if (results.length > 0) {
          const prices = results.map(product => product.price);
          const minPrice = Math.floor(Math.min(...prices));
          const maxPrice = Math.ceil(Math.max(...prices));
          setPriceRange([minPrice, maxPrice]);
        }
      } catch (error) {
        console.error('Error searching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults();
  }, [initialQuery]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      const results = await searchProducts(searchQuery);
      setProducts(results);
      setAllProducts(results);
      
      // Update URL without reloading the page
      const newUrl = `${window.location.pathname}?q=${encodeURIComponent(searchQuery.trim())}`;
      window.history.pushState({ path: newUrl }, '', newUrl);
      
      // Extract unique categories
      const categories = [...new Set(results.map(product => product.category))];
      setAvailableCategories(categories);
      
      // Reset filters
      setSelectedCategories([]);
    } catch (error) {
      console.error('Error searching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(cat => cat !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = parseInt(e.target.value);
    setPriceRange(prev => {
      const newRange = [...prev] as [number, number];
      newRange[index] = value;
      return newRange;
    });
  };

  const applyFilters = () => {
    let filtered = [...allProducts];
    
    // Apply category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(product => selectedCategories.includes(product.category));
    }
    
    // Apply price filter
    filtered = filtered.filter(
      product => product.price >= priceRange[0] && product.price <= priceRange[1]
    );
    
    setProducts(filtered);
    setShowFilters(false);
  };

  const resetFilters = () => {
    setSelectedCategories([]);
    
    // Reset price range to original
    const prices = allProducts.map(product => product.price);
    const minPrice = prices.length > 0 ? Math.floor(Math.min(...prices)) : 0;
    const maxPrice = prices.length > 0 ? Math.ceil(Math.max(...prices)) : 1000;
    setPriceRange([minPrice, maxPrice]);
    
    setProducts(allProducts);
  };

  const [minPrice, maxPrice] = priceRange;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {initialQuery ? `Search Results for "${initialQuery}"` : 'Search Products'}
      </h1>
      
      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-8 max-w-xl">
        <div className="flex">
          <Input
            type="search"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            leftIcon={<SearchIcon size={18} />}
            className="rounded-r-none"
          />
          <Button type="submit" className="rounded-l-none">
            Search
          </Button>
        </div>
      </form>
      
      {isLoading ? (
        <div className="text-center py-16">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-gray-600">Searching...</p>
        </div>
      ) : (
        <div className="lg:flex gap-8">
          {/* Filters - Desktop */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold">Filters</h2>
                <button 
                  className="text-sm text-blue-600 hover:text-blue-800"
                  onClick={resetFilters}
                >
                  Reset All
                </button>
              </div>
              
              {/* Categories */}
              <div className="mb-6">
                <h3 className="font-medium mb-2">Categories</h3>
                <div className="space-y-2">
                  {availableCategories.map(category => (
                    <label key={category} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => handleCategoryChange(category)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm capitalize">
                        {category.replace(/'/g, '')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Price Range */}
              <div>
                <h3 className="font-medium mb-2">Price Range</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">${minPrice}</span>
                    <span className="text-sm text-gray-600">${maxPrice}</span>
                  </div>
                  <input
                    type="range"
                    min={Math.min(...allProducts.map(p => p.price))}
                    max={Math.max(...allProducts.map(p => p.price))}
                    value={minPrice}
                    onChange={e => handlePriceChange(e, 0)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <input
                    type="range"
                    min={Math.min(...allProducts.map(p => p.price))}
                    max={Math.max(...allProducts.map(p => p.price))}
                    value={maxPrice}
                    onChange={e => handlePriceChange(e, 1)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div>
                    <Button onClick={applyFilters} fullWidth>
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Mobile Filter Button */}
          <div className="lg:hidden mb-4">
            <Button
              variant="outline"
              onClick={() => setShowFilters(true)}
              leftIcon={<Filter size={16} />}
            >
              Filters
            </Button>
          </div>
          
          {/* Mobile Filter Modal */}
          {showFilters && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center lg:hidden">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-auto m-4">
                <div className="flex justify-between items-center p-4 border-b">
                  <h2 className="font-bold">Filters</h2>
                  <button onClick={() => setShowFilters(false)}>
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>
                
                <div className="p-4">
                  {/* Categories */}
                  <div className="mb-6">
                    <h3 className="font-medium mb-2">Categories</h3>
                    <div className="space-y-2">
                      {availableCategories.map(category => (
                        <label key={category} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(category)}
                            onChange={() => handleCategoryChange(category)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm capitalize">
                            {category.replace(/'/g, '')}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  {/* Price Range */}
                  <div>
                    <h3 className="font-medium mb-2">Price Range</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">${minPrice}</span>
                        <span className="text-sm text-gray-600">${maxPrice}</span>
                      </div>
                      <input
                        type="range"
                        min={Math.min(...allProducts.map(p => p.price))}
                        max={Math.max(...allProducts.map(p => p.price))}
                        value={minPrice}
                        onChange={e => handlePriceChange(e, 0)}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <input
                        type="range"
                        min={Math.min(...allProducts.map(p => p.price))}
                        max={Math.max(...allProducts.map(p => p.price))}
                        value={maxPrice}
                        onChange={e => handlePriceChange(e, 1)}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border-t flex space-x-4">
                  <Button 
                    variant="outline" 
                    onClick={resetFilters}
                    fullWidth
                  >
                    Reset
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={applyFilters}
                    fullWidth
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {/* Search Results */}
          <div className="flex-grow">
            {products.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-gray-400 mb-4">
                  <SearchIcon size={48} className="mx-auto" />
                </div>
                <h2 className="text-xl font-semibold mb-2">No Products Found</h2>
                <p className="text-gray-600 mb-4">
                  We couldn't find any products matching your search.
                </p>
                <Link to="/products">
                  <Button>Browse All Products</Button>
                </Link>
              </div>
            ) : (
              <>
                <p className="mb-4 text-gray-600">{products.length} products found</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;