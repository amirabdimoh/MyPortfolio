import React, { useState, useEffect } from 'react';
import PasswordChange from './PasswordChange';
import './AdminDashboard.css';

interface DashboardStats {
  overview: {
    totalUsers: number;
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    avgOrderValue: number;
    completedOrders: number;
  };
  growth: {
    orders_growth: number;
    revenue_growth: number;
  };
  recentOrders: Array<{
    id: number;
    customer_name: string;
    total_amount: number;
    status: string;
    created_at: string;
  }>;
  topProducts: Array<{
    name: string;
    total_sold: number;
    revenue: number;
  }>;
  ordersByStatus: Array<{
    status: string;
    count: number;
    total_amount: number;
  }>;
  lowStockProducts: Array<{
    id: number;
    name: string;
    stock_quantity: number;
    category: string;
  }>;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }

      const data = await response.json();
      setStats(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
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

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!stats) return <div className="error">No data available</div>;

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Admin Dashboard</h1>
          <p>E-Commerce Analytics & Management</p>
        </div>
        <div className="header-actions">
          <button 
            className="password-change-btn"
            onClick={() => setShowPasswordChange(true)}
          >
            🔒 Change Password
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.overview.totalUsers.toLocaleString()}</h3>
            <p>Total Users</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>{stats.overview.totalProducts.toLocaleString()}</h3>
            <p>Total Products</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🛒</div>
          <div className="stat-content">
            <h3>{stats.overview.totalOrders.toLocaleString()}</h3>
            <p>Total Orders</p>
            <span className={`growth ${stats.growth.orders_growth >= 0 ? 'positive' : 'negative'}`}>
              {stats.growth.orders_growth >= 0 ? '+' : ''}{stats.growth.orders_growth}%
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>{formatCurrency(stats.overview.totalRevenue)}</h3>
            <p>Total Revenue</p>
            <span className={`growth ${stats.growth.revenue_growth >= 0 ? 'positive' : 'negative'}`}>
              {stats.growth.revenue_growth >= 0 ? '+' : ''}{stats.growth.revenue_growth}%
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{formatCurrency(stats.overview.avgOrderValue)}</h3>
            <p>Avg Order Value</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.overview.completedOrders.toLocaleString()}</h3>
            <p>Completed Orders</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Recent Orders */}
        <div className="dashboard-section">
          <h2>Recent Orders</h2>
          <div className="table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map(order => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{order.customer_name}</td>
                    <td>{formatCurrency(order.total_amount)}</td>
                    <td>
                      <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>{formatDate(order.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="dashboard-section">
          <h2>Top Selling Products</h2>
          <div className="products-grid">
            {stats.topProducts.map((product, index) => (
              <div key={index} className="product-card">
                <div className="product-rank">#{index + 1}</div>
                <div className="product-info">
                  <h4>{product.name}</h4>
                  <p>{product.total_sold} sold</p>
                  <p className="revenue">{formatCurrency(product.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Orders by Status */}
        <div className="dashboard-section">
          <h2>Orders by Status</h2>
          <div className="status-grid">
            {stats.ordersByStatus.map(statusData => (
              <div key={statusData.status} className="status-card">
                <div className={`status-indicator ${getStatusBadgeClass(statusData.status)}`}></div>
                <div className="status-info">
                  <h3>{statusData.count}</h3>
                  <p>{statusData.status}</p>
                  <span className="status-revenue">{formatCurrency(statusData.total_amount)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alert */}
        {stats.lowStockProducts.length > 0 && (
          <div className="dashboard-section alert-section">
            <h2>⚠️ Low Stock Alert</h2>
            <div className="low-stock-grid">
              {stats.lowStockProducts.map(product => (
                <div key={product.id} className="low-stock-item">
                  <div className="stock-info">
                    <h4>{product.name}</h4>
                    <p className="category">{product.category}</p>
                  </div>
                  <div className="stock-quantity">
                    <span className="quantity">{product.stock_quantity}</span>
                    <span className="label">left</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Password Change Modal */}
      {showPasswordChange && (
        <PasswordChange onClose={() => setShowPasswordChange(false)} />
      )}
    </div>
  );
};

export default AdminDashboard;