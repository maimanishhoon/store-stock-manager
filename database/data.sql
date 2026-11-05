USE diwali_shop_db;

-- Passwords:
-- 'admin123' -> $2a$10$w6yO7xT4K4fD1w8H8fU7mOi2D4nE7kL6vJ3rF9bA8cV2eE5gH9.7W or BCrypt equivalent
-- The Spring Boot DataInitializer will encode passwords properly on launch if users don't exist.
-- Seed script for raw SQL execution:

INSERT INTO users (username, password, full_name, role) VALUES
('admin', '$2a$10$mRzL3YpTfGsqU5LwY/383.W7q.h17r/9bQeO9dK8aZ8dM0T5vE7mG', 'Counter Admin', 'ADMIN'),
('packer', '$2a$10$mRzL3YpTfGsqU5LwY/383.W7q.h17r/9bQeO9dK8aZ8dM0T5vE7mG', 'Ramesh (Packing Team)', 'PACKING_STAFF')
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

INSERT INTO categories (name, description) VALUES
('Ground Fireworks', 'Spinners, ground chakkars and rotating wheels (inventory record only)'),
('Sparklers', 'Sparkling wire sticks, color sparklers, electric sparklers'),
('Flower Pots', 'Traditional anars, fountain pots and color flower pots'),
('Decorative Lights', 'LED string lights, fairy lights, rice lights for Diwali home decoration'),
('Diwali Decorations', 'Traditional clay diyas, brass lamps, rangoli colors and stencils'),
('Gift Items', 'Diwali festive gift boxes, dry fruit hampers, sweets packs'),
('Other Products', 'Safety matchboxes, incense sticks, sparkler holders')
ON DUPLICATE KEY UPDATE description=VALUES(description);

-- Products Seed
INSERT INTO products (name, product_code, category_id, description, image_url, purchase_price, selling_price, discount_type, discount_value, final_selling_price, available_stock, reserved_stock, minimum_stock_level, product_status) VALUES
('Deluxe Ground Chakkar (10 Pcs)', 'DW-CHK-01', 1, 'Premium spinning ground wheels with bright silver spark circle.', 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=500&auto=format&fit=crop&q=60', 120.00, 220.00, 'PERCENTAGE', 10.00, 198.00, 45, 0, 10, 'ACTIVE'),
('Standard Flower Pots Anar (5 Pcs)', 'DW-FLW-01', 3, 'Golden fountain flower pot with high showering sparks.', 'https://images.unsplash.com/photo-1543807535-eceef0bc6599?w=500&auto=format&fit=crop&q=60', 150.00, 260.00, 'NONE', 0.00, 260.00, 30, 0, 8, 'ACTIVE'),
('Electric Sparklers 15cm (10 Pcs)', 'DW-SPK-01', 2, 'Safe bright electric sparks, 15cm long wire for family celebration.', 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=500&auto=format&fit=crop&q=60', 40.00, 80.00, 'NONE', 0.00, 80.00, 80, 0, 15, 'ACTIVE'),
('Color Sparklers 30cm Giant (5 Pcs)', 'DW-SPK-02', 2, 'Multi-color sparkling long sticks with green, red and gold sparks.', 'https://images.unsplash.com/photo-1576400883215-7083980b619f?w=500&auto=format&fit=crop&q=60', 80.00, 150.00, 'FIXED', 20.00, 130.00, 18, 0, 10, 'ACTIVE'),
('10m Warm White LED String Fairy Lights', 'DW-LGT-01', 4, 'Copper wire warm white fairy lights with 8 flashing modes and adapter.', 'https://images.unsplash.com/photo-1513297887119-d46091b24bfa?w=500&auto=format&fit=crop&q=60', 90.00, 199.00, 'PERCENTAGE', 15.00, 169.15, 60, 0, 12, 'ACTIVE'),
('Multicolor Rice Lights 15m', 'DW-LGT-02', 4, 'Heavy duty waterproof multicolor string light for balcony & veranda.', 'https://images.unsplash.com/photo-1545649174-8b010c284725?w=500&auto=format&fit=crop&q=60', 110.00, 240.00, 'NONE', 0.00, 240.00, 4, 0, 10, 'ACTIVE'),
('Handmade Terracotta Clay Diyas (Pack of 12)', 'DW-DEC-01', 5, 'Traditional handmade clay diyas for Diwali pooja and doorstep lighting.', 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=500&auto=format&fit=crop&q=60', 50.00, 120.00, 'FIXED', 30.00, 90.00, 120, 0, 20, 'ACTIVE'),
('Royal Brass Pooja Diya (Pair)', 'DW-DEC-02', 5, 'Pure polished brass ethnic peacock design traditional oil lamps.', 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=500&auto=format&fit=crop&q=60', 350.00, 599.00, 'NONE', 0.00, 599.00, 12, 0, 5, 'ACTIVE'),
('Premium Dry Fruits Diwali Gift Box (500g)', 'DW-GFT-01', 6, 'Assorted cashews, almonds, pistachios and raisins in golden festive box.', 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=60', 420.00, 750.00, 'PERCENTAGE', 10.00, 675.00, 25, 0, 8, 'ACTIVE'),
('Festive Sweet & Diya Gift Hamper', 'DW-GFT-02', 6, 'Includes 250g Kaju Katli, 2 decorated clay diyas and festive greeting card.', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=60', 250.00, 450.00, 'NONE', 0.00, 450.00, 3, 0, 6, 'ACTIVE'),
('Diwali Safety Matchbox Bundle (Pack of 10)', 'DW-OTH-01', 7, 'Extra-long safety wooden matchsticks for safely lighting fireworks & diyas.', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60', 25.00, 50.00, 'NONE', 0.00, 50.00, 200, 0, 25, 'ACTIVE');

-- Link Inventory Records
INSERT INTO inventory (product_id, current_stock, reserved_stock, warehouse_bin, last_replenished_at)
SELECT id, available_stock, reserved_stock, 'Shelf-D1', NOW() FROM products
ON DUPLICATE KEY UPDATE current_stock=VALUES(current_stock);

-- Initial Inventory Transactions
INSERT INTO inventory_transactions (product_id, transaction_type, quantity, previous_stock, new_stock, reason, performed_by)
SELECT id, 'ADD_STOCK', available_stock, 0, available_stock, 'Initial Opening Stock for Diwali Season', 'system'
FROM products;
