const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'admin',
    password: 'admin1234'
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err.stack);
        return;
    }
    console.log('Connected to MySQL.');

    connection.query('CREATE DATABASE IF NOT EXISTS groceryinventory_db', (err) => {
        if (err) {
            console.error('Error creating database:', err);
            return;
        }

        connection.query('USE groceryinventory_db', (err) => {
            if (err) {
                console.error('Error switching database:', err);
                return;
            }

            // CATEGORY
            connection.query(`CREATE TABLE IF NOT EXISTS CATEGORY (
                category_id INT AUTO_INCREMENT PRIMARY KEY,
                category_name VARCHAR(255) NOT NULL,
                description TEXT
            )`);

            // SUPPLIER
            connection.query(`CREATE TABLE IF NOT EXISTS SUPPLIER (
                supplier_id INT AUTO_INCREMENT PRIMARY KEY,
                supplier_name VARCHAR(255) NOT NULL,
                contact_number VARCHAR(50),
                address TEXT,
                email VARCHAR(100)
            )`);

            // PRODUCT
            connection.query(`CREATE TABLE IF NOT EXISTS PRODUCT (
                product_id INT AUTO_INCREMENT PRIMARY KEY,
                category_id INT,
                supplier_id INT,
                product_name VARCHAR(255) NOT NULL,
                price DOUBLE,
                stock_quantity INT,
                FOREIGN KEY (category_id) REFERENCES CATEGORY (category_id),
                FOREIGN KEY (supplier_id) REFERENCES SUPPLIER (supplier_id)
            )`);

            // USER
            connection.query(`CREATE TABLE IF NOT EXISTS USER (
                user_id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL,
                password VARCHAR(255) NOT NULL,
                full_name VARCHAR(100),
                role VARCHAR(50)
            )`);

            // PURCHASE
            connection.query(`CREATE TABLE IF NOT EXISTS PURCHASE (
                purchase_id INT AUTO_INCREMENT PRIMARY KEY,
                supplier_id INT,
                user_id INT,
                purchase_date DATE,
                total_amount DOUBLE,
                FOREIGN KEY (supplier_id) REFERENCES SUPPLIER (supplier_id),
                FOREIGN KEY (user_id) REFERENCES USER (user_id)
            )`);

            // PURCHASE_ITEM
            connection.query(`CREATE TABLE IF NOT EXISTS PURCHASE_ITEM (
                purchase_item_id INT AUTO_INCREMENT PRIMARY KEY,
                purchase_id INT,
                product_id INT,
                quantity INT,
                cost_price DOUBLE,
                FOREIGN KEY (purchase_id) REFERENCES PURCHASE (purchase_id),
                FOREIGN KEY (product_id) REFERENCES PRODUCT (product_id)
            )`);

            // SALE
            connection.query(`CREATE TABLE IF NOT EXISTS SALE (
                sale_id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                sale_date DATE,
                total_amount DOUBLE,
                FOREIGN KEY (user_id) REFERENCES USER (user_id)
            )`);

            // SALE_ITEM
            connection.query(`CREATE TABLE IF NOT EXISTS SALE_ITEM (
                sale_item_id INT AUTO_INCREMENT PRIMARY KEY,
                sale_id INT,
                product_id INT,
                quantity INT,
                selling_price DOUBLE,
                FOREIGN KEY (sale_id) REFERENCES SALE (sale_id),
                FOREIGN KEY (product_id) REFERENCES PRODUCT (product_id)
            )`);
        });
    });
});

module.exports = connection;
