import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import EditProductModal from '../components/EditProductModal.jsx';
import { api } from '../lib/api.js';
import { formatPrice, categoryLabel } from '../lib/format.js';

const EMPTY = { name: '', price: '', site: '', image: '', url: '', gender: 'women', category: 'upper_body' };

export default function Admin() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [adding, setAdding] = useState(false);
  const [newProduct, setNewProduct] = useState(EMPTY);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.allProducts();
      setProducts(res.items);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProducts(); }, []);

  const handleAdd = async () => {
    try {
      await api.createProduct({ ...newProduct, price: Number(newProduct.price) });
      setNewProduct(EMPTY);
      setAdding(false);
      await loadProducts();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleEdit = (product) => setEditingProduct(product);

  const handleEditSaved = async () => {
    setEditingProduct(null);
    await loadProducts();
  };

  const handleDelete = (product) => setDeletingProduct(product);

  const confirmDelete = async () => {
    if (!deletingProduct) return;
    try {
      await api.deleteProduct(deletingProduct.id);
      setDeletingProduct(null);
      await loadProducts();
    } catch (e) {
      setError(e.message);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-20 text-center">
        <div className="inline-flex items-center gap-3 text-burgundy-700">
          <span className="h-2 w-2 animate-ping rounded-full bg-burgundy-700" />
          <span className="font-display text-2xl">Loading products…</span>
        </div>
      </div>
    );
  }

  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-burgundy-500">Management</p>
          <h1 className="mt-2 font-display text-4xl text-ink sm:text-5xl">
            Product <span className="italic text-burgundy-700">List</span>
          </h1>
          <p className="mt-2 text-sm text-ink/60">{products.length} products</p>
        </div>
        <button onClick={() => setAdding(!adding)} className="btn-primary">
          {adding ? 'Cancel' : '+ Add product'}
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>
      )}

      {adding && (
        <div className="card card-accent mb-6 p-6 sm:p-8">
          <h2 className="font-display text-xl text-burgundy-700 mb-4">New Product</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <label className="block col-span-2 sm:col-span-3">
              <span className="label-base">Name</span>
              <input type="text" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} className="input-base" />
            </label>
            <label className="block">
              <span className="label-base">Price ($)</span>
              <input type="number" step="0.01" min="0" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })} className="input-base" />
            </label>
            <label className="block">
              <span className="label-base">Site</span>
              <input type="text" value={newProduct.site} onChange={(e) => setNewProduct({ ...newProduct, site: e.target.value })} className="input-base" />
            </label>
            <label className="block">
              <span className="label-base">Gender</span>
              <select value={newProduct.gender} onChange={(e) => setNewProduct({ ...newProduct, gender: e.target.value })} className="input-base">
                <option value="women">women</option><option value="men">men</option>
              </select>
            </label>
            <label className="block">
              <span className="label-base">Category</span>
              <select value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} className="input-base">
                <option value="upper_body">Top</option><option value="lower_body">Bottom</option>
                <option value="outerwear">Outerwear</option><option value="dress">Dress</option>
              </select>
            </label>
            <label className="block col-span-2 sm:col-span-3">
              <span className="label-base">Image URL</span>
              <input type="url" value={newProduct.image} onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })} className="input-base" />
            </label>
            <label className="block col-span-2 sm:col-span-3">
              <span className="label-base">Product URL</span>
              <input type="url" value={newProduct.url} onChange={(e) => setNewProduct({ ...newProduct, url: e.target.value })} className="input-base" />
            </label>
          </div>
          <button onClick={handleAdd} disabled={!newProduct.name || !newProduct.image || !newProduct.url} className="btn-primary mt-4">Save product</button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-paper text-left text-[10px] uppercase tracking-widest text-ink/40">
              <th className="pb-3 pr-4">Name</th>
              <th className="pb-3 pr-4">Price</th>
              <th className="pb-3 pr-4">Site</th>
              <th className="pb-3 pr-4">Gender</th>
              <th className="pb-3 pr-4">Category</th>
              <th className="pb-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-paper/50 hover:bg-burgundy-50/30 transition-colors">
                <td className="py-3 pr-4 font-medium text-ink">{p.name}</td>
                <td className="py-3 pr-4 text-burgundy-700">{formatPrice(p.price)}</td>
                <td className="py-3 pr-4 text-ink/60 text-xs">{p.site}</td>
                <td className="py-3 pr-4 text-ink/60 text-xs">{p.gender}</td>
                <td className="py-3 pr-4 text-ink/60 text-xs">{categoryLabel(p.category)}</td>
                <td className="py-3 text-right">
                  <button onClick={() => handleEdit(p)} className="mr-2 text-xs uppercase tracking-widest text-burgundy-700 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(p)} className="text-xs uppercase tracking-widest text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <EditProductModal open={!!editingProduct} onClose={() => setEditingProduct(null)} product={editingProduct} onSaved={handleEditSaved} />

      {deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur" onClick={() => setDeletingProduct(null)}>
          <div className="card card-accent w-full max-w-sm p-6 text-center sm:p-8" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 text-2xl">!</div>
            <h2 className="mt-4 font-display text-2xl text-burgundy-700">Delete product?</h2>
            <p className="mt-2 text-sm text-ink/70">Are you sure you want to delete <strong>{deletingProduct.name}</strong>?</p>
            <div className="mt-6 flex gap-3 justify-center">
              <button onClick={() => setDeletingProduct(null)} className="btn-ghost">Cancel</button>
              <button onClick={confirmDelete} className="rounded-full bg-red-600 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-cream hover:bg-red-700 transition-all">Delete</button>
            </div>
          </div>
        </div>
      )}
    </motion.section>
  );
}
