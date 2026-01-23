import React from 'react';
import { CartItem } from '../types';
import { cartAPI } from '../services/api';
import './TaskList.css';

interface CartProps {
  cart: CartItem[];
  onRefresh: () => void;
}

const Cart: React.FC<CartProps> = ({ cart, onRefresh }) => {
  const handleUpdateQuantity = async (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      await handleRemoveItem(itemId);
      return;
    }
    try {
      await cartAPI.updateItem(itemId, quantity);
      onRefresh();
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Failed to update quantity');
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      await cartAPI.removeItem(itemId);
      onRefresh();
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Failed to remove item');
    }
  };

  const handleCheckout = async () => {
    // For simplicity, just clear cart or create order
    try {
      // Assuming checkout API exists
      alert('Checkout functionality would be implemented here');
    } catch (error) {
      console.error('Error during checkout:', error);
    }
  };

  const total = cart.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);

  return (
    <div className="task-list">
      <div className="list-header">
        <h2>Shopping Cart</h2>
        <button onClick={onRefresh} className="btn-refresh">Refresh</button>
      </div>
      
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {cart.map((item) => (
              <tr key={item.id}>
                <td>
                  <strong>{item.product.name}</strong>
                  {item.product.description && <p className="description">{item.product.description}</p>}
                </td>
                <td>${Number(item.product.price).toFixed(2)}</td>
                <td>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value) || 1)}
                    className="quantity-input"
                  />
                </td>
                <td>${(Number(item.product.price) * item.quantity).toFixed(2)}</td>
                <td>
                  <button onClick={() => handleRemoveItem(item.id)} className="btn-remove">Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {cart.length > 0 && (
        <div className="cart-total">
          <h3>Total: ${total.toFixed(2)}</h3>
          <button onClick={handleCheckout} className="btn-checkout">Checkout</button>
        </div>
      )}
      
      {cart.length === 0 && (
        <div className="empty-cart">
          <p>Your cart is empty</p>
        </div>
      )}
    </div>
  );
};

export default Cart;
