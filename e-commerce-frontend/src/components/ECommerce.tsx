import React, { useState, useEffect } from 'react';
import { User, Product, CartItem, Order } from '../types';
import { eCommerceAPI, productsAPI, cartAPI, ordersAPI } from '../services/api';
import ProductList from './ProductList';
import Cart from './Cart';
import OrderList from './OrderList';
import AdminDashboard from './AdminDashboard';
import ProductManagement from './ProductManagement';
import OrderManagement from './OrderManagement';
import './Dashboard.css';

interface ECommerceProps {
  user: User;
  onLogout: () => void;
}

type CustomerTab = 'shop' | 'cart' | 'orders';
type AdminTab = 'dashboard' | 'products' | 'orders' | 'customers' | 'analytics';

const ECommerce: React.FC<ECommerceProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<CustomerTab | AdminTab>(user.role === 'admin' ? 'dashboard' : 'shop');
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'shop') {
        const response = await productsAPI.getAll();
        setProducts(response.data.products || response.data);
      } else if (activeTab === 'cart') {
        const response = await cartAPI.getCart();
        const cartItems = response.data.items || [];
        const transformedCart = cartItems.map((item: any) => ({
          id: item.id,
          product: {
            id: item.product_id,
            name: item.name,
            price: item.price,
            image: item.image_url,
            stock: item.stock_quantity,
            category: '', // Add if needed
            description: '', // Add if needed
            rating: 0,
            reviews: 0,
            created_at: '',
            updated_at: ''
          },
          quantity: item.quantity,
          added_at: item.created_at
        }));
        setCart(transformedCart);
      } else if (activeTab === 'orders' && user.role !== 'admin') {
        const response = await ordersAPI.getAll();
        const ordersData = response.data || [];
        const transformedOrders = ordersData.map((order: any) => ({
          ...order,
          items: order.items.map((item: any) => ({
            id: item.id,
            product: {
              id: item.product_id,
              name: item.product_name,
              price: item.price,
              image: item.image_url,
              stock: 0, // Not available in order
              category: '',
              description: '',
              rating: 0,
              reviews: 0,
              created_at: '',
              updated_at: ''
            },
            quantity: item.quantity,
            added_at: order.created_at
          }))
        }));
        setOrders(transformedOrders);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderCustomerTabs = () => (
    <div className="tabs">
      <button
        className={activeTab === 'shop' ? 'active' : ''}
        onClick={() => setActiveTab('shop')}
      >
        🛍️ Shop
      </button>
      <button
        className={activeTab === 'cart' ? 'active' : ''}
        onClick={() => setActiveTab('cart')}
      >
        🛒 Cart
      </button>
      <button
        className={activeTab === 'orders' ? 'active' : ''}
        onClick={() => setActiveTab('orders')}
      >
        📦 My Orders
      </button>
    </div>
  );

  const renderAdminTabs = () => (
    <div className="tabs admin-tabs">
      <button
        className={activeTab === 'dashboard' ? 'active' : ''}
        onClick={() => setActiveTab('dashboard')}
      >
        📊 Dashboard
      </button>
      <button
        className={activeTab === 'products' ? 'active' : ''}
        onClick={() => setActiveTab('products')}
      >
        📦 Products
      </button>
      <button
        className={activeTab === 'orders' ? 'active' : ''}
        onClick={() => setActiveTab('orders')}
      >
        🚚 Orders
      </button>
      <button
        className={activeTab === 'customers' ? 'active' : ''}
        onClick={() => setActiveTab('customers')}
      >
        👥 Customers
      </button>
      <button
        className={activeTab === 'analytics' ? 'active' : ''}
        onClick={() => setActiveTab('analytics')}
      >
        📈 Analytics
      </button>
    </div>
  );

  const renderCustomerContent = () => {
    if (loading) return <div className="loading">Loading...</div>;
    
    switch (activeTab) {
      case 'shop':
        return <ProductList products={products} onRefresh={loadData} />;
      case 'cart':
        return <Cart cart={cart} onRefresh={loadData} />;
      case 'orders':
        return <OrderList orders={orders} onRefresh={loadData} />;
      default:
        return <div>Content not found</div>;
    }
  };

  const renderAdminContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'products':
        return <ProductManagement />;
      case 'orders':
        return <OrderManagement />;
      case 'customers':
        return <CustomerManagement />;
      case 'analytics':
        return <AnalyticsPanel />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <h1>🛒 E-Commerce {user.role === 'admin' ? 'Admin' : 'Store'}</h1>
        </div>
        <div className="nav-user">
          <span>{user.name}</span>
          <span className={`user-role role-${user.role}`}>{user.role}</span>
          <button onClick={onLogout} className="btn-logout">Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        {user.role === 'admin' ? renderAdminTabs() : renderCustomerTabs()}

        <div className="tab-content">
          {user.role === 'admin' ? renderAdminContent() : renderCustomerContent()}
        </div>
      </div>
    </div>
  );
};

// Customer Management Component
const CustomerManagement: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch customers');

      const data = await response.json();
      setCustomers(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: number, newRole: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });

      if (!response.ok) throw new Error('Failed to update user role');

      fetchCustomers(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) return <div className="loading">Loading customers...</div>;

  return (
    <div className="customer-management">
      <div className="management-header">
        <h1>Customer Management</h1>
        <div className="customer-stats">
          <span className="stat-item">
            Total Customers: <strong>{customers.length}</strong>
          </span>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="customers-table-container">
        <table className="customers-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Email</th>
              <th>Role</th>
              <th>Total Orders</th>
              <th>Total Spent</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(customer => (
              <tr key={customer.id}>
                <td>
                  <div className="customer-info">
                    <strong>{customer.name}</strong>
                  </div>
                </td>
                <td>{customer.email}</td>
                <td>
                  <span className={`role-badge role-${customer.role}`}>
                    {customer.role}
                  </span>
                </td>
                <td>{customer.total_orders || 0}</td>
                <td>{formatCurrency(customer.total_spent || 0)}</td>
                <td>{new Date(customer.created_at).toLocaleDateString()}</td>
                <td>
                  <select
                    value={customer.role}
                    onChange={(e) => updateUserRole(customer.id, e.target.value)}
                    className="role-select"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Analytics Panel Component
const AnalyticsPanel: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('30');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/analytics?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch analytics');

      const data = await response.json();
      setAnalytics(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading analytics...</div>;

  return (
    <div className="analytics-panel">
      <div className="analytics-header">
        <h1>Business Analytics</h1>
        <div className="period-selector">
          <label>Period:</label>
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {analytics && (
        <div className="analytics-content">
          {/* Sales Trend */}
          <div className="analytics-section">
            <h2>Sales Trend</h2>
            <div className="trend-chart">
              {analytics.salesTrend?.map((day: any, index: number) => (
                <div key={index} className="trend-item">
                  <div className="trend-date">{new Date(day.date).toLocaleDateString()}</div>
                  <div className="trend-orders">{day.orders} orders</div>
                  <div className="trend-revenue">${day.revenue}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Performance */}
          <div className="analytics-section">
            <h2>Category Performance</h2>
            <div className="category-grid">
              {analytics.categoryPerformance?.map((category: any, index: number) => (
                <div key={index} className="category-card">
                  <h3>{category.category}</h3>
                  <p>{category.items_sold} items sold</p>
                  <p>${category.revenue} revenue</p>
                  <p>{category.orders} orders</p>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Segments */}
          <div className="analytics-section">
            <h2>Customer Segments</h2>
            <div className="segments-grid">
              {analytics.customerSegments?.map((segment: any, index: number) => (
                <div key={index} className="segment-card">
                  <h3>{segment.segment}</h3>
                  <p>{segment.customer_count} customers</p>
                  <p>Avg: ${segment.avg_spent}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ECommerce;
