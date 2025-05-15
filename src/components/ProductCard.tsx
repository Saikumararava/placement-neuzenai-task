import React from 'react';
import { ShoppingCart, Star } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import Button from './ui/Button';
import { Card, CardBody } from './ui/Card';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  return (
    <Card className="h-full transition-all duration-200 hover:shadow-lg">
      <Link to={`/products/${product.id}`}>
        <div className="relative pt-[100%] overflow-hidden bg-gray-100">
          <img
            src={product.image}
            alt={product.title}
            className="absolute top-0 left-0 w-full h-full object-contain p-4 transition-transform duration-300 hover:scale-105"
          />
        </div>
      </Link>
      <CardBody className="flex flex-col h-[180px]">
        <div className="flex items-center mb-1">
          <div className="flex items-center text-yellow-500 mr-2">
            <Star size={16} fill="currentColor" />
            <span className="ml-1 text-sm font-medium">{product.rating.rate}</span>
          </div>
          <span className="text-xs text-gray-500">({product.rating.count} reviews)</span>
        </div>
        <Link to={`/products/${product.id}`} className="block">
          <h3 className="text-sm font-medium text-gray-800 mb-1 line-clamp-2 hover:text-blue-600 transition-colors">
            {product.title}
          </h3>
        </Link>
        <p className="text-xs text-gray-500 mb-2 line-clamp-2 flex-grow">
          {product.category}
        </p>
        <div className="mt-auto flex items-center justify-between">
          <span className="text-lg font-semibold">${product.price.toFixed(2)}</span>
          <Button
            variant="primary"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              addToCart(product, 1);
            }}
            rightIcon={<ShoppingCart size={16} />}
          >
            Add
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

export default ProductCard;