import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:5000/api';

const CONFIG = {
    products: { title: 'Products', fields: ['product_name', 'category_name', 'supplier_name', 'price', 'stock_quantity'], id: 'product_id' },
    suppliers: { title: 'Suppliers', fields: ['supplier_name', 'contact_number', 'address', 'email'], id: 'supplier_id' },
    users: { title: 'Users', fields: ['username', 'password', 'full_name', 'role'], id: 'user_id' },
    categories: { title: 'Categories', fields: ['category_name', 'description'], id: 'category_id' },
    purchases: { title: 'Purchases', fields: ['supplier_name', 'username', 'purchase_date', 'total_amount'], id: 'purchase_id' },
    'purchase-items': { title: 'Purchase Items', fields: ['purchase_id', 'product_id', 'quantity', 'cost_price'], id: 'purchase_item_id' },
    sales: { title: 'Sales', fields: ['username', 'sale_date', 'total_amount'], id: 'sale_id' },
    'sale-items': { title: 'Sale Items', fields: ['sale_id', 'product_id', 'quantity', 'selling_price'], id: 'sale_item_id' }
};

// --- SVG ICONS ---
const Icons = {
    Dashboard: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>,
    Products: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>,
    Suppliers: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
    Categories: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"></path><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><path d="m3.3 7 8.7 5 8.7-5"></path><path d="M12 22V12"></path></svg>,
    Transactions: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"></path><path d="m17 5-5-3-5 3"></path><path d="m17 19-5 3-5-3"></path></svg>,
    Users: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
    Plus: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
    Edit: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>,
    Trash: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>,
    Search: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
    X: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
    Menu: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
};

function App() {
    // --- STATE ---
    const [view, setView] = useState('dashboard');
    const [stats, setStats] = useState({});
    const [listData, setListData] = useState([]);
    const [formData, setFormData] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [toasts, setToasts] = useState([]);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    // --- EFFECTS ---
    useEffect(() => {
        fetchStats();
        if (view === 'dashboard') {
            fetchListData('products'); // Fetch products for low stock alerts
        } else {
            fetchListData(view);
        }
        if (view === 'products' || view === 'dashboard' || view === 'purchases') fetchAutoCompletes();
        setSearchQuery(''); // Reset search when view changes
    }, [view]);

    // --- API CALLS ---
    const fetchStats = async () => {
        try {
            const res = await axios.get(`${API_URL}/stats`);
            setStats(res.data);
        } catch (err) { addToast('Error fetching stats', 'error'); }
    };

    const fetchAutoCompletes = async () => {
        try {
            const catRes = await axios.get(`${API_URL}/categories`);
            const supRes = await axios.get(`${API_URL}/suppliers`);
            const usrRes = await axios.get(`${API_URL}/users`);
            setCategories(catRes.data);
            setSuppliers(supRes.data);
            setUsers(usrRes.data);
        } catch (err) { console.error(err); }
    };

    const fetchListData = async (key) => {
        setIsLoading(true);
        try {
            const res = await axios.get(`${API_URL}/${key}`);
            setListData(res.data);
        } catch (err) { addToast('Error fetching data', 'error'); }
        finally { setIsLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (editingId) {
                await axios.put(`${API_URL}/${view}/${editingId}`, formData);
                addToast('Item updated successfully', 'success');
            } else {
                await axios.post(`${API_URL}/${view}`, formData);
                addToast('Item created successfully', 'success');
            }
            closeModal();
            fetchListData(view);
            fetchStats();
        } catch (err) { addToast('Error saving item', 'error'); }
        finally { setIsLoading(false); }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this item?")) {
            setIsLoading(true);
            try {
                await axios.delete(`${API_URL}/${view}/${id}`);
                addToast('Item deleted successfully', 'success');
                fetchListData(view);
                fetchStats();
            } catch (err) { addToast('Error deleting item', 'error'); }
            finally { setIsLoading(false); }
        }
    };

    // --- HELPERS ---
    const addToast = (message, type = 'success') => {
        const id = Date.now();
        setToasts([...toasts, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
    };

    const openModal = (item = null) => {
        if (item) {
            setEditingId(item[CONFIG[view].id]);
            setFormData(item);
        } else {
            setEditingId(null);
            setFormData({});
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({});
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // --- COMPUTED DATA ---
    const filteredAndSortedData = useMemo(() => {
        let data = [...listData];
        
        // Filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            data = data.filter(item => 
                Object.values(item).some(val => 
                    val && val.toString().toLowerCase().includes(query)
                )
            );
        }

        // Sort
        if (sortConfig.key) {
            data.sort((a, b) => {
                const aVal = a[sortConfig.key];
                const bVal = b[sortConfig.key];
                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return data;
    }, [listData, searchQuery, sortConfig]);

    const lowStockItems = useMemo(() => {
        if (view === 'dashboard' || view === 'products') {
            const products = view === 'dashboard' ? [] : listData; // We might need to fetch all products for dashboard
            // For now, let's assume stats gives us enough or we fetch it
            return listData.filter(p => p.stock_quantity < 10);
        }
        return [];
    }, [listData, view]);

    // --- RENDER COMPONENTS ---
    const renderSidebar = () => (
        <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <div className="brand">GROCERY PRO</div>
                <button className="btn-icon" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{color: 'white'}}>
                    <Icons.Menu />
                </button>
            </div>
            <div className="nav-section">
                <div className="nav-item active" onClick={() => setView('dashboard')}>
                    <div className="nav-item-icon"><Icons.Dashboard /></div>
                    <span>Dashboard</span>
                </div>
                
                <div className="nav-label">Inventory</div>
                <NavItem id="products" icon={<Icons.Products />} label="Products" />
                <NavItem id="categories" icon={<Icons.Categories />} label="Categories" />
                <NavItem id="suppliers" icon={<Icons.Suppliers />} label="Suppliers" />
                
                <div className="nav-label">Operations</div>
                <NavItem id="purchases" icon={<Icons.Transactions />} label="Purchases" />
                <NavItem id="sales" icon={<Icons.Transactions />} label="Sales" />
                
                <div className="nav-label">System</div>
                <NavItem id="users" icon={<Icons.Users />} label="Users" />
            </div>
        </div>
    );

    const NavItem = ({ id, icon, label }) => (
        <div className={`nav-item ${view === id ? 'active' : ''}`} onClick={() => setView(id)}>
            <div className="nav-item-icon">{icon}</div>
            <span>{label}</span>
        </div>
    );

    const renderDashboard = () => (
        <div className="animate-in">
            <div className="stats-grid">
                <StatCard label="Total Revenue" value={`₱${Number(stats.revenue || 0).toLocaleString()}`} trend="+12.5% from last month" color="var(--primary)" />
                <StatCard label="Total Products" value={stats.totalProducts} trend={`${lowStockItems.length} Low Stock`} color="var(--info)" />
                <StatCard label="Active Suppliers" value={stats.totalSuppliers} trend="2 Pending" color="var(--secondary)" />
                <StatCard label="Total Sales" value={stats.totalSales} trend="+5 today" color="var(--warning)" />
            </div>

            <div className="dashboard-grid">
                <div className="data-card">
                    <div className="card-header">
                        <h2>Low Stock Alerts</h2>
                    </div>
                    <div className="modal-body" style={{padding: 0}}>
                        {lowStockItems.length > 0 ? (
                            lowStockItems.map(item => (
                                <div key={item.product_id} className="alert-item">
                                    <div className="alert-info">
                                        <h4>{item.product_name}</h4>
                                        <p>{item.category_name} • {item.supplier_name}</p>
                                    </div>
                                    <div className="badge badge-danger">{item.stock_quantity} Left</div>
                                </div>
                            ))
                        ) : (
                            <div style={{padding: '2rem', textAlign: 'center', color: 'var(--text-muted)'}}>All stock levels are healthy!</div>
                        )}
                    </div>
                </div>

                <div className="data-card">
                    <div className="card-header">
                        <h2>Quick Summary</h2>
                    </div>
                    <div className="modal-body">
                        <div className="form-group">
                            <label>Categories</label>
                            <div className="stat-value" style={{fontSize: '1.25rem'}}>{stats.totalCategories}</div>
                        </div>
                        <div className="form-group">
                            <label>System Users</label>
                            <div className="stat-value" style={{fontSize: '1.25rem'}}>{stats.totalUsers}</div>
                        </div>
                        <div className="form-group">
                            <label>Purchase Orders</label>
                            <div className="stat-value" style={{fontSize: '1.25rem'}}>{stats.totalPurchases}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const StatCard = ({ label, value, trend, color }) => (
        <div className="stat-card" style={{borderLeft: `4px solid ${color}`}}>
            <div className="stat-label">{label}</div>
            <div className="stat-value">{value}</div>
            <div className="stat-trend" style={{color: trend.includes('Low') ? 'var(--danger)' : 'var(--primary)'}}>
                {trend}
            </div>
        </div>
    );

    const renderEntityView = () => {
        const config = CONFIG[view];
        if (!config) return null;

        return (
            <div className="data-card animate-in">
                <div className="card-header">
                    <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                        <div className="search-container" style={{position: 'relative'}}>
                            <div style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)'}}>
                                <Icons.Search />
                            </div>
                            <input 
                                className="search-input" 
                                style={{paddingLeft: '36px'}}
                                placeholder={`Search ${config.title.toLowerCase()}...`} 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <button className="btn btn-primary" onClick={() => openModal()}>
                        <Icons.Plus /> Add New
                    </button>
                </div>

                <div style={{overflowX: 'auto'}}>
                    <table>
                        <thead>
                            <tr>
                                {filteredAndSortedData.length > 0 && Object.keys(filteredAndSortedData[0]).map(k => (
                                    <th key={k} onClick={() => handleSort(k)}>
                                        {k.replace('_', ' ')}
                                        {sortConfig.key === k && (sortConfig.direction === 'asc' ? ' ↑' : ' ↓')}
                                    </th>
                                ))}
                                <th style={{textAlign: 'right'}}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAndSortedData.map((item, idx) => (
                                <tr key={idx}>
                                    {Object.entries(item).map(([key, val], i) => (
                                        <td key={i}>
                                            {key.includes('price') || key.includes('amount') ? `₱${Number(val).toFixed(2)}` : 
                                             key.includes('stock') ? (
                                                 <span className={`badge ${val < 10 ? 'badge-danger' : 'badge-success'}`}>{val}</span>
                                             ) : val === null ? 'N/A' : val.toString()}
                                        </td>
                                    ))}
                                    <td style={{textAlign: 'right'}}>
                                        <div style={{display: 'flex', justifyContent: 'flex-end', gap: '4px'}}>
                                            <button className="btn-icon" onClick={() => openModal(item)} title="Edit">
                                                <Icons.Edit />
                                            </button>
                                            <button className="btn-icon danger" onClick={() => handleDelete(item[config.id])} title="Delete">
                                                <Icons.Trash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredAndSortedData.length === 0 && (
                                <tr>
                                    <td colSpan="100%" style={{textAlign: 'center', padding: '3rem', color: 'var(--text-muted)'}}>
                                        No data found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderModal = () => {
        if (!isModalOpen) return null;
        const config = CONFIG[view];

        return (
            <div className="modal-overlay" onClick={closeModal}>
                <div className="modal" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2>{editingId ? `Edit ${config.title.slice(0, -1)}` : `New ${config.title.slice(0, -1)}`}</h2>
                        <button className="btn-icon" onClick={closeModal}><Icons.X /></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <div className="form-grid" style={{gridTemplateColumns: '1fr 1fr'}}>
                                {config.fields.map(field => (
                                    <div className="form-group" key={field}>
                                        <label>{field.replace('_', ' ').toUpperCase()}</label>
                                        {field === 'category_name' ? (
                                            <>
                                                <input className="form-input" name={field} list="cat-list" value={formData[field] || ''} onChange={e => setFormData({...formData, [field]: e.target.value})} />
                                                <datalist id="cat-list">{categories.map(c => <option key={c.category_id} value={c.category_name} />)}</datalist>
                                            </>
                                        ) : field === 'supplier_name' ? (
                                            <>
                                                <input className="form-input" name={field} list="sup-list" value={formData[field] || ''} onChange={e => setFormData({...formData, [field]: e.target.value})} />
                                                <datalist id="sup-list">{suppliers.map(s => <option key={s.supplier_id} value={s.supplier_name} />)}</datalist>
                                            </>
                                        ) : field === 'username' ? (
                                            <>
                                                <input className="form-input" name={field} list="user-list" value={formData[field] || ''} onChange={e => setFormData({...formData, [field]: e.target.value})} />
                                                <datalist id="user-list">{users.map(u => <option key={u.user_id} value={u.username} />)}</datalist>
                                            </>
                                        ) : (
                                            <input 
                                                className="form-input"
                                                name={field} 
                                                type={field.includes('price') || field.includes('amount') || field.includes('quantity') || field.includes('stock') ? 'number' : field.includes('date') ? 'date' : 'text'} 
                                                step="0.01"
                                                value={formData[field] || ''} 
                                                onChange={e => setFormData({...formData, [field]: e.target.value})} 
                                                required 
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={isLoading}>
                                {isLoading ? 'Saving...' : editingId ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    return (
        <div className="app-container">
            {renderSidebar()}
            
            <main className="main-content">
                <header className="header">
                    <div className="header-title">
                        <h1>{view === 'dashboard' ? 'Overview' : CONFIG[view].title}</h1>
                        <p style={{color: 'var(--text-muted)', fontSize: '0.875rem'}}>Welcome back, Admin</p>
                    </div>
                    <div className="header-actions">
                        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                            <div style={{textAlign: 'right'}}>
                                <div style={{fontWeight: '600', fontSize: '0.875rem'}}>Admin User</div>
                                <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>Store Manager</div>
                            </div>
                            <div style={{width: '40px', height: '40px', background: 'var(--primary-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 'bold'}}>
                                AD
                            </div>
                        </div>
                    </div>
                </header>

                {view === 'dashboard' ? renderDashboard() : renderEntityView()}
            </main>

            {renderModal()}

            <div className="toast-container">
                {toasts.map(t => (
                    <div key={t.id} className={`toast ${t.type}`}>
                        {t.message}
                    </div>
                ))}
            </div>

            {isLoading && (
                <div className="loader-overlay">
                    <div className="spinner"></div>
                </div>
            )}
        </div>
    );
}

export default App;
