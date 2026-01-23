import React from 'react';
import { Product } from '../types';
import { cartAPI } from '../services/api';
import './ProjectList.css';

interface ProductListProps {
  products: Product[];
  onRefresh: () => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, onRefresh }) => {
  const handleAddToCart = async (productId: number) => {
    try {
      await cartAPI.addItem(productId, 1);
      alert('Added to cart!');
      onRefresh();
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart');
    }
  };

  return (
    <div className="project-list">
      <div className="list-header">
        <h2>Products</h2>
        <button onClick={onRefresh} className="btn-refresh">Refresh</button>
      </div>
      
      <div className="products-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            {product.image && <img src={product.image} alt={product.name} className="product-image" />}
            <div className="product-info">
              <h3>{product.name}</h3>
              {product.description && <p className="description">{product.description}</p>}
              <div className="product-details">
                <span className="price">${Number(product.price).toFixed(2)}</span>
                <span className="category">{product.category}</span>
                <span className="stock">Stock: {product.stock}</span>
              </div>
              <button 
                onClick={() => handleAddToCart(product.id)} 
                className="btn-add-cart"
                disabled={product.stock === 0}
              >
                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
