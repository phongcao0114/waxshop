-- MySQL-compatible initialization script
-- Converted from SQL Server syntax to MySQL syntax

-- Create tables
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    address VARCHAR(255),
    email VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    description TEXT,
    image_url VARCHAR(500),
    name VARCHAR(200) UNIQUE NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    category_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES category(id)
);

CREATE TABLE IF NOT EXISTS cart_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product (user_id, product_id)
);

CREATE TABLE IF NOT EXISTS orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    shipping_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES product(id)
);

-- Insert initial data only if not exists
-- Admin user (password: admin123)
INSERT IGNORE INTO users (
    address,
    email,
    name,
    password,
    phone,
    role
) VALUES (
    'ADDRESS',
    'admin@admin.com',
    'Admin 001',
    '$2a$10$JIw83fXfxfsrH2NpvKqjd.HUWlw6zpKuz7t5qYYEXFZ2tMouZyB/.',
    '0909090909',
    'ADMIN'
);

-- Insert category only if not exists
INSERT IGNORE INTO category (name) VALUES ('Waxworks');

-- Get the waxworks category ID
SET @waxworks_id = (SELECT id FROM category WHERE name = 'Waxworks' LIMIT 1);

-- Insert products only if not exists
INSERT IGNORE INTO product (description, image_url, name, price, stock, category_id) VALUES
    ('Bright, juicy, and playfully sweet. This fragrance glows like a peach grove at sunset—summer bottled in wax.', '/uploads/1751899312816_1peach.png', 'HOPO Golden Orchard - Peach', 19.99, 46, @waxworks_id),
    ('Elegant and poetic, this candle wraps your space in the timeless allure of blooming roses. A floral breeze to warm the heart.', '/uploads/1751899360976_1rose.png', 'HOPO Bloom Whisper - Rose', 18.99, 47, @waxworks_id),
    ('Tranquil and earthy, this scent offers a mindful escape. Green tea''s herbal calm brings peace to your senses.', '/uploads/1751899923070_1tea.png', 'HOPO Zen Leaves - Green Tea', 20.99, 47, @waxworks_id),
    ('Velvety and indulgent, this fragrance swirls with rich chocolatey warmth—like a hug made of cocoa.', '/uploads/1751900001121_1choco.png', 'HOPO Cocoa Ember - Chocolate', 18.99, 39, @waxworks_id),
    ('Fresh and breezy, this candle pulls you toward the sea with a splash of marine air and coastal serenity.', '/uploads/1751900314290_1ocean.png', 'HOPO Ocean Drift - Ocean', 19.99, 46, @waxworks_id); 