export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
  department?: string;
  position?: string;
  is_active: boolean;
  email_verified: boolean;
  last_login?: string;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category: string;
  stock: number;
  rating?: number;
  reviews?: number;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  added_at: string;
}

export interface Order {
  id: number;
  user_id: number;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address?: string;
  payment_method?: string;
  created_at: string;
  updated_at: string;
}

export interface ECommerceStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  productsByCategory: Array<{ category: string; count: number }>;
  ordersByStatus: Array<{ status: string; count: number }>;
  recentOrders: Order[];
  topProducts: Product[];
}

export interface AuthResponse {
  status: string;
  token: string;
  data: {
    user: User;
  };
}

export interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}
