import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '../components/ProductCard.jsx';
import TryOnModal from '../components/TryOnModal.jsx';
import EditProductModal from '../components/EditProductModal.jsx';
import { useStylistStore } from '../store/useStylistStore.js';
import { api } from '../lib/api.js';
import { formatPrice, categoryLabel } from '../lib/format.js';

export default function Recommendations() {
  const navigate = useNavigate();
  const profile = useStylistStore((s) => s.profile);
  const profileComplete = useStylistStore((s) => s.profileComplete);
  const recommendation = useStylistStore((s) => s.recommendation);
  const setRecommendation = useStylistStore((s) => s.setRecommendation);
  const cart = useStylistStore((s) => s.cart);
  const addToCart = useStylistStore((s) => s.addToCart);

  const [loading, setLoading] = useState(!recommendation);
  const [error, setError] = useState(null);
  const [tryOnItems, setTryOnItems] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);

  const isInCart = (id) => cart.some((c) => c.id === id);

  const openTryOn = (items) => {
    if (!profile.photo) {
      alert('Please upload a photo on the profile page first.');
      navigate('/');
      return;
    }
    setTryOnItems(items);
  };

  const refresh = () => window.location.reload();

  const handleEdit = (product) => setEditingProduct(product);

  const handleEditSaved = async () => {
    setEditingProduct(null);
    refresh();
  };

  const handleDelete = async (product) => {
    setDeletingProduct(product);
  };

  const confirmDelete = async () => {
    if (!deletingProduct) return;
    try {
      await api.deleteProduct(deletingProduct.id);
      setDeletingProduct(null);
      refresh();
    } catch (e) {
      setError(e.message);
    }
  };

  const fetchRec = async (seed) => {
    setLoading(true);
    setError(null);
    try {
      const { photo: _, ...payload } = profile;
      const result = await api.recommend({ ...payload, ...(seed != null ? { seed } : {}) });
      setRecommendation(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!profileComplete) {
      navigate('/');
      return;
    }
    if (!recommendation) fetchRec();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!profileComplete) return null;

  if (loading || !recommendation) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-20 text-center">
        <div className="inline-flex items-center gap-3 text-burgundy-700">
          <span className="h-2 w-2 animate-ping rounded-full bg-burgundy-700" />
          <span className="font-display text-2xl">Curating your look…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <h2 className="font-display text-2xl text-burgundy-700">Something went wrong</h2>
        <p className="mt-2 text-ink/70">{error}</p>
        <button onClick={() => fetchRec()} className="btn-primary mt-6">
          Try again
        </button>
      </div>
    );
  }

  const { outfit, alternatives } = recommendation;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto max-w-6xl px-6 py-10"
    >
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-burgundy-500">Step Two</p>
          <h1 className="mt-2 font-display text-4xl text-ink sm:text-5xl">
            Your <span className="italic text-burgundy-700">curated</span> look
          </h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="chip">{profile.style}</span>
            <span className="chip">{profile.bodyType} build</span>
            <span className="chip">Up to {formatPrice(profile.budget)}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => fetchRec(Math.floor(Math.random() * 1e9))}
          className="btn-ghost"
        >
          ↻ Reshuffle
        </button>
      </div>

      <div className="card card-accent overflow-hidden">
        <div className="grid gap-0 lg:grid-cols-[1.4fr_1fr]">
          <div className="grid grid-cols-2 gap-1 bg-paper p-1 sm:grid-cols-3">
            {outfit.items.map((item) => (
              <div key={item.id} className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-cream">
                <img
                  src={item.image}
                  alt={item.name}
                  loading="eager"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
                <div className="absolute bottom-2 left-2 rounded-full bg-cream/90 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-burgundy-700">
                  {categoryLabel(item.category)}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col justify-between p-6 sm:p-8">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-burgundy-500">
                {outfit.label}
              </p>
              <h2 className="mt-2 font-display text-3xl text-ink">The complete outfit</h2>
              <ul className="mt-4 divide-y divide-paper">
                {outfit.items.map((item) => (
                  <li key={item.id} className="flex items-center justify-between py-2">
                    <div>
                      <div className="text-sm font-medium text-ink">{item.name}</div>
                      <div className="text-[11px] uppercase tracking-widest text-ink/40">
                        {item.site}
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-burgundy-700">
                      {formatPrice(item.price)}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6">
              <div className="flex items-baseline justify-between">
                <span className="text-xs uppercase tracking-widest text-ink/50">Look total</span>
                <span className="font-display text-3xl text-burgundy-700">
                  {formatPrice(outfit.total)}
                </span>
              </div>
              {!outfit.withinBudget && (
                <p className="mt-2 text-xs text-red-700">
                  This look is over your budget — try Reshuffle for a tighter fit.
                </p>
              )}
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => openTryOn(outfit.items)}
                  className="btn-ghost flex-1"
                >
                  ✨ Try on me
                </button>
                <button
                  type="button"
                  onClick={() => {
                    outfit.items.forEach((i) => {
                      if (!isInCart(i.id)) addToCart(i);
                    });
                    navigate('/cart');
                  }}
                  className="btn-primary flex-1"
                >
                  Add to cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <h3 className="font-display text-2xl text-ink">More to mix &amp; match</h3>
        <p className="text-sm text-ink/60">
          Ranked by how well they suit your profile.
        </p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {alternatives.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onAdd={addToCart}
              onTryOn={(item) => openTryOn([item])}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isInCart={isInCart(p.id)}
            />
          ))}
        </div>
      </div>

      <div className="mt-10 flex justify-end">
        <button onClick={() => navigate('/cart')} className="btn-primary">
          Go to cart →
        </button>
      </div>

      <TryOnModal
        open={!!tryOnItems}
        onClose={() => setTryOnItems(null)}
        items={tryOnItems || []}
      />

      <EditProductModal
        open={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        product={editingProduct}
        onSaved={handleEditSaved}
      />

      <AnimatePresence>
        {deletingProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeletingProduct(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur"
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="card card-accent w-full max-w-sm p-6 text-center sm:p-8"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 text-2xl">!</div>
              <h2 className="mt-4 font-display text-2xl text-burgundy-700">Delete product?</h2>
              <p className="mt-2 text-sm text-ink/70">
                Are you sure you want to delete <strong>{deletingProduct.name}</strong>?
              </p>
              <div className="mt-6 flex gap-3 justify-center">
                <button onClick={() => setDeletingProduct(null)} className="btn-ghost">Cancel</button>
                <button onClick={confirmDelete} className="rounded-full bg-red-600 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-cream hover:bg-red-700 transition-all">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
