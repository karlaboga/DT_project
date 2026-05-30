import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../lib/api.js';

export default function Admin() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    site: '',
    image: '',
    url: '',
    gender: 'women',
    category: 'upper_body',
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await api.allProducts();
      setProducts(data.items);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData, price: parseFloat(formData.price) };
      if (editingId) {
        await api.updateProduct(editingId, payload);
      } else {
        await api.createProduct(payload);
      }
      setFormData({
        name: '',
        price: '',
        site: '',
        image: '',
        url: '',
        gender: 'women',
        category: 'upper_body',
      });
      setEditingId(null);
      await loadProducts();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      price: product.price,
      site: product.site,
      image: product.image,
      url: product.url,
      gender: product.gender,
      category: product.category,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.deleteProduct(id);
      await loadProducts();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-6xl px-6 py-10"
    >
      <div className="mb-10 text-center">
        <h1 className="font-display text-4xl text-ink">Product Management</h1>
        <p className="mt-3 text-ink/60 text-xs uppercase tracking-[0.2em]">CRUD Operations for Catalog</p>
      </div>

      <div className="grid gap-10 lg:grid-cols-3">
        {/* Form Column */}
        <div className="lg:col-span-1">
          <div className="sticky top-10 rounded-3xl bg-white/40 p-6 backdrop-blur-md border border-burgundy-700/5">
            <h2 className="mb-6 font-display text-2xl text-burgundy-900">
              {editingId ? 'Edit Product' : 'Add New Product'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-ink/40 mb-1">Name</label>
                <input
                  required
                  className="w-full rounded-xl border-burgundy-100 bg-white/50 p-3 outline-none focus:border-burgundy-300"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-ink/40 mb-1">Price</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    className="w-full rounded-xl border-burgundy-100 bg-white/50 p-3 outline-none focus:border-burgundy-300"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-ink/40 mb-1">Site</label>
                  <input
                    required
                    className="w-full rounded-xl border-burgundy-100 bg-white/50 p-3 outline-none focus:border-burgundy-300"
                    value={formData.site}
                    onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-ink/40 mb-1">Image URL</label>
                <input
                  required
                  className="w-full rounded-xl border-burgundy-100 bg-white/50 p-3 outline-none focus:border-burgundy-300"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-ink/40 mb-1">Shop URL</label>
                <input
                  required
                  className="w-full rounded-xl border-burgundy-100 bg-white/50 p-3 outline-none focus:border-burgundy-300"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-ink/40 mb-1">Gender</label>
                  <select
                    className="w-full rounded-xl border-burgundy-100 bg-white/50 p-3 outline-none focus:border-burgundy-300"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-ink/40 mb-1">Category</label>
                  <select
                    className="w-full rounded-xl border-burgundy-100 bg-white/50 p-3 outline-none focus:border-burgundy-300"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="upper_body">Upper Body</option>
                    <option value="lower_body">Lower Body</option>
                    <option value="outerwear">Outerwear</option>
                    <option value="dress">Dress</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex gap-2">
                <button type="submit" disabled={loading} className="btn-primary flex-1">
                  {editingId ? 'Save Changes' : 'Create Product'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setFormData({
                        name: '',
                        price: '',
                        site: '',
                        image: '',
                        url: '',
                        gender: 'women',
                        category: 'upper_body',
                      });
                    }}
                    className="px-4 py-2 border border-ink/10 rounded-xl hover:bg-ink/5"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* List Column */}
        <div className="lg:col-span-2">
          {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100">{error}</div>}
          
          <div className="space-y-4">
            {products.map((p) => (
              <div key={p.id} className="flex items-center gap-4 bg-white/20 p-4 rounded-2xl border border-burgundy-700/5 group hover:bg-white/40 transition-colors">
                <img src={p.image} className="w-16 h-16 object-cover rounded-lg bg-cream" alt="" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-ink truncate">{p.name}</h3>
                  <p className="text-sm text-ink/60">{p.site} • ${p.price}</p>
                  <div className="flex gap-2 mt-1">
                    <span className="text-[10px] uppercase px-2 py-0.5 bg-burgundy-50 text-burgundy-700 rounded-full">{p.gender}</span>
                    <span className="text-[10px] uppercase px-2 py-0.5 bg-burgundy-50 text-burgundy-700 rounded-full">{p.category}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(p)}
                    className="p-2 hover:bg-burgundy-100 rounded-lg text-burgundy-700 transition-colors"
                    title="Edit"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5M18.364 5.636a2.121 2.121 0 113 3L12 18.364l-4.243.707.707-4.243L18.364 5.636z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition-colors"
                    title="Delete"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
