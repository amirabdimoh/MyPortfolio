-- E-Commerce Database Schema
-- Run this after the main dashboard schema

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    category VARCHAR(100),
    image_url VARCHAR(500),
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cart items table
CREATE TABLE IF NOT EXISTS cart_items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    shipping_address TEXT,
    payment_method VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- Sample products data
INSERT INTO products (name, description, price, category, image_url, stock_quantity) VALUES
('Wireless Bluetooth Headphones', 'High-quality wireless headphones with noise cancellation', 199.99, 'Electronics', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', 50),
('Smart Watch Series 5', 'Latest smartwatch with health monitoring features', 349.99, 'Electronics', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', 30),
('Ergonomic Office Chair', 'Comfortable office chair with lumbar support', 299.99, 'Furniture', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400', 20),
('Coffee Maker Deluxe', 'Programmable coffee maker with thermal carafe', 89.99, 'Appliances', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400', 40),
('Yoga Mat Premium', 'Non-slip yoga mat with carrying strap', 39.99, 'Sports & Fitness', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400', 100),
('Wireless Charging Pad', 'Fast wireless charging pad compatible with all devices', 29.99, 'Electronics', 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400', 75),
('Desk Lamp LED', 'Adjustable LED desk lamp with USB charging port', 49.99, 'Office Supplies', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', 60),
('Water Bottle Stainless Steel', 'Insulated stainless steel water bottle, 32oz', 24.99, 'Sports & Fitness', 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400', 80),
('Bluetooth Speaker Portable', 'Waterproof portable Bluetooth speaker', 79.99, 'Electronics', 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400', 45),
('Notebook Set', 'Set of 3 premium notebooks with different covers', 19.99, 'Office Supplies', 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400', 120);