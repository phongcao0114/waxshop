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
    is_active BOOLEAN DEFAULT TRUE,
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
    dimensions VARCHAR(100),
    weight VARCHAR(50),
    size VARCHAR(50),
    material VARCHAR(100),
    product_use VARCHAR(50),
    warranty VARCHAR(100),
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
    role,
    is_active
) VALUES (
    'ADDRESS',
    'admin@admin.com',
    'Admin 001',
    '$2a$10$JIw83fXfxfsrH2NpvKqjd.HUWlw6zpKuz7t5qYYEXFZ2tMouZyB/.',
    '0909090909',
    'ADMIN',
    TRUE
);

-- Insert category only if not exists
INSERT IGNORE INTO category (name) VALUES ('Statue');

-- Get the waxworks category ID
SET @statue_id = (SELECT id FROM category WHERE name = 'Statue' LIMIT 1);

-- Insert products only if not exists
INSERT IGNORE INTO product (description, image_url, name, price, stock, category_id, dimensions, weight, size, material, product_use, warranty) VALUES
    ('Romantic elegance, where the grace of Athens meets the heart of Paris. A muse for every lover of beauty.', '/uploads/1.png', 'Venus in Paris', 249.99, 50, @statue_id, 'Portrait statue', '15 kg', '30 x 20 x 45 cm', 'Marble', 'Indoor', '2 years'),
    ('A tribute to the timeless allure of Greek goddesses, sculpted with the soul of Paris. Marble curves, eternal romance.', '/uploads/2.png', 'Aphrodites Grace', 299.99, 50, @statue_id, 'Portrait statue', '18 kg', '35 x 25 x 50 cm', 'Stone', 'Indoor', '3 years'),
    ('Inspired by the marble masterpieces of ancient Europe, reimagined for the city of love. Where myth meets midnight', '/uploads/3.png', 'Muse of the Seine', 199.99, 50, @statue_id, 'Portrait statue', '12 kg', '25 x 15 x 40 cm', 'Marble', 'Outdoor', '1 year'); 