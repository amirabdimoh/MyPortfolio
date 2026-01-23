import React, { useState, useEffect } from 'react';
import './OrderManagement.css';

interface Order {
  id: number;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  status: string;
  shipping_address: string;
  payment_method: string;
  created_at: string;
  updated_at: string;
}

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingOrder, setUpdatingOrder] = useState<number | null>(null);

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: '#ffc107' },
    { value: 'processing', label: 'Processing', color: '#17a2b8' },
    { value: 'shipped', label: 'Shipped', color: '#6f42c1' },
    { value: 'delivered', label: 'Delivered', color: '#28a745' },
    { value: 'cancelled', label: 'Cancelled', color: '#dc3545' }
  ];

  useEffect(() => {
    fetchOrders();
  }, [currentPage, selectedStatus]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      });

      if (selectedStatus) {
        params.append('status', selectedStatus);
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/orders/admin/all?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    setUpdatingOrder(orderId);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update order status');
      }

      // Update the order in the local state
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus, updated_at: new Date().toISOString() }
          : order
      ));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setUpdatingOrder(null);
    }
  };

  const getStatusColor = (status: string) => {
    const statusOption = statusOptions.find(option => option.value === status);
    return statusOption ? statusOption.color : '#6c757d';
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'processing': return 'status-processing';
      case 'shipped': return 'status-shipped';
      case 'delivered': return 'status-delivered';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNextStatus = (currentStatus: string): string | null => {
    const statusFlow = {
      'pending': 'processing',
      'processing': 'shipped',
      'shipped': 'delivered'
    };
    return statusFlow[currentStatus as keyof typeof statusFlow] || null;
  };

  if (loading) return <div className="loading">Loading orders...</div>;

  return (
    <div className="order-management">
      <div className="management-header">
        <h1>Order Management</h1>
        <div className="order-stats">
          <span className="stat-item">
            Total Orders: <strong>{orders.length}</strong>
          </span>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Filter by Status:</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="filter-select"
          >
            <option value="">All Statuses</option>
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="status-legend">
          {statusOptions.map(option => (
            <div key={option.value} className="legend-item">
              <div 
                className="legend-color" 
                style={{ backgroundColor: option.color }}
              ></div>
              <span>{option.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Created</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>
                  <strong>#{order.id}</strong>
                </td>
                <td>
                  <div className="customer-info">
                    <div className="customer-name">{order.customer_name}</div>
                    <div className="customer-email">{order.customer_email}</div>
                  </div>
                </td>
                <td className="amount">
                  {formatCurrency(order.total_amount)}
                </td>
                <td>
                  <span 
                    className={`status-badge ${getStatusBadgeClass(order.status)}`}
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {order.status}
                  </span>
                </td>
                <td>
                  <span className="payment-method">{order.payment_method}</span>
                </td>
                <td className="date">
                  {formatDate(order.created_at)}
                </td>
                <td className="date">
                  {formatDate(order.updated_at)}
                </td>
                <td>
                  <div className="action-buttons">
                    {/* Quick status update buttons */}
                    {getNextStatus(order.status) && (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => updateOrderStatus(order.id, getNextStatus(order.status)!)}
                        disabled={updatingOrder === order.id}
                      >
                        {updatingOrder === order.id ? '...' : `Mark ${getNextStatus(order.status)}`}
                      </button>
                    )}
                    
                    {/* Cancel button for non-delivered orders */}
                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => updateOrderStatus(order.id, 'cancelled')}
                        disabled={updatingOrder === order.id}
                      >
                        Cancel
                      </button>
                    )}

                    {/* Custom status dropdown */}
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      disabled={updatingOrder === order.id}
                      className="status-select"
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {orders.length === 0 && (
          <div className="no-orders">
            <p>No orders found.</p>
          </div>
        )}
      </div>

      {/* Order Details Modal could be added here */}
      
      {/* Pagination could be added here */}
    </div>
  );
};

export default OrderManagement;