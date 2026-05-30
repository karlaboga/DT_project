import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api.js';

const CATEGORIES = ['upper_body', 'lower_body', 'outerwear', 'dress'];
const GENDERS = ['men', 'women'];
const STYLES = ['Casual', 'Formal', 'Business', 'Sport', 'Streetwear'];

export default function EditProductModal({ open, onClose, product, onSaved }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (product) setForm({ ...product });
  }, [product]);

  const handleChange = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const updated = await api.updateProduct(product.id, form);
      onSaved(updated);
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur"
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
            className="card card-accent w-full max-w-lg p-6 sm:p-8"
          >
            <h2 className="font-display text-2xl text-burgundy-700">Edit Product</h2>

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="label-base">Name</span>
                <input type="text" value={form.name || ''} onChange={(e) => handleChange('name', e.target.value)} className="input-base" />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="label-base">Price ($)</span>
                  <input type="number" step="0.01" min="0" value={form.price || ''} onChange={(e) => handleChange('price', Number(e.target.value))} className="input-base" />
                </label>
                <label className="block">
                  <span className="label-base">Site</span>
                  <input type="text" value={form.site || ''} onChange={(e) => handleChange('site', e.target.value)} className="input-base" />
                </label>
              </div>

              <label className="block">
                <span className="label-base">Image URL</span>
                <input type="url" value={form.image || ''} onChange={(e) => handleChange('image', e.target.value)} className="input-base" />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="label-base">Gender</span>
                  <select value={form.gender || 'women'} onChange={(e) => handleChange('gender', e.target.value)} className="input-base">
                    {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="label-base">Category</span>
                  <select value={form.category || 'upper_body'} onChange={(e) => handleChange('category', e.target.value)} className="input-base">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </label>
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">{error}</div>
              )}
            </div>

            <div className="mt-6 flex gap-3 justify-end">
              <button onClick={onClose} className="btn-ghost">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary">
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
