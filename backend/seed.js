const db = require('./db');

// Use a small delay to ensure database and tables are created before seeding
// (Since the table creation in db.js is also asynchronous)
setTimeout(() => {
    // Insert Categories
    db.query("INSERT INTO CATEGORY (category_name, description) VALUES ('Fruits', 'Fresh organic fruits')");
    db.query("INSERT INTO CATEGORY (category_name, description) VALUES ('Dairy', 'Milk and milk products')");
    db.query("INSERT INTO CATEGORY (category_name, description) VALUES ('Bakery', 'Bread and pastries')");

    // Insert Suppliers
    db.query("INSERT INTO SUPPLIER (supplier_name, contact_number, address, email) VALUES ('Fresh Farms', '123-456', 'Farm Rd', 'fresh@farms.com')");
    db.query("INSERT INTO SUPPLIER (supplier_name, contact_number, address, email) VALUES ('Dairy Delight', '789-012', 'Dairy Ln', 'info@dairy.com')");

    // Insert Products
    db.query("INSERT INTO PRODUCT (category_id, supplier_id, product_name, price, stock_quantity) VALUES (1, 1, 'Apple', 0.5, 100)");
    db.query("INSERT INTO PRODUCT (category_id, supplier_id, product_name, price, stock_quantity) VALUES (2, 2, 'Milk', 2.5, 50)");
    db.query("INSERT INTO PRODUCT (category_id, supplier_id, product_name, price, stock_quantity) VALUES (3, 1, 'Bread', 1.2, 30)");

    console.log("Database seeded successfully.");
}, 2000);
