import React from 'react';
import { Order } from '../types';
import './Stats.css';

interface OrderListProps {
  orders: Order[];
  onRefresh: () => void;
}

const OrderList: React.FC<OrderListProps> = ({ orders, onRefresh }) => {
  return (
    <div className="stats-container">
      <div className="list-header">
        <h2>My Orders</h2>
        <button onClick={onRefresh} className="btn-refresh">Refresh</button>
      </div>
      
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
              <th>Items</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>${Number(order.total).toFixed(2)}</td>
                <td>
                  <span className={`badge badge-${order.status}`}>{order.status}</span>
                </td>
                <td>{new Date(order.created_at).toLocaleDateString()}</td>
                <td>{order.items.length} items</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {orders.length === 0 && (
        <div className="empty-orders">
          <p>No orders yet</p>
        </div>
      )}
    </div>
  );
};

export default OrderList;
