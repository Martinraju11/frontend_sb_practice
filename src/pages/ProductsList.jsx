import React, { useState, useEffect } from 'react';
import { searchProducts, createProduct } from '../api/api';
import { useDebounce } from '../hooks/useDebounce';
import { ShoppingBag, Plus, RefreshCw, AlertCircle, Tag, DollarSign, Search } from 'lucide-react';
import './UsersList.css';

export default function ProductsList() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ product: '', price: '' });
  const [submitting, setSubmitting] = useState(false);

  // Debounce the search input by 400ms
  const debouncedSearchTerm = useDebounce(searchTerm, 400);

  // Fetch products from Spring Boot backend search endpoint
  const fetchProducts = async (query) => {
    try {
      setLoading(true);
      setError(null);
      const res = await searchProducts(query);
      setProducts(res.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch products from Spring Boot search endpoint.");
    } finally {
      setLoading(false);
    }
  };

  // Trigger backend search only when debouncedSearchTerm changes
  useEffect(() => {
    fetchProducts(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.product || !newProduct.price) return;

    try {
      setSubmitting(true);
      const res = await createProduct({
        product: newProduct.product,
        price: parseInt(newProduct.price, 10)
      });
      setProducts(prev => [...prev, res.data]);
      setNewProduct({ product: '', price: '' });
      setShowAddForm(false);
    } catch (err) {
      alert("Failed to save product to PostgreSQL.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="users-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Products Showcase</h1>
          <p className="page-subtitle">Backend SQL Search + React Debouncing (`/api/products/search?name=...`)</p>
        </div>

        <div className="header-actions">
          <button onClick={() => fetchProducts(debouncedSearchTerm)} className="btn btn-secondary">
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
          <button onClick={() => setShowAddForm(!showAddForm)} className="btn btn-primary">
            <Plus size={18} />
            <span>{showAddForm ? 'Close Form' : 'Add Product'}</span>
          </button>
        </div>
      </div>

      {/* Backend Search Input Bar with Debounce */}
      <div className="filter-bar glass-card">
        <div className="search-input-container">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Type to search products via Backend SQL (400ms Debounce)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="result-count">
          {loading ? 'Searching backend...' : `Found ${products.length} matching products`}
        </div>
      </div>

      {showAddForm && (
        <div className="glass-card form-card animate-fade-in" style={{ marginBottom: '28px' }}>
          <h3>Add New Product</h3>
          <form onSubmit={handleAddProduct} style={{ display: 'flex', gap: '16px', marginTop: '16px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Product Name (e.g. Laptop)"
              value={newProduct.product}
              onChange={(e) => setNewProduct({ ...newProduct, product: e.target.value })}
              className="form-input"
              style={{ flex: 1, minWidth: '200px' }}
              required
            />
            <input
              type="number"
              placeholder="Price (e.g. 1000)"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              className="form-input"
              style={{ flex: 1, minWidth: '150px' }}
              required
            />
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Saving...' : 'Save Product'}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="state-container glass-card">
          <RefreshCw size={36} className="spin accent-icon" />
          <p>Executing PostgreSQL search query...</p>
        </div>
      ) : error ? (
        <div className="state-container error-card glass-card">
          <AlertCircle size={40} color="#f43f5e" />
          <p>{error}</p>
        </div>
      ) : products.length === 0 ? (
        <div className="state-container glass-card">
          <ShoppingBag size={40} className="text-dim" />
          <h3>No Products Found</h3>
          <p>{searchTerm ? `No products match "${searchTerm}" in PostgreSQL.` : 'Your products table is currently empty.'}</p>
        </div>
      ) : (
        <div className="users-grid">
          {products.map((p) => (
            <div key={p.id} className="user-card glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Tag size={20} color="#06b6d4" />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>{p.product}</h3>
                </div>
                <span className="detail-value font-mono">#{p.id}</span>
              </div>
              <div style={{ marginTop: '16px', fontSize: '1.4rem', fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center' }}>
                <DollarSign size={20} />
                <span>{p.price}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
