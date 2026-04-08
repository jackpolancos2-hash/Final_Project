const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Helper function to get or create a category/supplier ID
const resolveId = (table, idField, nameField, nameValue) => {
    return new Promise((resolve, reject) => {
        if (!nameValue) return resolve(null);
        db.query(`SELECT ${idField} FROM ${table} WHERE ${nameField} = ?`, [nameValue], (err, rows) => {
            if (err) return reject(err);
            if (rows.length > 0) resolve(rows[0][idField]);
            else {
                db.query(`INSERT INTO ${table} (${nameField}) VALUES (?)`, [nameValue], (err, result) => {
                    if (err) return reject(err);
                    resolve(result.insertId);
                });
            }
        });
    });
};

// --- DASHBOARD STATS ---
app.get('/api/stats', (req, res) => {
    const stats = {};
    const queries = [
        { key: 'totalProducts', sql: 'SELECT COUNT(*) as count FROM PRODUCT' },
        { key: 'totalSales', sql: 'SELECT COUNT(*) as count FROM SALE' },
        { key: 'revenue', sql: 'SELECT SUM(total_amount) as total FROM SALE' },
        { key: 'totalSuppliers', sql: 'SELECT COUNT(*) as count FROM SUPPLIER' },
        { key: 'totalPurchases', sql: 'SELECT COUNT(*) as count FROM PURCHASE' },
        { key: 'totalCategories', sql: 'SELECT COUNT(*) as count FROM CATEGORY' },
        { key: 'totalUsers', sql: 'SELECT COUNT(*) as count FROM USER' }
    ];

    let completed = 0;
    queries.forEach(q => {
        db.query(q.sql, (err, rows) => {
            if (q.key === 'revenue') {
                stats[q.key] = (rows && rows[0].total) || 0;
            } else {
                stats[q.key] = (rows && rows[0].count) || 0;
            }
            completed++;
            if (completed === queries.length) {
                res.json(stats);
            }
        });
    });
});

// --- GENERIC CRUD BUILDER ---
const createCrud = (route, table, idField, fields) => {
    const placeholders = fields.map(() => '?').join(', ');
    const setClause = fields.map(f => `${f} = ?`).join(', ');

    app.get(`/api/${route}`, (req, res) => {
        db.query(`SELECT * FROM ${table} ORDER BY ${idField} DESC`, (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        });
    });

    app.post(`/api/${route}`, (req, res) => {
        const values = fields.map(f => req.body[f]);
        db.query(`INSERT INTO ${table} (${fields.join(', ')}) VALUES (${placeholders})`, values, (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: results.insertId });
        });
    });

    app.put(`/api/${route}/:id`, (req, res) => {
        const values = [...fields.map(f => req.body[f]), req.params.id];
        db.query(`UPDATE ${table} SET ${setClause} WHERE ${idField} = ?`, values, (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ updated: results.affectedRows });
        });
    });

    app.delete(`/api/${route}/:id`, (req, res) => {
        db.query(`DELETE FROM ${table} WHERE ${idField} = ?`, [req.params.id], (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ deleted: results.affectedRows });
        });
    });
};

createCrud('categories', 'CATEGORY', 'category_id', ['category_name', 'description']);
createCrud('suppliers', 'SUPPLIER', 'supplier_id', ['supplier_name', 'contact_number', 'address', 'email']);
createCrud('users', 'USER', 'user_id', ['username', 'password', 'full_name', 'role']);
createCrud('purchase-items', 'PURCHASE_ITEM', 'purchase_item_id', ['purchase_id', 'product_id', 'quantity', 'cost_price']);
createCrud('sale-items', 'SALE_ITEM', 'sale_item_id', ['sale_id', 'product_id', 'quantity', 'selling_price']);

app.get('/api/purchases', (req, res) => {
    const query = `
        SELECT pu.*, s.supplier_name, u.username 
        FROM PURCHASE pu
        LEFT JOIN SUPPLIER s ON pu.supplier_id = s.supplier_id
        LEFT JOIN USER u ON pu.user_id = u.user_id
        ORDER BY pu.purchase_id DESC
    `;
    db.query(query, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/purchases', async (req, res) => {
    const { supplier_name, username, purchase_date, total_amount } = req.body;
    try {
        const supplier_id = await resolveId('SUPPLIER', 'supplier_id', 'supplier_name', supplier_name);
        const user_id = await resolveId('USER', 'user_id', 'username', username);
        db.query(`INSERT INTO PURCHASE (supplier_id, user_id, purchase_date, total_amount) 
                VALUES (?, ?, ?, ?)`, 
            [supplier_id, user_id, purchase_date, total_amount], 
            (err, results) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ id: results.insertId });
            }
        );
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/purchases/:id', async (req, res) => {
    const { supplier_name, username, purchase_date, total_amount } = req.body;
    try {
        const supplier_id = await resolveId('SUPPLIER', 'supplier_id', 'supplier_name', supplier_name);
        const user_id = await resolveId('USER', 'user_id', 'username', username);
        db.query(`UPDATE PURCHASE SET supplier_id = ?, user_id = ?, purchase_date = ?, total_amount = ? 
                WHERE purchase_id = ?`, 
            [supplier_id, user_id, purchase_date, total_amount, req.params.id], 
            (err, results) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ updated: results.affectedRows });
            }
        );
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/sales', (req, res) => {
    const query = `
        SELECT sa.*, u.username 
        FROM SALE sa
        LEFT JOIN USER u ON sa.user_id = u.user_id
        ORDER BY sa.sale_id DESC
    `;
    db.query(query, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/sales', async (req, res) => {
    const { username, sale_date, total_amount } = req.body;
    try {
        const user_id = await resolveId('USER', 'user_id', 'username', username);
        db.query(`INSERT INTO SALE (user_id, sale_date, total_amount) VALUES (?, ?, ?)`, 
            [user_id, sale_date, total_amount], 
            (err, results) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ id: results.insertId });
            }
        );
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/sales/:id', async (req, res) => {
    const { username, sale_date, total_amount } = req.body;
    try {
        const user_id = await resolveId('USER', 'user_id', 'username', username);
        db.query(`UPDATE SALE SET user_id = ?, sale_date = ?, total_amount = ? WHERE sale_id = ?`, 
            [user_id, sale_date, total_amount, req.params.id], 
            (err, results) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ updated: results.affectedRows });
            }
        );
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/products', (req, res) => {
    const query = `
        SELECT p.*, c.category_name, s.supplier_name 
        FROM PRODUCT p
        LEFT JOIN CATEGORY c ON p.category_id = c.category_id
        LEFT JOIN SUPPLIER s ON p.supplier_id = s.supplier_id
        ORDER BY p.product_id DESC
    `;
    db.query(query, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/products', async (req, res) => {
    const { product_name, category_name, supplier_name, price, stock_quantity } = req.body;
    try {
        const category_id = await resolveId('CATEGORY', 'category_id', 'category_name', category_name);
        const supplier_id = await resolveId('SUPPLIER', 'supplier_id', 'supplier_name', supplier_name);
        db.query(`INSERT INTO PRODUCT (category_id, supplier_id, product_name, price, stock_quantity) 
                VALUES (?, ?, ?, ?, ?)`, 
            [category_id, supplier_id, product_name, price, stock_quantity], 
            (err, results) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ id: results.insertId });
            }
        );
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/products/:id', async (req, res) => {
    const { product_name, category_name, supplier_name, price, stock_quantity } = req.body;
    try {
        const category_id = await resolveId('CATEGORY', 'category_id', 'category_name', category_name);
        const supplier_id = await resolveId('SUPPLIER', 'supplier_id', 'supplier_name', supplier_name);
        db.query(`UPDATE PRODUCT SET category_id = ?, supplier_id = ?, product_name = ?, price = ?, stock_quantity = ? 
                WHERE product_id = ?`, 
            [category_id, supplier_id, product_name, price, stock_quantity, req.params.id], 
            (err, results) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ updated: results.affectedRows });
            }
        );
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/products/:id', (req, res) => {
    db.query('DELETE FROM PRODUCT WHERE product_id = ?', [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ deleted: results.affectedRows });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
